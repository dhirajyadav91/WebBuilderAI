import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../utils/axiosClient";

// Better error handling function
const handleApiError = (error) => {
  console.log('API Error Details:', {
    status: error.response?.status,
    message: error.message,
    data: error.response?.data
  });

  if (error.response?.status === 401) {
    return "Not authenticated";
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message.includes("Network Error")) {
    return "Network error. Please check your connection.";
  }
  
  return "Something went wrong";
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);
      
      console.log('Register response:', response.data);
      
      if (response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue({ 
          message: response.data.error || "Registration failed" 
        });
      }
    } catch (error) {
      const message = handleApiError(error);
      return rejectWithValue({ message });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/login", credentials);
      
      console.log('Login response:', response.data);
      
      if (response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue({ 
          message: response.data.error || "Login failed" 
        });
      }
    } catch (error) {
      const message = handleApiError(error);
      return rejectWithValue({ message });
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/user/check");
      
      console.log('Check auth response:', response.data);
      
      // ✅ FIXED: Remove 'success' check, only check for user
      if (response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue({ 
          message: response.data.error || "Authentication check failed" 
        });
      }
    } catch (error) {
      const message = handleApiError(error);
      
      // 401 error is normal - user not logged in
      if (error.response?.status === 401) {
        console.log('User not authenticated - this is normal');
        return rejectWithValue({ 
          message: "Not authenticated",
          isNormal: true
        });
      }
      
      return rejectWithValue({ message });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/user/logout");
      
      console.log('Logout response:', response.data);
      
      // ✅ FIXED: Check for message instead of success
      if (response.data.message?.includes("logout successfully") || response.data.success) {
        return null;
      } else {
        return rejectWithValue({ 
          message: response.data.error || "Logout failed" 
        });
      }
    } catch (error) {
      const message = handleApiError(error);
      
      // 401 during logout is normal
      if (error.response?.status === 401) {
        console.log('Already logged out');
        return null;
      }
      
      return rejectWithValue({ message });
    }
  }
);