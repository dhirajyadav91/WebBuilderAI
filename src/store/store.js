// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';

// Custom transform to prevent double-stringification
const authTransform = createTransform(
  // Outbound - state to storage
  (inboundState, key) => {
    if (key === 'auth') {
      console.log('💾 Saving auth state to storage:', inboundState);
      return {
        ...inboundState,
        // Ensure we're storing the actual values, not strings
        user: inboundState.user,
        isAuthenticated: inboundState.isAuthenticated,
      };
    }
    return inboundState;
  },
  // Inbound - storage to state
  (outboundState, key) => {
    if (key === 'auth') {
      console.log('📥 Loading auth state from storage:', outboundState);
      
      // Fix double-parsed user object
      let fixedUser = outboundState.user;
      if (typeof outboundState.user === 'string') {
        try {
          fixedUser = JSON.parse(outboundState.user);
        } catch (error) {
          console.error('❌ Error parsing user from storage:', error);
          fixedUser = null;
        }
      }
      
      // Fix boolean values
      const fixedIsAuthenticated = outboundState.isAuthenticated === 'true' ? true : 
                                  outboundState.isAuthenticated === 'false' ? false : 
                                  Boolean(outboundState.isAuthenticated);

      return {
        ...outboundState,
        user: fixedUser,
        isAuthenticated: fixedIsAuthenticated,
        loading: false, // Always reset loading on rehydrate
      };
    }
    return outboundState;
  },
  { whitelist: ['auth'] }
);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  version: 3, // Increment version to clear old storage
  transforms: [authTransform],
  serialize: false, // Important: Let redux-persist handle serialization
  deserialize: false,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);