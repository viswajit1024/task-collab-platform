import api from './axiosConfig';

export const listApi = {
  createList: (data) => api.post('/lists', data),
  updateList: (id, data) => api.put(`/lists/${id}`, data),
  deleteList: (id) => api.delete(`/lists/${id}`),
  reorderLists: (data) => api.put('/lists/reorder', data),
};