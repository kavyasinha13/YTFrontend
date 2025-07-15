import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/user/userSlice";

export default function Navbar() {
  const { user } = useSelector((state) => state.user);

  return (
    <nav className="bg-blue-400 text-gray-800 border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow">
      <Link to="/" className="text-xl font-bold">
        TwitterTube
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <span className="text-gray-700 font-medium">
            Welcome, {user.fullName}
          </span>
        ) : (
          <>
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-blue-600">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
