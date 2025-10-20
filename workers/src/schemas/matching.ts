import { z } from 'zod';

/**
 * Matching 관련 Zod 스키마
 */

// 매칭 프로필 스키마
export const matchingProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  preferredGender: z.enum(['any', 'male', 'female']).optional(),
  preferredAgeMin: z.number().int().min(13).max(100).optional(),
  preferredAgeMax: z.number().int().min(13).max(100).optional(),
  preferredCountries: z.array(z.string()).optional(),
  preferredInterests: z.array(z.string()).optional(),
  autoMatchEnabled: z.boolean().default(true),
  maxPartners: z.number().int().min(1).max(10).default(5),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 매칭 요청 생성
export const createMatchRequestSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
  message: z.string().max(200, 'Message must be less than 200 characters').optional(),
});

// 매칭 요청 응답
export const matchRequestResponseSchema = z.object({
  accept: z.boolean(),
  message: z.string().max(200).optional(),
});

// 매칭 필터
export const matchFilterSchema = z.object({
  gender: z.enum(['any', 'male', 'female']).optional(),
  ageMin: z.number().int().min(13).max(100).optional(),
  ageMax: z.number().int().min(13).max(100).optional(),
  countries: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  online: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

// 매칭 설정 업데이트
export const updateMatchingPreferencesSchema = z.object({
  preferredGender: z.enum(['any', 'male', 'female']).optional(),
  preferredAgeMin: z.number().int().min(13).max(100).optional(),
  preferredAgeMax: z.number().int().min(13).max(100).optional(),
  preferredCountries: z.array(z.string()).optional(),
  preferredInterests: z.array(z.string()).optional(),
  autoMatchEnabled: z.boolean().optional(),
  maxPartners: z.number().int().min(1).max(10).optional(),
}).refine(
  (data) => {
    if (data.preferredAgeMin && data.preferredAgeMax) {
      return data.preferredAgeMin <= data.preferredAgeMax;
    }
    return true;
  },
  { message: 'Min age must be less than or equal to max age' }
);

// Type exports
export type MatchingProfile = z.infer<typeof matchingProfileSchema>;
export type CreateMatchRequestInput = z.infer<typeof createMatchRequestSchema>;
export type MatchRequestResponseInput = z.infer<typeof matchRequestResponseSchema>;
export type MatchFilter = z.infer<typeof matchFilterSchema>;
export type UpdateMatchingPreferencesInput = z.infer<typeof updateMatchingPreferencesSchema>;
