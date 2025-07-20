import React from 'react';
import { Award, Star, Target, Zap, Crown, Heart, Trophy, Flame } from 'lucide-react';
import { SecureUserData } from '../utils/secureStorage';
import { Badge, getAllPossibleBadges } from '../utils/badges';

interface BadgeCollectionProps {
  userData: SecureUserData;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ userData }) => {
  const allBadges = getAllPossibleBadges();
  const earnedBadgeIds = userData.badges.map(badge => badge.id);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target': return Target;
      case 'Flame': return Flame;
      case 'Crown': return Crown;
      case 'Trophy': return Trophy;
      case 'Star': return Star;
      case 'Zap': return Zap;
      case 'Heart': return Heart;
      default: return Award;
    }
  };

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getCompletionRate = () => {
    return Math.round((userData.badges.length / allBadges.length) * 100);
  };

  const getProgressMessage = () => {
    const rate = getCompletionRate();
    if (rate === 100) return `Amazing, ${userData.displayName}! You're a badge master! 🏆`;
    if (rate >= 75) return `Incredible progress, ${userData.displayName}! Almost there! 🌟`;
    if (rate >= 50) return `Great work, ${userData.displayName}! Keep collecting! 🎯`;
    if (rate >= 25) return `Good start, ${userData.displayName}! Keep going! 🚀`;
    return `Just getting started, ${userData.displayName}! Your first badges await! ✨`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Badge Collection</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              {userData.badges.length}/{allBadges.length}
            </div>
            <div className="text-sm text-gray-500">Collected</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Collection Progress</span>
            <span className="text-sm font-medium text-gray-900">{getCompletionRate()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getCompletionRate()}%` }}
            />
          </div>
        </div>

        <p className="text-gray-600">{getProgressMessage()}</p>
      </div>

      {/* Badge Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allBadges.map((badge) => {
          const isEarned = earnedBadgeIds.includes(badge.id);
          const Icon = getBadgeIcon(badge.icon);
          const colorClass = getBadgeColor(badge.rarity);
          
          return (
            <div
              key={badge.id}
              className={`relative bg-white/60 backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 ${
                isEarned
                  ? 'border-emerald-200 shadow-lg hover:shadow-xl'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Rarity Indicator */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {badge.rarity}
              </div>

              {/* Badge Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${colorClass} text-white mb-4 ${
                isEarned ? 'shadow-lg' : 'grayscale'
              }`}>
                <Icon className="h-8 w-8" />
              </div>

              {/* Badge Info */}
              <h3 className={`text-lg font-semibold mb-2 ${
                isEarned ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {badge.name}
              </h3>
              
              <p className={`text-sm mb-3 ${
                isEarned ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {badge.description}
              </p>

              {/* Earned Date or Requirements */}
              {isEarned ? (
                <div className="text-xs text-emerald-600 font-medium">
                  ✓ Earned {new Date(userData.badges.find(b => b.id === badge.id)?.earnedDate || '').toLocaleDateString()}
                </div>
              ) : (
                <div className="text-xs text-gray-400">
                  Requirement: {badge.requirement}
                </div>
              )}

              {/* Special Effects for Earned Badges */}
              {isEarned && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Achievement Stats */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Stats</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {userData.badges.filter(b => allBadges.find(ab => ab.id === b.id)?.rarity === 'legendary').length}
            </div>
            <div className="text-sm text-gray-500">Legendary</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {userData.badges.filter(b => allBadges.find(ab => ab.id === b.id)?.rarity === 'epic').length}
            </div>
            <div className="text-sm text-gray-500">Epic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {userData.badges.filter(b => allBadges.find(ab => ab.id === b.id)?.rarity === 'rare').length}
            </div>
            <div className="text-sm text-gray-500">Rare</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {userData.badges.filter(b => allBadges.find(ab => ab.id === b.id)?.rarity === 'common').length}
            </div>
            <div className="text-sm text-gray-500">Common</div>
          </div>
        </div>
      </div>

      {/* Next Badge Hint */}
      {userData.badges.length < allBadges.length && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Next Badge Opportunity</h3>
          <p className="text-emerald-100">
            Complete more Pomodoro sessions to unlock new badges! Your dedication is building something beautiful! 🌟
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;