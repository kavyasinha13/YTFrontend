import React, { useState } from "react";
import axios from "axios";

export default function EditTweetModal({ tweet, onClose, setRefresh }) {
  const [content, setContent] = useState(tweet.content);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!content.trim()) return alert("Tweet cannot be empty.");
    try {
      setLoading(true);
      await axios.patch(
        `http://localhost:8000/api/v1/tweets/${tweet._id}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLoading(false);
      setRefresh((prev) => !prev);
      onClose(); // close modal after update
    } catch (err) {
      console.error("Failed to update tweet", err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Tweet</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded resize-none"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-black"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
