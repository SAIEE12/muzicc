import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { PlayerBar } from "./PlayerBar";

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
