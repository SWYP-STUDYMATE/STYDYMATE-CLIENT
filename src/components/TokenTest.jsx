import React, { useState } from "react";
import api from "../api";

export default function TokenTest() {
  const [result, setResult] = useState("");

  const handleTest = async () => {
    setResult("요청 중...");
    try {
      // axios의 응답 인터셉터를 직접 호출하여 401 에러 상황을 mock으로 테스트
      if (api.interceptors.response.handlers.length > 0) {
        await api.interceptors.response.handlers[0].rejected({
          response: { status: 401 },
          config: { url: "/mock", headers: {}, _mock: true }, // url과 _mock 플래그 추가
        });
        setResult("인터셉터 강제 호출 완료 (콘솔을 확인하세요)");
      } else {
        setResult("인터셉터가 등록되어 있지 않습니다.");
      }
    } catch (e) {
      setResult("실패: " + (e.response?.status || e.message));
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <button
        onClick={handleTest}
        style={{
          padding: "10px 20px",
          background: "#09AA5C",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        accessToken 만료 테스트 (Mock)
      </button>
      <div style={{ marginTop: 10 }}>{result}</div>
    </div>
  );
} 