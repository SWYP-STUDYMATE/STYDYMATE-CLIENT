import { useNavigate } from "react-router-dom";
import api from "../api";
import useProfileStore from "../store/profileStore";
import { useAlert } from "../hooks/useAlert";
import { removeToken } from "../utils/tokenStorage";
import CommonButton from "./CommonButton";

export default function LogoutButton() {
  const navigate = useNavigate();
  const setEnglishName = useProfileStore((state) => state.setEnglishName);
  const setResidence = useProfileStore((state) => state.setResidence);
  const { showSuccess } = useAlert();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      console.log("로그아웃 API 호출 성공");
    } catch (e) {
      // 실패해도 localStorage는 비움
      console.error("로그아웃 실패", e);
    }
    removeToken("accessToken");
    removeToken("refreshToken");
    setEnglishName("");
    setResidence("");
    showSuccess("로그아웃 되었습니다.", () => {
      navigate("/");
    });
  };

  return (
    <CommonButton
      onClick={handleLogout}
      variant="danger"
      size="default"
      fullWidth={false}
      className="px-4"
    >
      로그아웃
    </CommonButton>
  );
} 
