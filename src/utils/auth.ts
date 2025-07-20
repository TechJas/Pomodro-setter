import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

export interface User {
  studyId: string;
  email: string;
  passwordHash: string;
  preferredName: string;
  createdAt: string;
  lastLogin: string;
  failedAttempts: number;
  lockedUntil?: string;
  isVerified: boolean;
  resetToken?: string;
  resetTokenExpiry?: string;
}

export interface AuthSession {
  studyId: string;
  email: string;
  sessionToken: string;
  expiresAt: string;
}

const USERS_KEY = 'pomogrow_users';
const SESSIONS_KEY = 'pomogrow_sessions';
const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Encryption utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Input validation and sanitization
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email) && email.endsWith('@gmail.com');
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const sanitizeInput = (input: string): string => {
  return validator.escape(input.trim());
};

// User management
export const getAllUsers = (): User[] => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

export const generateStudyId = (): string => {
  return `STUDY-${uuidv4()}`;
};

export const registerUser = async (
  email: string,
  password: string,
  preferredName: string,
  customStudyId?: string
): Promise<{ success: boolean; studyId?: string; error?: string }> => {
  try {
    // Validate inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedName = sanitizeInput(preferredName);
    
    if (!validateEmail(sanitizedEmail)) {
      return { success: false, error: 'Please enter a valid Gmail address' };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('. ') };
    }
    
    if (sanitizedName.length < 2) {
      return { success: false, error: 'Preferred name must be at least 2 characters long' };
    }
    
    const users = getAllUsers();
    
    // Check if email already exists
    if (users.find(user => user.email === sanitizedEmail)) {
      return { success: false, error: 'This Gmail address is already registered' };
    }
    
    // Generate or validate study ID
    const studyId = customStudyId || generateStudyId();
    if (users.find(user => user.studyId === studyId)) {
      return { success: false, error: 'Study ID already exists. Please choose another one.' };
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create new user
    const newUser: User = {
      studyId,
      email: sanitizedEmail,
      passwordHash,
      preferredName: sanitizedName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      failedAttempts: 0,
      isVerified: true, // In a real app, this would be false until email verification
      lockedUntil: undefined,
      resetToken: undefined,
      resetTokenExpiry: undefined
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, studyId };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
};

export const loginUser = async (
  studyIdOrEmail: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string; locked?: boolean }> => {
  try {
    const sanitizedInput = sanitizeInput(studyIdOrEmail.toLowerCase());
    const users = getAllUsers();
    
    // Find user by study ID or email
    const user = users.find(u => 
      u.studyId.toLowerCase() === sanitizedInput || 
      u.email.toLowerCase() === sanitizedInput
    );
    
    if (!user) {
      // Log security event
      logSecurityEvent('INVALID_CREDENTIALS', sanitizedInput);
      return { success: false, error: 'Invalid credentials. Please check your Study ID/Email and password.' };
    }
    
    // Check if account is locked
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const lockTimeRemaining = Math.ceil((new Date(user.lockedUntil).getTime() - new Date().getTime()) / (1000 * 60));
      return { 
        success: false, 
        error: `Account temporarily locked due to multiple failed attempts. Try again in ${lockTimeRemaining} minutes.`,
        locked: true
      };
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedAttempts += 1;
      
      if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION).toISOString();
        // In a real app, send email alert here
        sendSecurityAlert(user.email, user.preferredName);
        logSecurityEvent('ACCOUNT_LOCKED', user.email);
      }
      
      saveUsers(users);
      
      return { 
        success: false, 
        error: `Invalid password. ${MAX_FAILED_ATTEMPTS - user.failedAttempts} attempts remaining before account lock.`
      };
    }
    
    // Reset failed attempts on successful login
    user.failedAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    
    // Create session
    const session = createSession(user);
    
    return { success: true, user, sessionToken: session.sessionToken };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
};

// Session management
export const createSession = (user: User): AuthSession => {
  const session: AuthSession = {
    studyId: user.studyId,
    email: user.email,
    sessionToken: uuidv4(),
    expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString()
  };
  
  const sessions = getSessions();
  // Remove any existing sessions for this user
  const filteredSessions = sessions.filter(s => s.studyId !== user.studyId);
  filteredSessions.push(session);
  
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
  return session;
};

export const getSessions = (): AuthSession[] => {
  try {
    const sessions = localStorage.getItem(SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

export const validateSession = (sessionToken: string): User | null => {
  const sessions = getSessions();
  const session = sessions.find(s => s.sessionToken === sessionToken);
  
  if (!session || new Date() > new Date(session.expiresAt)) {
    // Remove expired session
    if (session) {
      const filteredSessions = sessions.filter(s => s.sessionToken !== sessionToken);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
    }
    return null;
  }
  
  const users = getAllUsers();
  return users.find(u => u.studyId === session.studyId) || null;
};

export const logout = (sessionToken: string): void => {
  const sessions = getSessions();
  const filteredSessions = sessions.filter(s => s.sessionToken !== sessionToken);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(filteredSessions));
};

// Password reset
export const initiatePasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    
    if (!validateEmail(sanitizedEmail)) {
      return { success: false, error: 'Please enter a valid Gmail address' };
    }
    
    const users = getAllUsers();
    const user = users.find(u => u.email === sanitizedEmail);
    
    if (!user) {
      // Don't reveal if email exists for security
      return { success: true };
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    saveUsers(users);
    
    // In a real app, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Password reset failed. Please try again.' };
  }
};

export const resetPassword = async (
  email: string,
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('. ') };
    }
    
    const users = getAllUsers();
    const user = users.find(u => u.email === sanitizedEmail);
    
    if (!user || user.resetToken !== resetToken || 
        !user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      return { success: false, error: 'Invalid or expired reset token' };
    }
    
    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.failedAttempts = 0;
    user.lockedUntil = undefined;
    
    saveUsers(users);
    
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Password reset failed. Please try again.' };
  }
};

// Security logging and alerts
export const logSecurityEvent = (event: string, identifier: string): void => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp}: ${event} - ${identifier}`);
  
  // In a real app, this would be sent to a security monitoring service
  const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
  securityLogs.push({ timestamp, event, identifier });
  
  // Keep only last 100 logs
  if (securityLogs.length > 100) {
    securityLogs.splice(0, securityLogs.length - 100);
  }
  
  localStorage.setItem('security_logs', JSON.stringify(securityLogs));
};

export const sendSecurityAlert = (email: string, name: string): void => {
  // In a real app, this would send an actual email
  console.warn(`[SECURITY ALERT] Account locked for ${email} (${name}) due to multiple failed login attempts`);
  
  // Simulate email notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('PomoGrow Security Alert', {
      body: `Multiple failed login attempts detected for your account. Your account has been temporarily locked for security.`,
      icon: '/favicon.ico'
    });
  }
};

// Data access control
export const hasDataAccess = (sessionToken: string, requestedStudyId: string): boolean => {
  const user = validateSession(sessionToken);
  return user !== null && user.studyId === requestedStudyId;
};

export const getCurrentUser = (sessionToken: string): User | null => {
  return validateSession(sessionToken);
};