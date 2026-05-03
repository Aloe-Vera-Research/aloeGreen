import { useMemo } from "react";
import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";


const DEFAULT_BASE_URL = "http://172.20.10.5:8000";

function getBaseUrl(): string {

  const expoConfig: any = Constants.expoConfig || Constants.manifest;
  const extra = expoConfig?.extra || {};
  return extra.API_URL || DEFAULT_BASE_URL;
}

export function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // You can also add request/response interceptors here if you need to inject
  // auth tokens, log, catch errors, etc.
  //
  // instance.interceptors.response.use(
  //   r => r,
  //   err => {
  //     // handle global errors
  //     return Promise.reject(err);
  //   }
  // );

  return instance;
}


export default function useAxios(): AxiosInstance {
  return useMemo(createAxiosInstance, []);
}