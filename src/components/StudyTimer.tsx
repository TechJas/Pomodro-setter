import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { SecureUserData, saveSecureUserData, addStudySession } from '../utils/secureStorage';
import { awardBadge } from '../utils/badges';

interface StudyTimerProps {
  userData: SecureUserData;
  sessionToken: string;
  onUserDataUpdate: (userData: SecureUserData) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ userData: initialUserData, sessionToken, onUserDataUpdate }) => {
  const [userData, setUserData] = useState(initialUserData);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (!isBreak) {
      // Completed a focus session
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      
      // Update user data
      const updatedUserData = {
        ...userData,
        pomodorosCompleted: userData.pomodorosCompleted + 1,
        studySessions: [
          ...userData.studySessions,
          {
            date: new Date().toISOString(),
            duration: focusTime,
            type: 'focus' as const
          }
        ],
        trees: userData.trees + 1
      };

      // Award badges
      const newBadges = awardBadge(updatedUserData);
      updatedUserData.badges = [...userData.badges, ...newBadges];

      // Save securely
      const success = saveSecureUserData(updatedUserData, sessionToken);
      if (success) {
        setUserData(updatedUserData);
        onUserDataUpdate(updatedUserData);
      }

      // Start break
      setIsBreak(true);
      const breakDuration = newPomodoroCount % 4 === 0 ? longBreakTime : shortBreakTime;
      setTimeLeft(breakDuration * 60);
      
      showCompletionMessage();
    } else {
      // Completed a break
      setIsBreak(false);
      setTimeLeft(focusTime * 60);
    }
  };

  const showCompletionMessage = () => {
    const messages = [
      `Great job, ${userData.displayName}! You planted another tree! 🌱`,
      `Focus session complete! Your forest is growing! 🌳`,
      `Amazing work! Time for a well-deserved break! ✨`,
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Show notification (in a real app, you might use a proper notification system)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PomoGrow', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(focusTime * 60);
    setPomodoroCount(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (isBreak) {
      return pomodoroCount % 4 === 0 ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500';
    }
    return 'from-emerald-500 to-teal-500';
  };

  const getPhaseText = () => {
    if (isBreak) {
      return pomodoroCount % 4 === 0 ? 'Long Break Time!' : 'Short Break Time!';
    }
    return 'Focus Time!';
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer Display */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-emerald-100 text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hey {userData.displayName}! {getPhaseText()}
          </h2>
          <p className="text-gray-600">
            {isBreak ? 'Take a breather and recharge' : 'Time to dive deep into focus mode'}
          </p>
        </div>

        {/* Circular Timer */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="112"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="128"
              cy="128"
              r="112"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={`bg-gradient-to-r ${getTimerColor()} text-emerald-500`}
              style={{
                strokeDasharray: 2 * Math.PI * 112,
                strokeDashoffset: 2 * Math.PI * 112 * (timeLeft / (isBreak ? (pomodoroCount % 4 === 0 ? longBreakTime : shortBreakTime) * 60 : focusTime * 60))
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-500 mt-2">
                Pomodoro #{pomodoroCount + (isBreak ? 0 : 1)}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className={`bg-gradient-to-r ${getTimerColor()} text-white p-4 rounded-full hover:shadow-lg transition-all duration-200 hover:scale-110`}
          >
            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </button>
          <button
            onClick={resetTimer}
            className="bg-gray-500 text-white p-4 rounded-full hover:bg-gray-600 transition-all duration-200 hover:scale-110"
          >
            <RotateCcw className="h-8 w-8" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition-all duration-200 hover:scale-110"
          >
            <Settings className="h-8 w-8" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timer Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Time (minutes)
              </label>
              <input
                type="number"
                value={focusTime}
                onChange={(e) => setFocusTime(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Break (minutes)
              </label>
              <input
                type="number"
                value={shortBreakTime}
                onChange={(e) => setShortBreakTime(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                value={longBreakTime}
                onChange={(e) => setLongBreakTime(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                max="60"
              />
            </div>
          </div>

        </div>
      )}

      {/* Progress Stats */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{pomodoroCount}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userData.trees}</div>
            <div className="text-sm text-gray-500">Trees Planted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userData.badges.length}</div>
            <div className="text-sm text-gray-500">Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{Math.floor(pomodoroCount * focusTime / 60)}h</div>
            <div className="text-sm text-gray-500">Focus Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;