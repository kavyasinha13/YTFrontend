import React from "react";
import Sidebar from "../pages/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import SearchBar from "../pages/SearchBar.jsx";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-white-400">
      {/* Sidebar on the left */}
      <div className="w-[240px] bg-red-500 border-r min-h-screen">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Search Bar at the Top */}
        <div className="w-full border-b p-4 bg-white sticky top-0 z-10">
          <SearchBar />
        </div>

        {/* Actual Page Content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
