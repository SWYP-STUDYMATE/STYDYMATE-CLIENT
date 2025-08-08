import React from "react";
import { Users, Home, MessageCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useProfileStore from "../../store/profileStore";

export default function Sidebar({ active = "chat" }) {
  const profileImage = useProfileStore((state) => state.profileImage);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/main");
  };

  const handleChatClick = () => {
    navigate("/chat");
  };

  const handleScheduleClick = () => {
    navigate("/schedule");
  };

  return (
    <aside className="min-w-20 bg-[#00C471] flex flex-col items-center py-6 space-y-8 rounded-xl">
      <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
        <img
          src={profileImage || "/default-profile.png"}
          alt="프로필"
          className="w-full h-full object-cover"
        />
      </div>
      <Users
        className={`w-6 h-6 cursor-pointer ${
          active === "users" ? "text-white" : "text-green-200"
        }`}
      />
      <Home
        className={`w-6 h-6 cursor-pointer ${
          active === "home" ? "text-white" : "text-green-200"
        }`}
        onClick={handleHomeClick}
      />
      <MessageCircle
        className={`w-6 h-6 cursor-pointer ${
          active === "chat" ? "text-white" : "text-green-200"
        }`}
        onClick={handleChatClick}
      />
      <Calendar
        className={`w-6 h-6 cursor-pointer ${
          active === "schedule" ? "text-white" : "text-green-200"
        }`}
        onClick={handleScheduleClick}
      />
    </aside>
  );
}
