import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CommentsPage() {
  const { videoId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/comments/${videoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setComments(res.data.data.docs || []);
      } catch (err) {
        console.error("Error loading comments", err);
      }
    };

    fetchComments();
  }, [videoId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/${videoId}`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments([res.data.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <textarea
        className="w-full border rounded p-2 mb-2 text-sm"
        rows={3}
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <button
        onClick={handleAddComment}
        className={`px-4 py-1 rounded text-white ${
          newComment.trim()
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!newComment.trim()}
      >
        Post
      </button>

      <div className="mt-4 space-y-3">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="border-t border-gray-200 pt-2 text-sm"
          >
            <p>{comment.content}</p>
            <p className="text-xs text-gray-400">
              — {comment.owner?.username || "Anonymous"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
