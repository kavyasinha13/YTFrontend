
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/user/userSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token"); 
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">YTClone</Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/upload" className="text-blue-600">Upload</Link>
            <button
              onClick={handleLogout}
              className="text-red-500 border px-3 py-1 rounded hover:bg-red-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-600">Login</Link>
            <Link to="/register" className="text-blue-600">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
