import { z } from 'zod';

/**
 * User 관련 Zod 스키마
 */

// 사용자 프로필 스키마
export const userProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  englishName: z.string().optional(),
  nickname: z.string().optional(),
  profileImageUrl: z.string().url().optional().nullable(),
  intro: z.string().max(500, 'Introduction must be less than 500 characters').optional(),
  residence: z.string().optional(),
  nativeLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  isOnline: z.boolean().default(false),
  lastSeenAt: z.string().datetime().optional().nullable(),
  onboardingCompleted: z.boolean().default(false),
  onboardingStep: z.number().int().min(0).max(5).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 프로필 업데이트 요청
export const updateProfileSchema = z.object({
  englishName: z.string().min(1).max(50).optional(),
  nickname: z.string().min(2).max(20).optional(),
  intro: z.string().max(500).optional(),
  residence: z.string().max(100).optional(),
  nativeLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

// 온보딩 Step 1: 기본 정보
export const onboardingStep1Schema = z.object({
  englishName: z.string().min(1, 'English name is required').max(50),
  residence: z.string().min(1, 'Residence is required').max(100),
});

// 온보딩 Step 2: 언어 정보
export const onboardingStep2Schema = z.object({
  nativeLanguage: z.string().min(1, 'Native language is required'),
  targetLanguage: z.string().min(1, 'Target language is required'),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

// 온보딩 Step 3: 자기소개
export const onboardingStep3Schema = z.object({
  intro: z.string().min(10, 'Introduction must be at least 10 characters').max(500),
});

// 온보딩 Step 4: 관심사
export const onboardingStep4Schema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least one interest').max(10),
});

// 프로필 이미지 업로드
export const profileImageUploadSchema = z.object({
  imageData: z.string(), // Base64 encoded image
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileName: z.string().optional(),
});

// Type exports
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4Input = z.infer<typeof onboardingStep4Schema>;
export type ProfileImageUploadInput = z.infer<typeof profileImageUploadSchema>;
