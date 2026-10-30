import { createFileRoute } from "@tanstack/react-router";
import { FrontApp } from "@/components/FrontApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FrontApp />;
}
