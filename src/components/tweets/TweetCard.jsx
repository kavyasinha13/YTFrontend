import React from "react";
import { useState } from "react";
import {
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Edit,
  Trash2,
} from "lucide-react";
import EditTweetModal from "./EditTweetModal";
import { Link } from "react-router-dom";
import axios from "axios";

export default function TweetCard({ tweet, setRefresh }) {
  const token = localStorage.getItem("token");
  let loggedInUserId = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      loggedInUserId = payload._id;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }
  const isOwner = tweet.owner?._id === loggedInUserId;

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [likes, setLikes] = useState(tweet.likes || []);
  const isLiked = likes.includes(loggedInUserId);

  const handleLike = async () => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/t/${tweet._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (likes.includes(loggedInUserId)) {
        setLikes((prev) => prev.filter((id) => id !== loggedInUserId));
      } else {
        setLikes((prev) => [...prev, loggedInUserId]);
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this tweet?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/tweets/${tweet._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm relative">
      {/* Username + Menu */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">
            @{tweet.owner?.username}
          </h4>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-gray-500"
            >
              <MoreVertical className="cursor-pointer" />
            </button>

            {showMenu && (
              <div
                onMouseLeave={() => setShowMenu(false)}
                className="absolute right-0 mt-2 bg-white border rounded shadow w-28 z-20"
              >
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-3">{tweet.content}</p>

      {/* Actions */}
      <div className="flex gap-6 text-gray-600 text-sm">
        <button className="flex items-center gap-1" onClick={handleLike}>
          <ThumbsUp
            className={`w-4 h-4 ${isLiked ? "text-blue-600" : "text-gray-500"}`}
          />

          {likes?.length || 0}
        </button>

        {/* This navigates to TweetDetail.jsx */}
        <Link
          to={`/tweets/${tweet._id}`}
          className="flex items-center gap-1 hover:underline"
        >
          <MessageCircle className="w-4 h-4" />
          Comments
        </Link>
      </div>
      {showEditModal && (
        <EditTweetModal
          tweet={tweet}
          onClose={() => setShowEditModal(false)}
          setRefresh={setRefresh}
        />
      )}
    </div>
  );
}
