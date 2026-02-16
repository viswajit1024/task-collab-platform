import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskApi } from '../../api/taskApi';

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTask(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ id }, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskApi.moveTask(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const assignTask = createAsyncThunk(
  'tasks/assignTask',
  async ({ id, userId, action }, { rejectWithValue }) => {
    try {
      const response = await taskApi.assignTask(id, { userId, action });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const searchTasks = createAsyncThunk(
  'tasks/searchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    searchResults: [],
    searchPagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchTasks.pending, (state) => { state.isLoading = true; })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data;
        state.searchPagination = action.payload.pagination;
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSearchResults } = taskSlice.actions;
export default taskSlice.reducer;