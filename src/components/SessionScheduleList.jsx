import React from "react";

const STATUS_STYLES = {
  SCHEDULED: {
    text: "예정",
    className: "bg-[rgba(66,133,244,0.12)] text-[#1A73E8]",
  },
  IN_PROGRESS: {
    text: "진행 중",
    className: "bg-[rgba(0,196,113,0.12)] text-[#00c471]",
  },
  COMPLETED: {
    text: "완료",
    className: "bg-[rgba(0,196,113,0.12)] text-[#00c471]",
  },
  CANCELLED: {
    text: "취소",
    className: "bg-[rgba(244,67,54,0.12)] text-[#F44336]",
  },
};

const LANGUAGE_LABELS = {
  en: "영어",
  ko: "한국어",
  ja: "일본어",
  zh: "중국어",
  es: "스페인어",
  fr: "프랑스어",
};

const formatMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
};

const isSameDay = (dateA, dateB) =>
  dateA.getDate() === dateB.getDate() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getFullYear() === dateB.getFullYear();

const formatDayLabel = (date) => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getDate()}일 (${days[date.getDay()]})`;
};

const formatTimeRange = (start, end) => {
  if (!start) return "시간 미정";
  const format = (value) => {
    const hours = value.getHours();
    const minutes = value.getMinutes();
    const period = hours >= 12 ? "오후" : "오전";
    const hour12 = hours % 12 || 12;
    const minuteText = minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
    return `${period} ${hour12}${minuteText}`;
  };

  if (!end) {
    return format(start);
  }

  return `${format(start)} - ${format(end)}`;
};

const buildParticipantLabel = (participantNames = [], participantCount = 0, isHost = false) => {
  const normalizedCount = Math.max(participantCount, participantNames.length, isHost ? 1 : 0);
  if (normalizedCount === 0) return "참여자 미정";
  if (participantNames.length === 0) {
    return `[${normalizedCount}명] 참여자`;
  }
  return `[${normalizedCount}명] ${participantNames.join(', ')}`;
};

const buildLanguageLabel = (code) => {
  if (!code) return "언어 미정";
  const normalized = code.toLowerCase();
  return LANGUAGE_LABELS[normalized] || normalized.toUpperCase();
};

export default function SessionScheduleList({
  sessions,
  currentMonthDate,
  isLoading,
  error,
  onRetry,
  onCreateSession = () => {},
}) {
  const today = new Date();

  return (
    <div className="bg-[#00A398]/[0.03] rounded-[20px] p-8 w-full h-full">
      <div className="text-center mb-8">
        <h1 className="text-[48px] font-bold text-[#111111] mb-2">세션 스케줄</h1>
        <p className="text-[16px] font-medium text-[#343a40]">
          {formatMonthRange(currentMonthDate)}
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-[360px] bg-white rounded-[16px] border border-[#e1e3e6]">
          <p className="text-[16px] text-[#343a40] mb-4">세션 정보를 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-[#00c471] text-white rounded-lg text-[14px]"
          >
            다시 시도
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-[10px] p-6 border border-transparent animate-pulse"
            >
              <div className="h-4 bg-[#e9ecef] rounded w-1/3 mb-3" />
              <div className="h-4 bg-[#e9ecef] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[360px] bg-white rounded-[16px] border border-[#e1e3e6]">
          <p className="text-[16px] text-[#343a40] mb-4">이번 달 예정된 세션이 없습니다.</p>
          <button
            type="button"
            onClick={onCreateSession}
            className="px-4 py-2 bg-[#00c471] text-white rounded-lg text-[14px]"
          >
            세션 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const startDate = session.start ? new Date(session.start) : null;
            const endDate = session.end ? new Date(session.end) : null;
            const isTodaySession = startDate ? isSameDay(startDate, today) : false;
            const statusKey = (session.status || "SCHEDULED").toUpperCase();
            const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.SCHEDULED;

            const participantLabel = buildParticipantLabel(
              session.participantNames,
              session.currentParticipants,
              session.isHost
            );
            const languageLabel = buildLanguageLabel(session.languageCode);
            const durationLabel = session.durationMinutes
              ? `${session.durationMinutes}분 세션`
              : "세션 시간 미정";

            return (
              <div
                key={session.id || `${session.title}-${session.start}`}
                className={`bg-white rounded-[10px] p-6 ${
                  isTodaySession ? "border-2 border-[#00c471]" : "border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col space-y-2">
                    <span className="text-[18px] font-bold text-[#00c471]">
                      {startDate ? formatDayLabel(startDate) : "날짜 미정"} {formatTimeRange(startDate, endDate)}
                    </span>
                    <span className="text-[18px] font-bold text-[#111111]">{session.title}</span>
                    <span className="text-[16px] text-[#343a40]">{participantLabel}</span>
                    <span className="text-[16px] text-[#343a40]">{languageLabel}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[12px] font-semibold px-2 py-1 rounded-full ${statusStyle.className}`}>
                        {statusStyle.text}
                      </span>
                      <span className="text-[12px] text-[#6e7781]">
                        {session.isHost ? "내가 호스트" : "초대받은 세션"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[18px] font-bold text-[#111111]">
                      {durationLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
