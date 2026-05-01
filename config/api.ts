export const BASE_URL = "http://192.168.1.4:8000";

export const API_ENDPOINTS = {
  diseaseDetect: `${BASE_URL}/api/disease/detect`,
  diseaseHistory: `${BASE_URL}/api/disease/history`,
  communityAlert: `${BASE_URL}/api/community-alert/send-email`,
  fertilizerPredict: `${BASE_URL}/api/fertilizer/predict`,
  fertilizerHistory: `${BASE_URL}/api/fertilizer/history`,
  yieldHistory: `${BASE_URL}/api/yield/history`,
  yieldPredict: `${BASE_URL}/yield/predict`,
};