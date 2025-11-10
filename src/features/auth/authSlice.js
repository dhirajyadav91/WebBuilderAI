// authSlice.js - FIXED VERSION
import { createSlice } from "@reduxjs/toolkit";
import { checkAuth, loginUser, logoutUser, registerUser } from "./authThunks";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (state, action) => {
      console.log('✅ Auth success - updating state:', action.payload);
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.authChecked = true;
      state.error = null;
    };

    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, handleAuthSuccess)
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
        state.isAuthenticated = false;
        state.user = null;
        state.authChecked = true;
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, handleAuthSuccess)
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
        state.isAuthenticated = false;
        state.user = null;
        state.authChecked = true;
      })

      // Check Auth - FIXED: Properly handle success
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log('🔐 CheckAuth successful - user:', action.payload);
        state.loading = false;
        state.isAuthenticated = true; // 👈 YEH LINE IMPORTANT HAI
        state.user = action.payload;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.log('🔐 CheckAuth failed (normal):', action.payload);
        state.loading = false;
        state.authChecked = true;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.isNormal ? null : action.payload?.message;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;