
'use client';

// IMPORTANT: This is a mock authentication system for local development and demonstration.
// It is NOT secure and should NOT be used in a production environment.
// In a real application, use a secure authentication service like Firebase Authentication.

const MOCK_USERS_KEY = 'mock_users_list';
const SESSION_KEY = 'mock_user_session';

const initialMockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
  { id: '2', name: 'John Doe', email: 'johndoe@example.com', password: 'password123', role: 'user' },
];

// --- User Data Management ---

export const getUsers = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  const usersJson = localStorage.getItem(MOCK_USERS_KEY);
  if (usersJson) {
    return JSON.parse(usersJson);
  }
  // If no users in local storage, initialize with default
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialMockUsers));
  return initialMockUsers;
};

export const setUsers = (users: any[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

export const addUser = (user: any) => {
  const users = getUsers();
  const existingUser = users.find((u: any) => u.email === user.email);
  if (existingUser) {
    return { success: false, message: 'User with this email already exists.' };
  }
  const newUser = { ...user, id: String(Date.now()) };
  const updatedUsers = [...users, newUser];
  setUsers(updatedUsers);
  return { success: true, user: newUser };
};

export const removeUser = (userId: string) => {
  let users = getUsers();
  const initialLength = users.length;
  users = users.filter((u: any) => u.id !== userId);
  if (users.length < initialLength) {
    setUsers(users);
    return { success: true };
  }
  return { success: false, message: 'User not found.' };
};


// --- Session Management ---

// This function simulates logging in a user by storing their info in localStorage.
export const mockLogin = (email: string, password: string) => {
  const users = getUsers();
  const user = users.find((u: any) => u.email === email && u.password === password);
  if (user) {
    // In a real app, you would never store sensitive info like this in localStorage.
    // This is only for the local mock setup.
    const { password, ...userToStore } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userToStore));
    return userToStore;
  }
  return null;
};

// This function simulates logging out by clearing the session from localStorage.
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

// --- User & Role Management ---

// This function gets the currently "logged in" user from localStorage.
export const getCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const userJson = localStorage.getItem(SESSION_KEY);
  if (userJson) {
    return JSON.parse(userJson);
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
