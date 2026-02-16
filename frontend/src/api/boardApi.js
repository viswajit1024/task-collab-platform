import api from './axiosConfig';

export const boardApi = {
  getBoards: (params) => api.get('/boards', { params }),
  getBoard: (id) => api.get(`/boards/${id}`),
  createBoard: (data) => api.post('/boards', data),
  updateBoard: (id, data) => api.put(`/boards/${id}`, data),
  deleteBoard: (id) => api.delete(`/boards/${id}`),
  addMember: (id, data) => api.post(`/boards/${id}/members`, data),
  removeMember: (boardId, userId) => api.delete(`/boards/${boardId}/members/${userId}`),
};