import { 
  Configuration, 
  PlaidApi, 
  PlaidEnvironments, 
  CountryCode, 
  Products,
  DepositoryAccountSubtype // Add this import
} from 'plaid'

// Plaid configuration
const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'production' 
    ? PlaidEnvironments.production 
    : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})

const plaidClient = new PlaidApi(configuration)

export interface BankAccount {
  account_id: string
  name: string
  type: string
  subtype: string
  mask: string
  balance: {
    available: number | null
    current: number
    iso_currency_code: string
  }
}

export interface BankTransaction {
  account_id: string
  transaction_id: string
  amount: number
  date: string
  name: string
  category: string[]
  merchant_name?: string
}

export interface PlaidLinkToken {
  link_token: string
  expiration: string
}

export class PlaidService {
  
  // Create link token for Plaid Link
 async createLinkToken(userId: string): Promise<PlaidLinkToken> {
    try {
      const request = {
        user: {
          client_user_id: userId,
        },
        client_name: 'YBW Funds Platform',
        products: [Products.Transactions, Products.Auth, Products.Identity],
        country_codes: [CountryCode.Us],
        language: 'en' as const,
        webhook: `${process.env.NEXTAUTH_URL}/api/webhooks/plaid`,
        account_filters: {
          depository: {
            account_subtypes: [
              DepositoryAccountSubtype.Checking,
              DepositoryAccountSubtype.Savings,
              DepositoryAccountSubtype.MoneyMarket,
              DepositoryAccountSubtype.Cd
            ]
          }
        }
      }

      const response = await plaidClient.linkTokenCreate(request)
      
      return {
        link_token: response.data.link_token,
        expiration: response.data.expiration
      }
    } catch (error) {
      console.error('Error creating Plaid link token:', error)
      throw new Error('Failed to create bank connection token')
    }
  }

  // Exchange public token for access token
  async exchangePublicToken(publicToken: string): Promise<string> {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken
      })
      
      return response.data.access_token
    } catch (error) {
      console.error('Error exchanging public token:', error)
      throw new Error('Failed to establish bank connection')
    }
  }

  // Get bank accounts
  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    try {
      const response = await plaidClient.accountsGet({
        access_token: accessToken
      })

      return response.data.accounts.map(account => ({
        account_id: account.account_id,
        name: account.name,
        type: account.type,
        subtype: account.subtype || '',
        mask: account.mask || '',
        balance: {
          available: account.balances.available,
          current: account.balances.current || 0,
          iso_currency_code: account.balances.iso_currency_code || 'USD'
        }
      }))
    } catch (error) {
      console.error('Error fetching accounts:', error)
      throw new Error('Failed to fetch bank accounts')
    }
  }

  // Get transactions
  async getTransactions(
    accessToken: string, 
    startDate: string, 
    endDate: string
  ): Promise<BankTransaction[]> {
    try {
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate
      })

      return response.data.transactions.map(transaction => ({
        account_id: transaction.account_id,
        transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        date: transaction.date,
        name: transaction.name,
        category: transaction.category || [],
        merchant_name: transaction.merchant_name || undefined
      }))
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw new Error('Failed to fetch bank transactions')
    }
  }

  // Calculate business metrics from transactions
  async calculateBusinessMetrics(
    accessToken: string,
    months: number = 12
  ): Promise<{
    averageMonthlyRevenue: number
    averageMonthlyExpenses: number
    cashFlow: number
    revenueGrowth: number
    expenseRatio: number
  }> {
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      const transactions = await this.getTransactions(accessToken, startDate, endDate)
      
      // Categorize transactions
      const revenues = transactions.filter(t => 
        t.amount < 0 && // Plaid uses negative for credits
        (t.category.includes('Deposit') || 
         t.category.includes('Transfer') ||
         t.name.toLowerCase().includes('payment'))
      )

      const expenses = transactions.filter(t => 
        t.amount > 0 && // Positive for debits
        !t.category.includes('Transfer')
      )

      // Calculate metrics
      const totalRevenue = Math.abs(revenues.reduce((sum, t) => sum + t.amount, 0))
      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
      
      const averageMonthlyRevenue = totalRevenue / months
      const averageMonthlyExpenses = totalExpenses / months
      const cashFlow = averageMonthlyRevenue - averageMonthlyExpenses
      
      // Calculate growth (simplified)
      const recentRevenue = Math.abs(revenues
        .filter(t => new Date(t.date) > new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, t) => sum + t.amount, 0)) / 3

      const olderRevenue = Math.abs(revenues
        .filter(t => new Date(t.date) < new Date(Date.now() - 9 * 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, t) => sum + t.amount, 0)) / 3

      const revenueGrowth = olderRevenue > 0 ? 
        ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0

      const expenseRatio = averageMonthlyRevenue > 0 ? 
        (averageMonthlyExpenses / averageMonthlyRevenue) * 100 : 0

      return {
        averageMonthlyRevenue,
        averageMonthlyExpenses,
        cashFlow,
        revenueGrowth,
        expenseRatio
      }
    } catch (error) {
      console.error('Error calculating business metrics:', error)
      throw new Error('Failed to calculate business metrics')
    }
  }
}

export const plaidService = new PlaidService()
