import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import profileReducer from "./profileSlice";
import groupReducer from "./groupSlice";
import contactRedurecr from "./contactSlice";

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    group: groupReducer,
    contact: contactRedurecr,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
