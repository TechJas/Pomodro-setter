import React, { useState, useEffect } from 'react';
import { Timer, Award, TreePine, Calendar, BarChart3, Heart, LogOut } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import StudyTimer from './components/StudyTimer';
import BadgeCollection from './components/BadgeCollection';
import VirtualForest from './components/VirtualForest';
import ExamPlanner from './components/ExamPlanner';
import Analytics from './components/Analytics';
import { getCurrentUser, logout } from './utils/auth';
import { SecureUserData, loadSecureUserData, createInitialUserData, saveSecureUserData } from './utils/secureStorage';

type Screen = 'login' | 'dashboard' | 'timer' | 'badges' | 'forest' | 'planner' | 'analytics';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<SecureUserData | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('pomogrow_session');
    if (savedSession) {
      const user = getCurrentUser(savedSession);
      if (user) {
        setSessionToken(savedSession);
        
        // Load user data
        let secureUserData = loadSecureUserData(user.studyId, savedSession);
        if (!secureUserData) {
          // Create initial data for existing user
          secureUserData = createInitialUserData(user);
          saveSecureUserData(secureUserData, savedSession);
        }
        
        setUserData(secureUserData);
        setCurrentScreen('dashboard');
      } else {
        // Invalid session, clear it
        localStorage.removeItem('pomogrow_session');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: any, token: string) => {
    setSessionToken(token);
    
    // Load or create user data
    let secureUserData = loadSecureUserData(user.studyId, token);
    if (!secureUserData) {
      secureUserData = createInitialUserData(user);
      saveSecureUserData(secureUserData, token);
    }
    
    setUserData(secureUserData);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    if (sessionToken) {
      logout(sessionToken);
    }
    localStorage.removeItem('pomogrow_session');
    setUserData(null);
    setSessionToken(null);
    setCurrentScreen('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PomoGrow...</p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'timer', icon: Timer, label: 'Study Timer' },
    { id: 'badges', icon: Award, label: 'Badges' },
    { id: 'forest', icon: TreePine, label: 'Forest' },
    { id: 'planner', icon: Calendar, label: 'Exams' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const renderScreen = () => {
    if (!userData || !sessionToken) return null;

    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard userData={userData} sessionToken={sessionToken} onNavigate={setCurrentScreen} />;
      case 'timer':
        return <StudyTimer userData={userData} sessionToken={sessionToken} onUserDataUpdate={setUserData} />;
      case 'badges':
        return <BadgeCollection userData={userData} />;
      case 'forest':
        return <VirtualForest userData={userData} />;
      case 'planner':
        return <ExamPlanner userData={userData} sessionToken={sessionToken} onUserDataUpdate={setUserData} />;
      case 'analytics':
        return <Analytics userData={userData} />;
      default:
        return <Dashboard userData={userData} sessionToken={sessionToken} onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-8 w-8 text-emerald-600" />
                <h1 className="text-xl font-bold text-gray-900">PomoGrow</h1>
              </div>
              {userData && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Hey {userData.displayName}!</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    🔒 Secure Session
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {userData && (
                <div className="text-xs text-gray-500">
                  ID: {userData.studyId.split('-')[1]?.substring(0, 8)}...
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white/60 backdrop-blur-sm border-r border-emerald-100 min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentScreen(item.id as Screen)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        currentScreen === item.id
                          ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                          : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export default App;