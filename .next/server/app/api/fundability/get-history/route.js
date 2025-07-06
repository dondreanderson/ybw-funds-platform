(()=>{var e={};e.id=225,e.ids=[225],e.modules={20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},32615:e=>{"use strict";e.exports=require("http")},35240:e=>{"use strict";e.exports=require("https")},98216:e=>{"use strict";e.exports=require("net")},68621:e=>{"use strict";e.exports=require("punycode")},76162:e=>{"use strict";e.exports=require("stream")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},71568:e=>{"use strict";e.exports=require("zlib")},58359:()=>{},93739:()=>{},14922:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>_,patchFetch:()=>f,requestAsyncStorage:()=>d,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>p});var s={};r.r(s),r.d(s,{GET:()=>u});var o=r(49303),a=r(88716),n=r(60670),i=r(87070);let l=(0,r(72438).eI)("https://fzvtzzzsoccptvgihxfl.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY);async function u(e){try{let{searchParams:t}=new URL(e.url),r=t.get("userId"),s=parseInt(t.get("limit")||"10"),o=parseInt(t.get("offset")||"0"),a="true"===t.get("includeDetails");if(!r)return i.NextResponse.json({error:"User ID is required"},{status:400});let{data:n,error:u}=await l.from("score_history").select(`
        id,
        overall_score,
        category_scores,
        assessment_date,
        score_change,
        created_at,
        assessment_id
      `).eq("user_id",r).order("assessment_date",{ascending:!1}).range(o,o+s-1);if(u)return console.error("Score history error:",u),i.NextResponse.json({error:"Failed to fetch score history"},{status:500});let{data:c,error:d}=await l.from("assessment_analytics").select(`
        assessment_date,
        overall_score,
        improvement_from_last,
        industry_percentile,
        time_spent_minutes,
        categories_completed,
        total_categories
      `).eq("user_id",r).order("assessment_date",{ascending:!1}).limit(30);d&&console.error("Analytics error:",d);let p=c?function(e){if(!e||e.length<2)return null;let t=e.map(e=>e.overall_score).filter(Boolean),r=e.map(e=>e.improvement_from_last).filter(Boolean);return{averageScore:t.reduce((e,t)=>e+t,0)/t.length,totalImprovement:r.reduce((e,t)=>e+t,0),assessmentCount:e.length,latestScore:t[0]||0,scoreRange:{min:Math.min(...t),max:Math.max(...t)},averageCompletionTime:e.map(e=>e.time_spent_minutes).filter(Boolean).reduce((e,t)=>e+t,0)/e.length||0}}(c):null,m=null;if(a&&n){let e=n.map(e=>e.assessment_id).filter(Boolean);if(e.length>0){let{data:t,error:o}=await l.from("fundability_assessments").select(`
            id,
            business_name,
            criteria_scores,
            score,
            recommendations,
            status,
            created_at,
            assessment_data
          `).in("id",e);o||(m=t);let{data:a,error:n}=await l.from("advanced_fundability_assessments").select(`
            id,
            overall_score,
            category_scores,
            completion_percentage,
            recommendations,
            created_at,
            assessment_version,
            status
          `).eq("user_id",r).order("created_at",{ascending:!1}).limit(s);!n&&a&&(m=[...m||[],...a.map(e=>({...e,assessment_type:"advanced"}))])}}let{data:_,error:f}=await l.from("user_profiles").select(`
        fundability_score,
        last_assessment_date,
        assessment_count,
        business_name
      `).eq("id",r).single();f&&console.error("Profile error:",f);let g=function(e){if(!e||e.length<2)return{totalImprovement:0,averageImprovement:0,bestScore:e?.[0]?.overall_score||0,improvementTrend:"stable"};let t=e.map(e=>e.overall_score).reverse(),r=[];for(let e=1;e<t.length;e++)r.push(t[e]-t[e-1]);let s=t[t.length-1]-t[0],o=r.reduce((e,t)=>e+t,0)/r.length,a=r.slice(-3).reduce((e,t)=>e+t,0)/Math.min(3,r.length);return{totalImprovement:s,averageImprovement:o,bestScore:Math.max(...t),improvementTrend:a>2?"improving":a<-2?"declining":"stable",consecutiveImprovements:function(e){let t=0;for(let r=e.length-1;r>=0;r--)if(e[r]>0)t++;else break;return t}(r),scoreVolatility:function(e){if(e.length<2)return 0;let t=e.reduce((e,t)=>e+t,0)/e.length;return Math.sqrt(e.reduce((e,r)=>e+Math.pow(r-t,2),0)/e.length)}(t)}}(n||[]);return i.NextResponse.json({success:!0,data:{scoreHistory:n||[],analytics:c||[],trendData:p,detailedAssessments:m,userProfile:_||null,improvementStats:g,pagination:{limit:s,offset:o,total:n?.length||0,hasMore:(n?.length||0)===s}}})}catch(e){return console.error("Get history error:",e),i.NextResponse.json({error:"Internal server error"},{status:500})}}let c=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/fundability/get-history/route",pathname:"/api/fundability/get-history",filename:"route",bundlePath:"app/api/fundability/get-history/route"},resolvedPagePath:"C:\\Users\\dondr\\ybw-funds-platform\\ybw-funds-platform\\src\\app\\api\\fundability\\get-history\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:p,serverHooks:m}=c,_="/api/fundability/get-history/route";function f(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:p})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[276,972,438],()=>r(14922));module.exports=s})();