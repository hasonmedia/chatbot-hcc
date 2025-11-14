interface EnvConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  nodeEnv: string;
}

export const envConfig: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://192.168.1.216:8000",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || "ws://192.168.1.216:8000",
  nodeEnv: import.meta.env.VITE_NODE_ENV || "development",
};
