import { useNavigate } from "react-router-dom";
import api from "../api";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      console.log("로그아웃 API 호출 성공");
    } catch (e) {
      // 실패해도 localStorage는 비움
      console.error("로그아웃 실패", e);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
      로그아웃
    </button>
  );
} 