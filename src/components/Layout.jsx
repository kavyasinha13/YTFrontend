import React from "react";
import Sidebar from "../pages/Sidebar.jsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-white-400">
      <div className="w-[240px] bg-red-500 border-r min-h-screen">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
