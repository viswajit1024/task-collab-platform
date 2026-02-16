import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardApi } from '../../api/boardApi';

export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await boardApi.getBoards(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (id, { rejectWithValue }) => {
    try {
      const response = await boardApi.getBoard(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (data, { rejectWithValue }) => {
    try {
      const response = await boardApi.createBoard(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await boardApi.updateBoard(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (id, { rejectWithValue }) => {
    try {
      await boardApi.deleteBoard(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addMember = createAsyncThunk(
  'boards/addMember',
  async ({ boardId, email, role }, { rejectWithValue }) => {
    try {
      const response = await boardApi.addMember(boardId, { email, role });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeMember = createAsyncThunk(
  'boards/removeMember',
  async ({ boardId, userId }, { rejectWithValue }) => {
    try {
      const response = await boardApi.removeMember(boardId, userId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const boardSlice = createSlice({
  name: 'boards',
  initialState: {
    boards: [],
    currentBoard: null,
    lists: [],
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.lists = [];
    },
    // Real-time updates
    socketBoardUpdated: (state, action) => {
      state.currentBoard = action.payload;
    },
    socketListCreated: (state, action) => {
      state.lists.push(action.payload);
    },
    socketListUpdated: (state, action) => {
      const index = state.lists.findIndex(l => l._id === action.payload._id);
      if (index !== -1) {
        state.lists[index] = { ...state.lists[index], ...action.payload };
      }
    },
    socketListDeleted: (state, action) => {
      state.lists = state.lists.filter(l => l._id !== action.payload.listId);
    },
    socketListsReordered: (state, action) => {
      const { listOrder } = action.payload;
      listOrder.forEach(item => {
        const list = state.lists.find(l => l._id === item.listId);
        if (list) list.position = item.position;
      });
      state.lists.sort((a, b) => a.position - b.position);
    },
    socketTaskCreated: (state, action) => {
      const task = action.payload;
      const list = state.lists.find(l => l._id === task.list);
      if (list) {
        if (!list.tasks) list.tasks = [];
        const exists = list.tasks.find(t => t._id === task._id);
        if (!exists) {
          list.tasks.push(task);
        }
      }
    },
    socketTaskUpdated: (state, action) => {
      const task = action.payload;
      for (const list of state.lists) {
        if (list.tasks) {
          const idx = list.tasks.findIndex(t => t._id === task._id);
          if (idx !== -1) {
            list.tasks[idx] = task;
            break;
          }
        }
      }
    },
    socketTaskDeleted: (state, action) => {
      const { taskId, listId } = action.payload;
      const list = state.lists.find(l => l._id === listId);
      if (list && list.tasks) {
        list.tasks = list.tasks.filter(t => t._id !== taskId);
      }
    },
    socketTaskMoved: (state, action) => {
      const { task, sourceListId, destinationListId, taskOrder } = action.payload;

      // Remove from source
      const sourceList = state.lists.find(l => l._id === sourceListId);
      if (sourceList && sourceList.tasks) {
        sourceList.tasks = sourceList.tasks.filter(t => t._id !== task._id);
      }

      // Add to destination
      const destList = state.lists.find(l => l._id === destinationListId);
      if (destList) {
        if (!destList.tasks) destList.tasks = [];
        const exists = destList.tasks.find(t => t._id === task._id);
        if (!exists) {
          destList.tasks.push(task);
        }
      }

      // Apply task order if provided
      if (taskOrder) {
        taskOrder.forEach(item => {
          for (const list of state.lists) {
            if (list.tasks) {
              const t = list.tasks.find(t => t._id === item.taskId);
              if (t) {
                t.position = item.position;
                t.list = item.listId;
              }
            }
          }
        });

        // Sort tasks in each list
        state.lists.forEach(list => {
          if (list.tasks) {
            list.tasks.sort((a, b) => a.position - b.position);
          }
        });
      }
    },
    socketMemberAdded: (state, action) => {
      if (state.currentBoard && state.currentBoard._id === action.payload.board) {
        // Board will be refetched by fetchBoard, but update locally for now
      }
    },
    updateListInStore: (state, action) => {
      const { listId, updates } = action.payload;
      const idx = state.lists.findIndex(l => l._id === listId);
      if (idx !== -1) {
        state.lists[idx] = { ...state.lists[idx], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Boards
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Board
      .addCase(fetchBoard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBoard = action.payload.board;
        state.lists = action.payload.lists;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Board
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.unshift(action.payload);
      })
      // Update Board
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.boards[index] = action.payload;
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      // Delete Board
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter(b => b._id !== action.payload);
      })
      // Add Member
      .addCase(addMember.fulfilled, (state, action) => {
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      // Remove Member
      .addCase(removeMember.fulfilled, (state, action) => {
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      });
  }
});

export const {
  clearCurrentBoard,
  socketBoardUpdated,
  socketListCreated,
  socketListUpdated,
  socketListDeleted,
  socketListsReordered,
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
  socketTaskMoved,
  socketMemberAdded,
  updateListInStore,
} = boardSlice.actions;

export default boardSlice.reducer;