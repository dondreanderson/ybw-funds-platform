import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Import all services first
import { UserService } from './userService';
import { AssessmentEngine } from './assessmentEngine';
import { SimpleAssessmentService } from './simpleAssessment';
import { EnhancedDatabaseService } from './enhancedDatabaseService';
import { realAssessmentService } from './realAssessmentService';

// Export all services
export { UserService } from './userService';
export { AssessmentEngine } from './assessmentEngine';
export { SimpleAssessmentService } from './simpleAssessment';
export { EnhancedDatabaseService } from './enhancedDatabaseService';
export { realAssessmentService } from './realAssessmentService';

// Export types
export type * from '@/lib/types/core';

// Service factory functions
export function createUserService() {
  return UserService;
}

export function createAssessmentEngine() {
  return AssessmentEngine;
}

// React hooks for services
export function useUserService() {
  const [service] = useState(() => UserService);
  return service;
}

export function useAssessmentEngine() {
  const [service] = useState(() => AssessmentEngine);
  return service;
}

// Utility functions
export async function initializeServices() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return {
      authenticated: !!user,
      user,
      services: {
        userService: UserService,
        assessmentEngine: AssessmentEngine,
        simpleAssessment: SimpleAssessmentService
      }
    };
  } catch (error) {
    return {
      authenticated: false,
      user: null,
      services: null,
      error
    };
  }
}