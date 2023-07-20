import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


interface Notifications {
  groups: number | 0,
  contacts: number | 0
}

const initialState: Notifications = {
  groups: 0,
  contacts: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setGroupsNotifications: (state, action: PayloadAction<number>) => {
      state.groups = action.payload;
    },
    setContactsNotifications: (state, action: PayloadAction<number>) => {
      state.contacts = action.payload;
    },
  },
});

export const { setGroupsNotifications, setContactsNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
