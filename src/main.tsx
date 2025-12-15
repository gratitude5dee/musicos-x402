import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./App.css";

// Fix: some SDKs (e.g. Story Protocol) pull in dotenv which expects Node's process.cwd()
// We provide a tiny browser-safe polyfill to avoid a blank screen.
const g = globalThis as any;
if (!g.process) g.process = {};
if (typeof g.process.cwd !== "function") g.process.cwd = () => "/";
if (!g.process.env) g.process.env = {};

createRoot(document.getElementById("root")!).render(<App />);

