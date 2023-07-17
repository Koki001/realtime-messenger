import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { Group } from "@/types";

const initialState: Group = {
  id: "1d6c3f19-ab40-4c3f-b8eb-8a38495a45df",
  name: "Chatvia Welcome Group",
};

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setGroupID: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setGroupName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const { setGroupID, setGroupName } = groupSlice.actions;
export default groupSlice.reducer;
