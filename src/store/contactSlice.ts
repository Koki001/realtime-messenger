import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Group } from "@/types";

const initialState: Group = {
  id: "",
  name: "",
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    setContactID: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setContactName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const { setContactID, setContactName } = contactSlice.actions;
export default contactSlice.reducer;
