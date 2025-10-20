import { z } from 'zod';

/**
 * Auth 관련 Zod 스키마
 */

// OAuth 로그인 요청
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'OAuth code is required'),
  state: z.string().optional(),
});

// 토큰 갱신 요청
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// 로그아웃 요청
export const logoutSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
});

// 로그인 응답
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    englishName: z.string().optional(),
    onboardingCompleted: z.boolean(),
  }),
  provider: z.string(),
});

// Type exports
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
