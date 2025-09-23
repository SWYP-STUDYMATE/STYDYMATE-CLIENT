import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

export default function VoiceMessage({ audioUrl, duration, isMine }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration || 0);
    const [waveformData, setWaveformData] = useState([]);
    const audioRef = useRef(null);

    useEffect(() => {
        // 더미 파형 데이터 생성 (실제로는 오디오 분석 필요)
        const bars = Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);
        setWaveformData(bars);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setTotalDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play();
            setIsPlaying(true);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleWaveformClick = (e) => {
        const audio = audioRef.current;
        if (!audio || !totalDuration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * totalDuration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const progressPercentage = totalDuration ? (currentTime / totalDuration) * 100 : 0;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg ${isMine ? 'bg-[#00C471]' : 'bg-[#FFE4EC]'
            } min-w-[280px] max-w-[320px]`}>
            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isMine
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-800'
                    } transition-colors`}
            >
                {isPlaying ? (
                    <Pause className="w-5 h-5" />
                ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                )}
            </button>

            {/* Waveform */}
            <div className="flex-1 flex flex-col gap-1">
                <div
                    className="relative h-10 flex items-center cursor-pointer"
                    onClick={handleWaveformClick}
                >
                    {/* Waveform bars */}
                    <div className="absolute inset-0 flex items-center gap-[2px]">
                        {waveformData.map((height, index) => {
                            const barPercentage = (index / waveformData.length) * 100;
                            const isActive = barPercentage <= progressPercentage;

                            return (
                                <div
                                    key={index}
                                    className={`flex-1 rounded-full transition-all duration-75 ${isMine
                                            ? isActive ? 'bg-white' : 'bg-white/40'
                                            : isActive ? 'bg-gray-800' : 'bg-gray-800/30'
                                        }`}
                                    style={{ height: `${height * 100}%` }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Time */}
                <div className={`flex items-center justify-between text-xs ${isMine ? 'text-white/80' : 'text-gray-600'
                    }`}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(totalDuration)}</span>
                </div>
            </div>

            {/* Voice icon */}
            <div className={`flex-shrink-0 ${isMine ? 'text-white/60' : 'text-gray-600'
                }`}>
                <Mic className="w-4 h-4" />
            </div>

            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                crossOrigin="anonymous"
            />
        </div>
    );
}
