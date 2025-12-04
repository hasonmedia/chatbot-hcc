import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/responsive.css";
import "./styles/chat-container.css";
import App from "./App.tsx";
import { AuthProvider } from "./components/context/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </>
);
