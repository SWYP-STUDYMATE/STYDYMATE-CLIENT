/**
 * User-Agent 파싱 유틸리티
 */

export interface ParsedUserAgent {
  device: string;
  browser: string;
  os: string;
}

/**
 * User-Agent 문자열을 파싱하여 디바이스, 브라우저, OS 정보 추출
 */
export function parseUserAgent(userAgent?: string): ParsedUserAgent {
  if (!userAgent) {
    return {
      device: 'Unknown Device',
      browser: 'Unknown Browser',
      os: 'Unknown OS'
    };
  }

  const ua = userAgent.toLowerCase();

  // OS 감지
  let os = 'Unknown OS';
  if (ua.includes('windows')) {
    os = 'Windows';
    if (ua.includes('windows nt 10.0')) os = 'Windows 10';
    else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
    else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
    else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
  } else if (ua.includes('mac os x')) {
    os = 'MacOS';
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) {
      os = `MacOS ${match[1].replace('_', '.')}`;
    }
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = ua.match(/android (\d+\.?\d*)/);
    if (match) {
      os = `Android ${match[1]}`;
    }
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = ua.includes('ipad') ? 'iPadOS' : 'iOS';
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) {
      os = `${os} ${match[1].replace('_', '.')}`;
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // 브라우저 감지
  let browser = 'Unknown Browser';
  let version = '';

  if (ua.includes('edg/')) {
    browser = 'Edge';
    const match = ua.match(/edg\/(\d+\.?\d*)/);
    if (match) version = match[1];
  } else if (ua.includes('chrome/') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+\.?\d*)/);
    if (match) version = match[1];
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/(\d+\.?\d*)/);
    if (match) version = match[1];
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+\.?\d*)/);
    if (match) version = match[1];
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
    const match = ua.match(/(?:opera|opr)\/(\d+\.?\d*)/);
    if (match) version = match[1];
  }

  if (version) {
    browser = `${browser} ${version.split('.')[0]}`;
  }

  // 디바이스 타입 감지
  let device = 'Desktop';
  if (ua.includes('mobile')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }

  // 구체적인 디바이스 정보
  const deviceInfo = `${browser} on ${os}`;

  return {
    device: deviceInfo,
    browser,
    os
  };
}

/**
 * IP 주소로부터 위치 정보 추정 (간단한 버전)
 * 실제로는 GeoIP 서비스를 사용해야 함
 */
export function getLocationFromIP(ipAddress?: string): { location: string; countryCode: string } {
  // TODO: 실제 GeoIP 서비스 연동
  // Cloudflare Workers의 경우 request.cf.country 사용 가능
  return {
    location: 'Unknown Location',
    countryCode: 'XX'
  };
}

/**
 * 의심스러운 로그인 활동 감지 (간단한 버전)
 */
export function detectSuspiciousActivity(params: {
  ipAddress?: string;
  userAgent?: string;
  previousIpAddress?: string;
  previousCountry?: string;
}): { suspicious: boolean; reason?: string } {
  // TODO: 실제 로직 구현
  // - 다른 국가에서의 로그인
  // - 짧은 시간 내 다른 위치에서의 로그인
  // - 알려지지 않은 디바이스
  // - 비정상적인 시간대 로그인

  return {
    suspicious: false,
    reason: undefined
  };
}
