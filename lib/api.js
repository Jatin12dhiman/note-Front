const API_URL = 'http://localhost:5000/api';

// Helper function to get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to get headers
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Auth APIs
export const signup = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }
  
  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  
  return data;
};

// User APIs
export const getProfile = async () => {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }
  
  return data;
};

export const updateProfile = async (name, email, bio, password) => {
  const body = { name, email, bio };
  if (password) {
    body.password = password;
  }
  
  const response = await fetch(`${API_URL}/user/profile`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  
  return data;
};

// Task/Notes APIs
export const getTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'GET',
    headers: getHeaders(true),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch tasks');
  }
  
  return data;
};

export const createTask = async (title, content) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ title, content }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create task');
  }
  
  return data;
};

export const updateTask = async (id, title, content) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ title, content }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update task');
  }
  
  return data;
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete task');
  }
  
  return data;
};

// Auth helper functions
export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};
