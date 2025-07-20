import { SecureUserData } from './secureStorage';

export const checkExamReminders = (userData: SecureUserData): string | null => {
  const now = new Date();
  const lastActive = new Date(userData.lastActiveDate);
  const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
  
  // Check if user hasn't been active for 24+ hours
  if (hoursSinceLastActive < 24) return null;
  
  // Find upcoming exams within the next 7 days
  const upcomingExams = userData.exams.filter(exam => {
    const examDate = new Date(exam.date);
    const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 7;
  });
  
  if (upcomingExams.length === 0) return null;
  
  // Sort by closest exam
  upcomingExams.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const nextExam = upcomingExams[0];
  const daysUntil = Math.ceil((new Date(nextExam.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate motivational messages based on user mood and urgency
  const messages = generateMotivationalMessages(userData.displayName, userData.mood, nextExam.subject, daysUntil);
  
  return messages[Math.floor(Math.random() * messages.length)];
};

const generateMotivationalMessages = (
  name: string, 
  mood: 'happy' | 'tired' | 'motivated', 
  subject: string, 
  daysUntil: number
): string[] => {
  const baseMessages = [
    `Hey ${name}, your ${subject} exam is in ${daysUntil} days. Don't skip today — dive into your study zone!`,
    `${name}, your ${subject} exam is approaching in ${daysUntil} days. Time to grow some more trees in your forest! 🌳`,
    `Reminder for ${name}: ${subject} exam in ${daysUntil} days. Your future self will thank you for studying today! ✨`
  ];
  
  const moodBasedMessages = {
    happy: [
      `${name}, that wonderful energy of yours is perfect for tackling ${subject}! Only ${daysUntil} days left! 😊`,
      `Love seeing you happy, ${name}! Channel that positivity into your ${subject} prep - ${daysUntil} days to go! 🌟`
    ],
    tired: [
      `I know you're tired, ${name}, but even a small study session counts. ${subject} exam in ${daysUntil} days - you've got this! 💪`,
      `Feeling tired, ${name}? That's okay! Start with just one Pomodoro for ${subject}. ${daysUntil} days remaining. 🌱`
    ],
    motivated: [
      `That motivation is fire, ${name}! Perfect time to crush your ${subject} prep. ${daysUntil} days until showtime! 🔥`,
      `Your motivation is contagious, ${name}! Let's turn it into ${subject} mastery. ${daysUntil} days to make it count! ⚡`
    ]
  };
  
  const urgencyMessages = {
    critical: [ // 1-2 days
      `⚠️ URGENT: ${name}, your ${subject} exam is in just ${daysUntil} day${daysUntil === 1 ? '' : 's'}! Every minute counts now!`,
      `🚨 Last chance, ${name}! ${subject} exam in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. Time to focus like never before!`
    ],
    urgent: [ // 3-4 days
      `${name}, ${subject} exam in ${daysUntil} days - this is crunch time! Let's make every Pomodoro count! ⏰`,
      `The clock is ticking, ${name}! ${daysUntil} days until ${subject}. Time to show what you're made of! 🎯`
    ],
    normal: [ // 5-7 days
      `${name}, ${subject} exam in ${daysUntil} days. Perfect time to build momentum with consistent study sessions! 📚`,
      `Great timing, ${name}! ${daysUntil} days to prepare for ${subject}. Let's grow your knowledge forest! 🌲`
    ]
  };
  
  let urgencyLevel: 'critical' | 'urgent' | 'normal';
  if (daysUntil <= 2) urgencyLevel = 'critical';
  else if (daysUntil <= 4) urgencyLevel = 'urgent';
  else urgencyLevel = 'normal';
  
  return [
    ...baseMessages,
    ...moodBasedMessages[mood],
    ...urgencyMessages[urgencyLevel]
  ];
};

export const generateSkipWarning = (name: string, examSubject?: string, daysUntilExam?: number): string => {
  const baseWarnings = [
    `Warning: Skipping today might cost your tomorrow. Back to your grind, champ!`,
    `${name}, consistency is key! Don't break your momentum now. 🌱`,
    `Hey ${name}, every day matters in your learning journey. Let's plant at least one tree today! 🌳`
  ];
  
  if (examSubject && daysUntilExam && daysUntilExam <= 7) {
    return `${name}, you have ${examSubject} in ${daysUntilExam} days! Skipping today could hurt your chances. Stay strong! 💪`;
  }
  
  return baseWarnings[Math.floor(Math.random() * baseWarnings.length)];
};

export const generateRewardMessage = (name: string, treesPlanted: number): string => {
  if (treesPlanted % 10 === 0) {
    return `Amazing, ${name}! You've planted ${treesPlanted} trees in your virtual garden. Keep going! 🌳✨`;
  }
  
  const messages = [
    `Great job, ${name}! You planted another tree! Your forest is growing! 🌱`,
    `Fantastic work, ${name}! One more tree added to your learning forest! 🌲`,
    `Well done, ${name}! Your dedication is literally growing a virtual ecosystem! 🍃`,
    `Incredible, ${name}! Every Pomodoro plants a seed of knowledge! 🌿`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};