import { SecureUserData } from './secureStorage';

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export const getAllPossibleBadges = (): Badge[] => [
  {
    id: 'first_pomodoro',
    name: 'Focus Finisher',
    description: 'Completed your first Pomodoro session',
    requirement: '1 Pomodoro',
    rarity: 'common',
    icon: 'Target'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Completed a session before 8 AM',
    requirement: 'Study before 8 AM',
    rarity: 'rare',
    icon: 'Star'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Completed a session after 10 PM',
    requirement: 'Study after 10 PM',
    rarity: 'rare',
    icon: 'Star'
  },
  {
    id: 'consistency_champion',
    name: 'Consistency Champion',
    description: 'Studied for 7 days in a row',
    requirement: '7-day streak',
    rarity: 'epic',
    icon: 'Flame'
  },
  {
    id: 'forest_starter',
    name: 'Forest Starter',
    description: 'Planted your first 10 trees',
    requirement: '10 Pomodoros',
    rarity: 'common',
    icon: 'Heart'
  },
  {
    id: 'tree_hugger',
    name: 'Tree Hugger',
    description: 'Planted 50 trees in your virtual forest',
    requirement: '50 Pomodoros',
    rarity: 'rare',
    icon: 'Crown'
  },
  {
    id: 'forest_guardian',
    name: 'Forest Guardian',
    description: 'Planted 100 trees - you\'re making a difference!',
    requirement: '100 Pomodoros',
    rarity: 'epic',
    icon: 'Trophy'
  },
  {
    id: 'pomodoro_master',
    name: 'Pomodoro Master',
    description: 'Completed 500 Pomodoro sessions',
    requirement: '500 Pomodoros',
    rarity: 'legendary',
    icon: 'Crown'
  },
  {
    id: 'deadline_dodger',
    name: 'Deadline Dodger Slayer',
    description: 'Studied consistently before an exam',
    requirement: 'Study 5 days before exam',
    rarity: 'epic',
    icon: 'Zap'
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Studied on both weekend days',
    requirement: 'Study Saturday & Sunday',
    rarity: 'rare',
    icon: 'Star'
  },
  {
    id: 'study_marathon',
    name: 'Study Marathon',
    description: 'Completed 10 Pomodoros in a single day',
    requirement: '10 sessions in one day',
    rarity: 'epic',
    icon: 'Trophy'
  },
  {
    id: 'month_achiever',
    name: 'Month Achiever',
    description: 'Studied every day for a month',
    requirement: '30-day streak',
    rarity: 'legendary',
    icon: 'Crown'
  }
];

export const awardBadge = (userData: SecureUserData): Badge[] => {
  const allBadges = getAllPossibleBadges();
  const earnedBadgeIds = userData.badges.map(badge => badge.id);
  const newBadges: Badge[] = [];
  
  // Check each badge condition
  allBadges.forEach(badge => {
    if (earnedBadgeIds.includes(badge.id)) return;
    
    let shouldAward = false;
    
    switch (badge.id) {
      case 'first_pomodoro':
        shouldAward = userData.pomodorosCompleted >= 1;
        break;
      
      case 'forest_starter':
        shouldAward = userData.trees >= 10;
        break;
      
      case 'tree_hugger':
        shouldAward = userData.trees >= 50;
        break;
      
      case 'forest_guardian':
        shouldAward = userData.trees >= 100;
        break;
      
      case 'pomodoro_master':
        shouldAward = userData.pomodorosCompleted >= 500;
        break;
      
      case 'early_bird':
        shouldAward = userData.studySessions.some(session => {
          const hour = new Date(session.date).getHours();
          return hour < 8;
        });
        break;
      
      case 'night_owl':
        shouldAward = userData.studySessions.some(session => {
          const hour = new Date(session.date).getHours();
          return hour >= 22;
        });
        break;
      
      case 'consistency_champion':
        shouldAward = getStudyStreak(userData) >= 7;
        break;
      
      case 'month_achiever':
        shouldAward = getStudyStreak(userData) >= 30;
        break;
      
      case 'weekend_warrior':
        shouldAward = checkWeekendWarrior(userData);
        break;
      
      case 'study_marathon':
        shouldAward = checkStudyMarathon(userData);
        break;
      
      case 'deadline_dodger':
        shouldAward = checkDeadlineDodger(userData);
        break;
    }
    
    if (shouldAward) {
      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        earnedDate: new Date().toISOString()
      });
    }
  });
  
  return newBadges;
};

const getStudyStreak = (userData: SecureUserData): number => {
  const dates = userData.studySessions
    .map(session => new Date(session.date).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (dates.length === 0) return 0;
  
  let streak = 1;
  const today = new Date().toDateString();
  
  if (dates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dates[0] !== yesterday.toDateString()) {
      return 0;
    }
  }
  
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
  
  return streak;
};

const checkWeekendWarrior = (userData: SecureUserData): boolean => {
  const thisWeek = getThisWeekDates();
  const saturday = thisWeek.find(date => date.getDay() === 6);
  const sunday = thisWeek.find(date => date.getDay() === 0);
  
  if (!saturday || !sunday) return false;
  
  const saturdayStudied = userData.studySessions.some(session => 
    new Date(session.date).toDateString() === saturday.toDateString()
  );
  
  const sundayStudied = userData.studySessions.some(session => 
    new Date(session.date).toDateString() === sunday.toDateString()
  );
  
  return saturdayStudied && sundayStudied;
};

const checkStudyMarathon = (userData: SecureUserData): boolean => {
  const sessionsByDay = userData.studySessions.reduce((acc, session) => {
    const date = new Date(session.date).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.values(sessionsByDay).some(count => count >= 10);
};

const checkDeadlineDodger = (userData: SecureUserData): boolean => {
  return userData.exams.some(exam => {
    const examDate = new Date(exam.date);
    const fiveDaysBefore = new Date(examDate);
    fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);
    
    const sessionsBeforeExam = userData.studySessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= fiveDaysBefore && sessionDate <= examDate;
    });
    
    return sessionsBeforeExam.length >= 5;
  });
};

const getThisWeekDates = (): Date[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
};