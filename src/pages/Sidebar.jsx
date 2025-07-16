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
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/user/userSlice.js";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menu = [
    { name: "Home", icon: Home, route: "/home" },
    { name: "Tweets", icon: MessageSquare, route: "/tweets" },
    { name: "Playlists", icon: Book, route: "/playlists" },
    { name: "History", icon: Clock, route: "/history" },
    { name: "Watch Later", icon: Heart, route: "/users/watchLater" },
    { name: "Liked Videos", icon: Video, route: "/videos" },
    { name: "Upload", icon: UploadCloud, route: "/upload" },
    { name: "Profile", icon: User, route: `/c/${user?.username}` },
    { name: "Logout", icon: LogOut, action: handleLogout, authOnly: true },
  ];

  return (
    <aside className="w-60 min-h-screen bg-red-500 border-r px-4 py-6">
      <ul className="space-y-4">
        {menu.map((item) => {
          const IconComponent = item.icon;
          return (
            <li
              key={item.name}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 cursor-pointer"
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.route) {
                  navigate(item.route);
                }
              }}
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
