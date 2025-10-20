/**
 * 해시 유틸리티 함수
 */

/**
 * SHA-256 해시 생성
 * @param input - 입력 문자열
 * @returns SHA-256 해시 (hex)
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * MD5 해시 생성 (간단한 구현)
 * @param input - 입력 문자열
 * @returns MD5 해시 (hex)
 */
export function simpleMD5(input: string): string {
  // 간단한 해시 함수 (충돌 가능성 있지만 캐시 키로 충분)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
