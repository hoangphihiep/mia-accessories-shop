import api from './api';

export const settingService = {
  getAllSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings: Record<string, string>) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
};
