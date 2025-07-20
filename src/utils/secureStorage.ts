import { User, getCurrentUser, hasDataAccess } from './auth';

export interface SecureUserData {
  studyId: string;
  loginId: string;
  displayName: string;
  mood: 'happy' | 'tired' | 'motivated';
  joinDate: string;
  pomodorosCompleted: number;
  badges: Badge[];
  trees: number;
  studySessions: StudySession[];
  exams: Exam[];
  skipDays: string[];
  lastActiveDate: string;
  emotionEntries: EmotionEntry[];
  timetable: TimetableEntry[];
}

export interface StudySession {
  date: string;
  duration: number;
  type: 'focus' | 'break';
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedDate: string;
}

export interface EmotionEntry {
  id: string;
  date: string;
  mood: 'happy' | 'sad' | 'stressed' | 'motivated' | 'tired' | 'excited';
  intensity: number; // 1-10
  notes?: string;
  beforeStudy: boolean;
}

export interface TimetableEntry {
  id: string;
  subject: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  location?: string;
  recurring: boolean;
}

const getUserDataKey = (studyId: string): string => {
  return `pomogrow_data_${studyId}`;
};

// Secure data operations with access control
export const saveSecureUserData = (userData: SecureUserData, sessionToken: string): boolean => {
  try {
    // Verify user has access to this data
    if (!hasDataAccess(sessionToken, userData.studyId)) {
      console.error('Unauthorized data access attempt');
      return false;
    }
    
    const dataKey = getUserDataKey(userData.studyId);
    const encryptedData = btoa(JSON.stringify(userData)); // Basic encoding (in production, use proper encryption)
    
    localStorage.setItem(dataKey, encryptedData);
    return true;
  } catch (error) {
    console.error('Failed to save secure user data:', error);
    return false;
  }
};

export const loadSecureUserData = (studyId: string, sessionToken: string): SecureUserData | null => {
  try {
    // Verify user has access to this data
    if (!hasDataAccess(sessionToken, studyId)) {
      console.error('Unauthorized data access attempt');
      return null;
    }
    
    const dataKey = getUserDataKey(studyId);
    const encryptedData = localStorage.getItem(dataKey);
    
    if (!encryptedData) {
      return null;
    }
    
    const decryptedData = atob(encryptedData); // Basic decoding (in production, use proper decryption)
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Failed to load secure user data:', error);
    return null;
  }
};

export const createInitialUserData = (user: User): SecureUserData => {
  return {
    studyId: user.studyId,
    loginId: user.studyId,
    displayName: user.preferredName,
    mood: 'motivated',
    joinDate: user.createdAt,
    pomodorosCompleted: 0,
    badges: [],
    trees: 0,
    studySessions: [],
    exams: [],
    skipDays: [],
    lastActiveDate: new Date().toISOString(),
    emotionEntries: [],
    timetable: []
  };
};

export const updateSecureUserData = (
  studyId: string,
  sessionToken: string,
  updates: Partial<SecureUserData>
): SecureUserData | null => {
  const currentData = loadSecureUserData(studyId, sessionToken);
  if (!currentData) return null;
  
  const updatedData = { ...currentData, ...updates };
  const success = saveSecureUserData(updatedData, sessionToken);
  
  return success ? updatedData : null;
};

export const addStudySession = (
  studyId: string,
  sessionToken: string,
  session: StudySession
): boolean => {
  const userData = loadSecureUserData(studyId, sessionToken);
  if (!userData) return false;
  
  userData.studySessions.push(session);
  userData.lastActiveDate = new Date().toISOString();
  
  return saveSecureUserData(userData, sessionToken);
};

export const addEmotionEntry = (
  studyId: string,
  sessionToken: string,
  entry: EmotionEntry
): boolean => {
  const userData = loadSecureUserData(studyId, sessionToken);
  if (!userData) return false;
  
  userData.emotionEntries.push(entry);
  return saveSecureUserData(userData, sessionToken);
};

export const addTimetableEntry = (
  studyId: string,
  sessionToken: string,
  entry: TimetableEntry
): boolean => {
  const userData = loadSecureUserData(studyId, sessionToken);
  if (!userData) return false;
  
  userData.timetable.push(entry);
  return saveSecureUserData(userData, sessionToken);
};

export const deleteUserData = (studyId: string, sessionToken: string): boolean => {
  try {
    if (!hasDataAccess(sessionToken, studyId)) {
      console.error('Unauthorized data deletion attempt');
      return false;
    }
    
    const dataKey = getUserDataKey(studyId);
    localStorage.removeItem(dataKey);
    return true;
  } catch (error) {
    console.error('Failed to delete user data:', error);
    return false;
  }
};