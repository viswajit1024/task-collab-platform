import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listApi } from '../../api/listApi';

export const createList = createAsyncThunk(
  'lists/createList',
  async (data, { rejectWithValue }) => {
    try {
      const response = await listApi.createList(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await listApi.updateList(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (id, { rejectWithValue }) => {
    try {
      await listApi.deleteList(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const reorderLists = createAsyncThunk(
  'lists/reorderLists',
  async (data, { rejectWithValue }) => {
    try {
      await listApi.reorderLists(data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const listSlice = createSlice({
  name: 'lists',
  initialState: {
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createList.pending, (state) => { state.isLoading = true; })
      .addCase(createList.fulfilled, (state) => { state.isLoading = false; })
      .addCase(createList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default listSlice.reducer;