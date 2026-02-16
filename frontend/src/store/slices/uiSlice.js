import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    selectedTask: null,
    isTaskModalOpen: false,
    isSidebarOpen: false,
    onlineUsers: [],
  },
  reducers: {
    openTaskModal: (state, action) => {
      state.selectedTask = action.payload;
      state.isTaskModalOpen = true;
    },
    closeTaskModal: (state) => {
      state.selectedTask = null;
      state.isTaskModalOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.find(u => u.userId === action.payload.userId)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        u => u.userId !== action.payload.userId
      );
    },
  }
});

export const {
  openTaskModal,
  closeTaskModal,
  toggleSidebar,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser
} = uiSlice.actions;

export default uiSlice.reducer;