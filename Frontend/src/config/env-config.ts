interface EnvConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  nodeEnv: string;
}

export const envConfig: EnvConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    "https://ardis-nondistracting-cogitatively.ngrok-free.dev",
  wsBaseUrl:
    import.meta.env.VITE_WS_BASE_URL ||
    "wss://ardis-nondistracting-cogitatively.ngrok-free.dev",
  nodeEnv: import.meta.env.VITE_NODE_ENV || "development",
};
