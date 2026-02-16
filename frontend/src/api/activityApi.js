import api from './axiosConfig';

export const activityApi = {
  getActivities: (params) => api.get('/activities', { params }),
};