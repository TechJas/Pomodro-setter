import React, { useEffect, useState } from 'react';
import { Clock, Award, TreePine, Target, TrendingUp, Calendar } from 'lucide-react';
import { SecureUserData } from '../utils/secureStorage';
import { checkExamReminders } from '../utils/reminders';
import MotivationAlert from './MotivationAlert';

interface DashboardProps {
  userData: SecureUserData;
  sessionToken: string;
  onNavigate: (screen: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, sessionToken, onNavigate }) => {
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');

  useEffect(() => {
    const reminder = checkExamReminders(userData);
    if (reminder) {
      setReminderMessage(reminder);
      setShowReminder(true);
    }
  }, [userData]);

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todaySessions = userData.studySessions.filter(
      session => new Date(session.date).toDateString() === today
    );
    return todaySessions.length;
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySessions = userData.studySessions.filter(
      session => new Date(session.date) >= weekAgo
    );
    return weeklySessions.length;
  };

  const getStreak = () => {
    const dates = userData.studySessions
      .map(session => new Date(session.date).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    
    if (dates.length > 0 && dates[0] === today) {
      streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currentDate = new Date(dates[i]);
        const diffTime = prevDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  const getNextExam = () => {
    const now = new Date();
    const upcomingExams = userData.exams
      .filter(exam => new Date(exam.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return upcomingExams[0];
  };

  const getMoodGreeting = () => {
    const greetings = {
      happy: `Great to see you smiling, ${userData.displayName}! `,
      tired: `Taking it step by step, ${userData.displayName}. `,
      motivated: `Love that energy, ${userData.displayName}! `
    };
    return greetings[userData.mood];
  };

  const stats = [
    {
      title: 'Today\'s Sessions',
      value: getTodayStats(),
      icon: Clock,
      color: 'bg-blue-500',
      action: () => onNavigate('timer')
    },
    {
      title: 'Total Pomodoros',
      value: userData.pomodorosCompleted,
      icon: Target,
      color: 'bg-emerald-500',
      action: () => onNavigate('analytics')
    },
    {
      title: 'Badges Earned',
      value: userData.badges.length,
      icon: Award,
      color: 'bg-yellow-500',
      action: () => onNavigate('badges')
    },
    {
      title: 'Trees Planted',
      value: userData.trees,
      icon: TreePine,
      color: 'bg-green-500',
      action: () => onNavigate('forest')
    }
  ];

  const nextExam = getNextExam();
  const streak = getStreak();

  return (
    <div className="space-y-6">
      {showReminder && (
        <MotivationAlert
          message={reminderMessage}
          onClose={() => setShowReminder(false)}
        />
      )}

      {/* Welcome Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getMoodGreeting()}Welcome back! 🌟
        </h2>
        <p className="text-gray-600">
          Ready to grow your knowledge and your virtual forest today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={stat.action}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 hover:bg-white/80 transition-all duration-200 hover:shadow-lg group"
            >
              <div className="flex items-center space-x-4">
                <div className={`${stat.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Streak & Next Exam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Streak */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Study Streak</h3>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">{streak}</div>
            <p className="text-gray-600">
              {streak === 0 ? 'Start your streak today!' : 
               streak === 1 ? 'Day in a row! Keep going!' : 
               'Days in a row! Amazing!'}
            </p>
          </div>
        </div>

        {/* Next Exam */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Next Exam</h3>
          </div>
          {nextExam ? (
            <div>
              <p className="font-semibold text-gray-900">{nextExam.subject}</p>
              <p className="text-sm text-gray-600 mb-2">
                {new Date(nextExam.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-purple-600">
                {Math.ceil((new Date(nextExam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">No upcoming exams</p>
              <button
                onClick={() => onNavigate('planner')}
                className="text-sm text-purple-600 hover:text-purple-700 mt-2"
              >
                Add an exam →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('timer')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Studying 🍅
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Plan Exams 📅
          </button>
          <button
            onClick={() => onNavigate('forest')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            View Forest 🌳
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;