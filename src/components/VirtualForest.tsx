import React from 'react';
import { TreePine, Sprout, Leaf, Mountain } from 'lucide-react';
import { SecureUserData } from '../utils/secureStorage';

interface VirtualForestProps {
  userData: SecureUserData;
}

const VirtualForest: React.FC<VirtualForestProps> = ({ userData }) => {
  const getForestStage = () => {
    if (userData.trees >= 30) return 'agricultural';
    if (userData.trees >= 15) return 'forest';
    if (userData.trees >= 5) return 'grove';
    return 'seedling';
  };

  const getStageInfo = () => {
    const stage = getForestStage();
    switch (stage) {
      case 'agricultural':
        return {
          title: 'Thriving Agricultural Land',
          description: 'Your dedication has transformed barren dryland into lush, productive farmland!',
          color: 'from-green-600 to-emerald-600',
          nextGoal: null,
          quote: "With every study session, you're not just learning — you're reviving the Earth. 🌍"
        };
      case 'forest':
        return {
          title: 'Dense Forest',
          description: 'A beautiful forest is growing thanks to your consistent study sessions!',
          color: 'from-green-500 to-emerald-500',
          nextGoal: { trees: 30, label: 'Transform to Agriculture' },
          quote: "Your forest is becoming a symbol of your learning journey! 🌲"
        };
      case 'grove':
        return {
          title: 'Small Grove',
          description: 'Your trees are starting to form a lovely grove!',
          color: 'from-emerald-400 to-green-400',
          nextGoal: { trees: 15, label: 'Grow into Forest' },
          quote: "Watch your grove grow with each focused session! 🌳"
        };
      default:
        return {
          title: 'First Seedlings',
          description: 'Your learning journey is just beginning to take root!',
          color: 'from-green-300 to-emerald-300',
          nextGoal: { trees: 5, label: 'Form a Grove' },
          quote: "Every expert was once a beginner. Keep planting! 🌱"
        };
    }
  };

  const renderTreeGrid = () => {
    const maxTrees = 50;
    const trees = [];
    
    for (let i = 0; i < maxTrees; i++) {
      const isPlanted = i < userData.trees;
      trees.push(
        <div
          key={i}
          className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-300 ${
            isPlanted
              ? 'bg-green-100 border-2 border-green-300 hover:scale-110'
              : 'bg-gray-100 border-2 border-gray-200'
          }`}
        >
          {isPlanted ? (
            <TreePine className="h-6 w-6 text-green-600" />
          ) : (
            <Sprout className="h-6 w-6 text-gray-400" />
          )}
        </div>
      );
    }
    
    return trees;
  };

  const renderBeforeAfter = () => {
    if (userData.trees < 30) return null;

    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-yellow-200 to-orange-300 rounded-lg p-8 mb-3">
              <Mountain className="h-16 w-16 text-yellow-700 mx-auto mb-2" />
              <div className="text-yellow-800 font-medium">Before: Dryland</div>
            </div>
            <p className="text-sm text-gray-600">Barren and unproductive</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="text-3xl">→</div>
          </div>

          {/* After */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-200 to-emerald-300 rounded-lg p-8 mb-3">
              <Leaf className="h-16 w-16 text-green-700 mx-auto mb-2" />
              <div className="text-green-800 font-medium">After: Green Farmland</div>
            </div>
            <p className="text-sm text-gray-600">Lush and productive</p>
          </div>
        </div>
      </div>
    );
  };

  const stageInfo = getStageInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${stageInfo.color} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{stageInfo.title}</h2>
          <div className="text-right">
            <div className="text-3xl font-bold">{userData.trees}</div>
            <div className="text-sm opacity-90">Trees Planted</div>
          </div>
        </div>
        
        <p className="text-white/90 mb-4">{stageInfo.description}</p>
        
        {stageInfo.nextGoal && (
          <div className="bg-white/20 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span>Next Goal: {stageInfo.nextGoal.label}</span>
              <span>{userData.trees}/{stageInfo.nextGoal.trees}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((userData.trees / stageInfo.nextGoal.trees) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Environmental Impact Visualization */}
      {renderBeforeAfter()}

      {/* Forest Grid */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Virtual Forest</h3>
        
        <div className="grid grid-cols-10 gap-2 mb-6">
          {renderTreeGrid()}
        </div>

        <div className="text-center text-sm text-gray-600">
          Each tree represents one completed Pomodoro session
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forest Milestones</h3>
        
        <div className="space-y-3">
          {[
            { trees: 5, title: 'First Grove', unlocked: userData.trees >= 5 },
            { trees: 15, title: 'Small Forest', unlocked: userData.trees >= 15 },
            { trees: 30, title: 'Agricultural Land', unlocked: userData.trees >= 30 },
            { trees: 50, title: 'Ecosystem Master', unlocked: userData.trees >= 50 },
          ].map((milestone) => (
            <div
              key={milestone.trees}
              className={`flex items-center justify-between p-3 rounded-lg ${
                milestone.unlocked
                  ? 'bg-green-100 border border-green-200'
                  : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  milestone.unlocked ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className={`font-medium ${
                  milestone.unlocked ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {milestone.title}
                </span>
              </div>
              <span className={`text-sm ${
                milestone.unlocked ? 'text-green-600' : 'text-gray-500'
              }`}>
                {milestone.trees} trees
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white text-center">
        <div className="text-lg font-medium italic mb-2">"{stageInfo.quote}"</div>
        <div className="text-emerald-100 text-sm">Keep growing, {userData.displayName}!</div>
      </div>
    </div>
  );
};

export default VirtualForest;