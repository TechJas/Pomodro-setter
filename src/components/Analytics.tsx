import React from 'react';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { SecureUserData } from '../utils/secureStorage';

interface AnalyticsProps {
  userData: SecureUserData;
}

const Analytics: React.FC<AnalyticsProps> = ({ userData }) => {
  const getWeeklyData = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      const sessionsOnDay = userData.studySessions.filter(
        session => new Date(session.date).toDateString() === dateString
      ).length;
      
      weekData.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        sessions: sessionsOnDay,
        date: dateString
      });
    }
    
    return weekData;
  };

  const getHourlyData = () => {
    const hourlyStats = Array(24).fill(0);
    
    userData.studySessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      hourlyStats[hour]++;
    });
    
    return hourlyStats.map((count, hour) => ({
      hour: hour.toString().padStart(2, '0') + ':00',
      sessions: count
    }));
  };

  const getProductivityInsights = () => {
    const weeklyData = getWeeklyData();
    const totalSessions = weeklyData.reduce((sum, day) => sum + day.sessions, 0);
    const avgSessionsPerDay = Math.round((totalSessions / 7) * 10) / 10;
    
    const mostProductiveDay = weeklyData.reduce((max, day) => 
      day.sessions > max.sessions ? day : max
    );
    
    const leastProductiveDay = weeklyData.reduce((min, day) => 
      day.sessions < min.sessions ? day : min
    );

    const hourlyData = getHourlyData();
    const peakHour = hourlyData.reduce((max, hour) => 
      hour.sessions > max.sessions ? hour : max
    );

    return {
      avgSessionsPerDay,
      mostProductiveDay,
      leastProductiveDay,
      peakHour,
      totalSessions
    };
  };

  const getBurnoutRisk = () => {
    const recentSessions = userData.studySessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
      }).length;

    const skipDaysThisWeek = userData.skipDays
      .filter(skipDate => {
        const skip = new Date(skipDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return skip >= weekAgo;
      }).length;

    if (skipDaysThisWeek >= 3) return { level: 'high', color: 'text-red-600', bg: 'bg-red-100' };
    if (skipDaysThisWeek >= 2 || recentSessions < 5) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const weeklyData = getWeeklyData();
  const insights = getProductivityInsights();
  const burnoutRisk = getBurnoutRisk();
  const maxSessions = Math.max(...weeklyData.map(d => d.sessions), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">
          Track your progress and optimize your study habits, {userData.displayName}!
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="h-6 w-6 text-emerald-500" />
            <span className="text-sm text-gray-500">Total Pomodoros</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{userData.pomodorosCompleted}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            <span className="text-sm text-gray-500">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{insights.totalSessions}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-6 w-6 text-purple-500" />
            <span className="text-sm text-gray-500">Daily Average</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{insights.avgSessionsPerDay}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="h-6 w-6 text-orange-500" />
            <span className="text-sm text-gray-500">Peak Hour</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{insights.peakHour.hour}</div>
        </div>
      </div>

      {/* Weekly Heatmap */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Focus Heatmap</h3>
        
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-500 mb-2">{day.day}</div>
              <div
                className={`h-16 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  day.sessions === 0
                    ? 'bg-gray-100'
                    : `bg-emerald-${Math.min(Math.ceil((day.sessions / maxSessions) * 5), 5) * 100} bg-opacity-${Math.min(Math.ceil((day.sessions / maxSessions) * 10), 10) * 10}`
                }`}
                style={{
                  backgroundColor: day.sessions === 0 
                    ? '#f3f4f6' 
                    : `rgba(16, 185, 129, ${0.2 + (day.sessions / maxSessions) * 0.8})`
                }}
              >
                <span className="text-sm font-semibold text-gray-700">{day.sessions}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Less</span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: `rgba(16, 185, 129, ${level * 0.2})` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best & Worst Days */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Performance</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Most Productive Day</span>
                <span className="text-sm font-medium text-green-600">
                  {insights.mostProductiveDay.day}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(insights.mostProductiveDay.sessions / maxSessions) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {insights.mostProductiveDay.sessions} sessions
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Least Productive Day</span>
                <span className="text-sm font-medium text-gray-500">
                  {insights.leastProductiveDay.day}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${Math.max((insights.leastProductiveDay.sessions / maxSessions) * 100, 5)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {insights.leastProductiveDay.sessions} sessions
              </div>
            </div>
          </div>
        </div>

        {/* Burnout Risk Assessment */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Burnout Risk Assessment</h3>
          
          <div className={`p-4 rounded-lg ${burnoutRisk.bg} mb-4`}>
            <div className={`text-lg font-semibold ${burnoutRisk.color} mb-2`}>
              {burnoutRisk.level.toUpperCase()} RISK
            </div>
            <p className="text-sm text-gray-600">
              {burnoutRisk.level === 'high' && "Consider taking more breaks and reducing study intensity."}
              {burnoutRisk.level === 'medium' && "You're doing well, but watch for signs of fatigue."}
              {burnoutRisk.level === 'low' && "Excellent balance! Keep up the great work!"}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Weekly Sessions:</span>
              <span className="font-medium">{insights.totalSessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skip Days:</span>
              <span className="font-medium">{userData.skipDays.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Consistency:</span>
              <span className="font-medium">
                {Math.round((insights.totalSessions / 7) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-3">Personalized Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">🎯 Optimize Your Schedule</h4>
            <p className="text-emerald-100 text-sm">
              Your peak performance is at {insights.peakHour.hour}. Schedule your most challenging subjects during this time!
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">🌱 Growth Opportunity</h4>
            <p className="text-emerald-100 text-sm">
              {insights.leastProductiveDay.sessions === 0
                ? `Try adding one session on ${insights.leastProductiveDay.day}s to boost your weekly total!`
                : `You're doing great! Consider adding one more tree to your forest today!`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;