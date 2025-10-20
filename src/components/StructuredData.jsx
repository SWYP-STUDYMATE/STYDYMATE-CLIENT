import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { generateJSONLD } from '../utils/seo';

/**
 * JSON-LD 구조화 데이터 컴포넌트
 * - Schema.org 구조화 데이터 추가
 * - SEO 향상 및 리치 스니펫 지원
 */
export default function StructuredData({ data }) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  // 단일 객체 또는 배열 처리
  const jsonldArray = Array.isArray(data) ? data : [data];

  return (
    <Helmet>
      {jsonldArray.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJSONLD(item) }}
        />
      ))}
    </Helmet>
  );
}

StructuredData.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]).isRequired,
};
