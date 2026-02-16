import api from './axiosConfig';

export const taskApi = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  moveTask: (id, data) => api.put(`/tasks/${id}/move`, data),
  assignTask: (id, data) => api.put(`/tasks/${id}/assign`, data),
};