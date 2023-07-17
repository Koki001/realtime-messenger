import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Profile } from "@/types";

const initialState: Profile = {
  id: "",
  // username: "",
  email: "",
  first_name: "",
  last_name: "",
  is_private: false
  // location: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setID: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    // setUsername: (state, action: PayloadAction<string>) => {
    //   state.username = action.payload;
    // },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setFirstName: (state, action: PayloadAction<string>) => {
      state.first_name = action.payload;
    },
    setLastName: (state, action: PayloadAction<string>) => {
      state.last_name = action.payload;
    },
    setPrivate: (state, action: PayloadAction<boolean>) => {
      state.is_private = action.payload;
    },
    // setLocation: (state, action: PayloadAction<string>) => {
    //   state.location = action.payload;
    // },
  },
});

export const { setID, setEmail, setFirstName, setLastName, setPrivate } =
  profileSlice.actions;
export default profileSlice.reducer;
