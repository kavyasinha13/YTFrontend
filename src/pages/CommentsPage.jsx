import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CommentsPage() {
  const { videoId } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const token = localStorage.getItem("token");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [videoOwnerId, setVideoOwnerId] = useState(null);

  useEffect(() => {
    const fetchCommentsAndUser = async () => {
      try {
        const userRes = await axios.get(
          `http://localhost:8000/api/v1/users/current-user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrentUserId(userRes.data.data._id);

        const videoRes = await axios.get(
          `http://localhost:8000/api/v1/videos/${videoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVideoOwnerId(videoRes.data.data.owner._id);

        const commentRes = await axios.get(
          `http://localhost:8000/api/v1/comments/${videoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setComments(commentRes.data.data.docs || []);
      } catch (err) {
        console.error("Error loading", err);
      }
    };

    fetchCommentsAndUser();
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

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/comments/c/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment", err);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/v1/comments/c/${commentId}`,
        { content: editContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments(
        comments.map((comment) =>
          comment._id === commentId ? res.data.data : comment
        )
      );
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error updating comment", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comments</h2>

        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition mb-4"
          rows={3}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <button
          onClick={handleAddComment}
          className={`w-full py-2 rounded text-white font-medium transition 
            ${
              newComment.trim()
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          disabled={!newComment.trim()}
        >
          Post
        </button>

        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No comments yet. Be the first one!
            </p>
          ) : (
            comments.map((comment) => {
              const ownerId =
                typeof comment.owner === "string"
                  ? comment.owner
                  : comment.owner?._id;
              const isOwner = ownerId === currentUserId;
              const canDelete = isOwner || videoOwnerId === currentUserId;

              return (
                <div
                  key={comment._id}
                  className="border border-gray-200 rounded-md p-4 bg-gray-50 hover:shadow"
                >
                  {editingId === comment._id ? (
                    <>
                      <textarea
                        className="w-full p-2 text-sm border rounded"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700">{comment.content}</p>
                      <div className="text-xs text-gray-500 italic flex justify-between items-center mt-2">
                        <span>— {comment?.owner?.username || "Anonymous"}</span>
                        <div className="flex gap-2">
                          {isOwner && (
                            <button
                              onClick={() => startEdit(comment)}
                              className="text-blue-500 hover:underline text-xs"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-500 hover:underline text-xs"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
