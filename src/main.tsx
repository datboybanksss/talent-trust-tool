import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('[App] BUILD_ID', __BUILD_ID__, 'loaded at', new Date().toISOString());
createRoot(document.getElementById("root")!).render(<App />);
