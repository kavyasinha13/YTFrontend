// Sidebar.jsx
import React from "react";
import {
  Home,
  Flame,
  Book,
  Clock,
  Heart,
  Video,
  UploadCloud,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const menu = [
    { name: "Home", icon: Home },
    { name: "Trending", icon: Flame },
    { name: "Library", icon: Book },
    { name: "History", icon: Clock, path: "/history" },
    { name: "Watch Later", icon: Heart },
    { name: "Liked Videos", icon: Video },
    { name: "Upload", icon: UploadCloud, route: "/upload" },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
    { name: "Logout", icon: LogOut },
  ];

  return (
    <aside className="w-60 min-h-screen bg-red-500 border-r px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">VideoHub</h2>
      <ul className="space-y-4">
        {menu.map((item) => {
          const IconComponent = item.icon;
          return (
            <li
              key={item.name}
              onClick={() => navigate(item.route)}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              <IconComponent className="w-5 h-5" />
              <span>{item.name}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
