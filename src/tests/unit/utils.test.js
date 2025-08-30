import { describe, test, expect } from 'vitest';

// 유틸리티 함수들을 테스트
describe('Utility Functions', () => {
  test('날짜 포맷 함수 테스트', () => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR');
    };

    expect(formatDate('2024-01-01')).toBe('2024. 1. 1.');
    expect(formatDate('2023-12-25')).toBe('2023. 12. 25.');
  });

  test('문자열 검증 함수 테스트', () => {
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('배열 유틸리티 함수 테스트', () => {
    const getUniqueItems = (arr) => [...new Set(arr)];
    
    expect(getUniqueItems([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    expect(getUniqueItems(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    expect(getUniqueItems([])).toEqual([]);
  });

  test('숫자 포맷 함수 테스트', () => {
    const formatNumber = (num) => {
      return num.toLocaleString('ko-KR');
    };

    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
  });

  test('토큰 검증 함수 테스트', () => {
    const isTokenValid = (token) => {
      if (!token) return false;
      if (typeof token !== 'string') return false;
      return token.length > 10;
    };

    expect(isTokenValid('valid-token-123456')).toBe(true);
    expect(isTokenValid('short')).toBe(false);
    expect(isTokenValid(null)).toBe(false);
    expect(isTokenValid(undefined)).toBe(false);
  });

  test('URL 검증 함수 테스트', () => {
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    expect(isValidUrl('https://api.languagemate.kr')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('invalid-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});