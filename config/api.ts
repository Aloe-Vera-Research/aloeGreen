export const BASE_URL = "http://192.168.1.4:8000";

export const API_ENDPOINTS = {
  diseaseDetect: `${BASE_URL}/api/disease/detect`,
  communityAlert: `${BASE_URL}/api/community-alert/send-email`,
  fertilizerPredict: `${BASE_URL}/api/fertilizer/predict`,
  yieldHistory: `${BASE_URL}/api/yield/history`,
  yieldPredict: `${BASE_URL}/yield/predict`,
};