import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play } from 'lucide-react';
import useLevelTestStore from '../store/levelTestStore';

const AudioRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const { 
    startRecording: storeStartRecording,
    stopRecording: storeStopRecording,
    updateRecordingDuration
  } = useLevelTestStore();

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(Math.min(average / 128, 1)); // Normalize to 0-1

    animationRef.current = requestAnimationFrame(visualizeAudio);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      // Setup audio visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Setup MediaRecorder
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        storeStartRecording(blob);
        
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          updateRecordingDuration(newTime);
          return newTime;
        });
      }, 1000);

      // Start visualization
      visualizeAudio();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      setAudioLevel(0);
      storeStopRecording();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            updateRecordingDuration(newTime);
            return newTime;
          });
        }, 1000);
        visualizeAudio();
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Audio Visualizer */}
      <div className="w-full max-w-md h-24 bg-[#F8F9FA] rounded-lg p-4 flex items-center justify-center">
        {isRecording && !isPaused ? (
          <div className="flex items-center space-x-1 h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-3 bg-[#00C471] rounded-full transition-all duration-100"
                style={{
                  height: `${Math.random() * audioLevel * 100}%`,
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-[#929292] text-sm">
            {isRecording ? '일시정지' : '녹음 대기 중'}
          </p>
        )}
      </div>

      {/* Recording Time */}
      <div className="text-2xl font-bold text-[#111111]">
        {formatTime(recordingTime)}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="w-16 h-16 bg-[#EA4335] hover:bg-[#D33B2C] text-white rounded-full flex items-center justify-center transition-colors duration-200 disabled:bg-[#F1F3F5] disabled:cursor-not-allowed"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <>
            <button
              onClick={pauseRecording}
              className="w-14 h-14 bg-[#4285F4] hover:bg-[#3374E0] text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
            
            <button
              onClick={stopRecording}
              className="w-16 h-16 bg-[#111111] hover:bg-[#414141] text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <Square className="w-8 h-8" />
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-[#929292]">
          {isRecording 
            ? '녹음 중입니다. 정지 버튼을 눌러 녹음을 완료하세요.'
            : '마이크 버튼을 눌러 녹음을 시작하세요.'}
        </p>
      </div>
    </div>
  );
};

export default AudioRecorder;