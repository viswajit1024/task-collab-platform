import boardReducer, {
  clearCurrentBoard,
  socketListCreated,
  socketListDeleted,
  socketTaskCreated,
  socketTaskDeleted,
} from '../../store/slices/boardSlice';

describe('boardSlice', () => {
  const initialState = {
    boards: [],
    currentBoard: null,
    lists: [],
    pagination: null,
    isLoading: false,
    error: null,
  };

  test('should return initial state', () => {
    expect(boardReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should clear current board', () => {
    const state = {
      ...initialState,
      currentBoard: { _id: '1', title: 'Test' },
      lists: [{ _id: 'l1', title: 'List 1', tasks: [] }]
    };
    const result = boardReducer(state, clearCurrentBoard());
    expect(result.currentBoard).toBeNull();
    expect(result.lists).toEqual([]);
  });

  test('should add list via socket', () => {
    const newList = { _id: 'l2', title: 'New List', tasks: [] };
    const result = boardReducer(initialState, socketListCreated(newList));
    expect(result.lists).toHaveLength(1);
    expect(result.lists[0].title).toBe('New List');
  });

  test('should remove list via socket', () => {
    const state = {
      ...initialState,
      lists: [
        { _id: 'l1', title: 'List 1', tasks: [] },
        { _id: 'l2', title: 'List 2', tasks: [] },
      ]
    };
    const result = boardReducer(state, socketListDeleted({ listId: 'l1' }));
    expect(result.lists).toHaveLength(1);
    expect(result.lists[0]._id).toBe('l2');
  });

  test('should add task to list via socket', () => {
    const state = {
      ...initialState,
      lists: [{ _id: 'l1', title: 'List 1', tasks: [] }]
    };
    const task = { _id: 't1', title: 'New Task', list: 'l1' };
    const result = boardReducer(state, socketTaskCreated(task));
    expect(result.lists[0].tasks).toHaveLength(1);
  });

  test('should remove task from list via socket', () => {
    const state = {
      ...initialState,
      lists: [{
        _id: 'l1',
        title: 'List 1',
        tasks: [{ _id: 't1', title: 'Task 1' }, { _id: 't2', title: 'Task 2' }]
      }]
    };
    const result = boardReducer(state, socketTaskDeleted({ taskId: 't1', listId: 'l1' }));
    expect(result.lists[0].tasks).toHaveLength(1);
    expect(result.lists[0].tasks[0]._id).toBe('t2');
  });
});