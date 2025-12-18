
'use client';
import { addLog } from './logs';
import type { User } from './types';

// IMPORTANT: This is a mock authentication system for local development and demonstration.
// It is NOT secure and should NOT be used in a production environment.
// In a real application, use a secure authentication service like Firebase Authentication.

const MOCK_USERS_KEY = 'mock_users_list';
const SESSION_KEY = 'mock_user_session';

const initialMockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
  { id: '2', name: 'John Doe', email: 'johndoe@example.com', password: 'password123', role: 'user' },
];

// --- User Data Management ---

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const usersJson = localStorage.getItem(MOCK_USERS_KEY);
  if (usersJson) {
    try {
      return JSON.parse(usersJson);
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      return initialMockUsers;
    }
  }
  // If no users in local storage, initialize with default
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialMockUsers));
  return initialMockUsers;
};

export const setUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }
};

export const addUser = (user: Omit<User, 'id'>) => {
  const users = getUsers();
  const existingUser = users.find((u: User) => u.email === user.email);
  if (existingUser) {
    return { success: false, message: 'User with this email already exists.' };
  }
  const newUser = { ...user, id: String(Date.now()) };
  const updatedUsers = [...users, newUser];
  setUsers(updatedUsers);
  addLog('User Added', { newUserId: newUser.id, newUserEmail: newUser.email });
  return { success: true, user: newUser };
};

export const removeUser = (userId: string) => {
  let users = getUsers();
  const userToRemove = users.find(u => u.id === userId);
  if (!userToRemove) {
    return { success: false, message: 'User not found.' };
  }
  const initialLength = users.length;
  users = users.filter((u: User) => u.id !== userId);
  
  if (users.length < initialLength) {
    setUsers(users);
    addLog('User Removed', { removedUserId: userId, removedUserEmail: userToRemove.email });
    return { success: true };
  }
  return { success: false, message: 'User not found.' };
};


// --- Session Management ---

// This function simulates logging in a user by storing their info in localStorage.
export const mockLogin = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find((u: User) => u.email === email && u.password === password);
  if (user) {
    // In a real app, you would never store sensitive info like this in localStorage.
    // This is only for the local mock setup.
    const { password, ...userToStore } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userToStore));
    addLog('User Logged In');
    return userToStore;
  }
  return null;
};

// This function simulates logging out by clearing the session from localStorage.
export const logout = () => {
  const user = getCurrentUser();
  if (user) {
    addLog('User Logged Out');
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
};

// --- User & Role Management ---

// This function gets the currently "logged in" user from localStorage.
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const userJson = localStorage.getItem(SESSION_KEY);
  if (userJson) {
     try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error("Failed to parse user session from localStorage", e);
      return null;
    }
  }
  return null;
};

// This is a helper function to check if the current user has a specific role.
export const hasRole = (role: 'admin' | 'user') => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// A specific check for admin privileges, which can be used to protect certain UI elements or actions.
export const isAdmin = () => {
  return hasRole('admin');
};
