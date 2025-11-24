// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import authReducer from "@/store/slices/authSlice";
import satelliteReducer from "@/store/slices/satelliteSlice";
import analysisReducer from "@/store/slices/analysisSlice";
import threatReducer from "@/store/slices/threatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    satellite: satelliteReducer,
    analysis: analysisReducer,
    threat: threatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["satellite/uploadImage/fulfilled"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.file"],
        // Ignore these paths in the state
        ignoredPaths: ["satellite.uploadingFile"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
