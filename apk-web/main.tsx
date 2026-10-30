import { createRoot } from "react-dom/client";
import { FrontApp } from "@/components/FrontApp";
import "./app.css";

const root = document.getElementById("root");
if (root) createRoot(root).render(<FrontApp />);
