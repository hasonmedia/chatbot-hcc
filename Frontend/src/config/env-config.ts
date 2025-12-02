interface EnvConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  nodeEnv: string;
}

export const envConfig: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000",
  nodeEnv: import.meta.env.VITE_NODE_ENV || "development",
};
