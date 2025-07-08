import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { Link } from "react-router-dom";

/*todo- 
comments are only showing for the logged in user - problem solved but the username is only visible after reload
*/
export default function Home() {
  const [videos, setVideos] = useState([]);
  const [likes, setLikes] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token"); // Extract token

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        if (!token) {
          console.error("No token found");
          return;
        }

        const res = await axios.get("http://localhost:8000/api/v1/videos", {
          headers: {
            Authorization: `Bearer ${token}`, // Add token dynamically
          },
        });

        const docs = res?.data?.data?.docs || [];
        setVideos(docs);

        // fetch likes
        const likeRes = await axios.get(
          "http://localhost:8000/api/v1/likes/videos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const likedVideos = likeRes.data.data || [];
        const likedMap = {};
        likedVideos.forEach((entry) => {
          if (entry.likedVideo?._id) {
            likedMap[entry.likedVideo._id] = true;
          }
        });
        setLikes(likedMap);

        // fetch comments
        const commentsMap = {};
        const showCommentsMap = {}; // new object to open comments by default

        for (const video of docs) {
          const commentRes = await axios.get(
            `http://localhost:8000/api/v1/comments/${video._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          commentsMap[video._id] = commentRes.data.data || [];

          // automatically show comments for each video
          showCommentsMap[video._id] = true;
        }

        setComments(commentsMap);
        setShowComments(showCommentsMap); //  apply visibility
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const toggleLike = async (videoId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/v/${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLikes((prev) => ({
        ...prev,
        [videoId]: res.data.data.isLiked,
      }));
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };

  const fetchComments = async (videoId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comments/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments((prev) => ({
        ...prev,
        [videoId]: res.data.data,
      }));
    } catch (err) {
      console.error("Error fetching comments", err);
    }
  };

  const handleCommentSubmit = async (videoId, e) => {
    e.preventDefault();
    const content = commentForms[videoId];
    if (!content?.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/${videoId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset comment input
      setCommentForms((prev) => ({ ...prev, [videoId]: "" }));

      // Append the new comment to the existing comments array (most recent at top)
      setComments((prev) => {
        const existing = prev[videoId] || { docs: [], totalDocs: 0 };

        return {
          ...prev,
          [videoId]: {
            ...existing,
            docs: [res.data.data, ...existing.docs], //  push new comment into docs[]
            totalDocs: existing.totalDocs + 1,
          },
        };
      });
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const handleWatchHistory = async (videoId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/users/history/${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error adding to watch history", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-400">
      {/* Sidebar */}
      <div className="w-[240px] bg-red-500 border-r min-h-screen">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">All Videos</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : videos.length === 0 ? (
          <p className="text-center text-gray-500">No videos found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4"
              >
                <img
                  src={video.thumbnail?.url}
                  alt={video.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="font-semibold truncate">{video.title}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {video.description}
                </p>

                <video
                  src={video.videoFile?.url}
                  controls
                  className="w-full mt-2 rounded"
                  onPlay={() => handleWatchHistory(video._id)}
                />

                <p className=" my-3 text-sm text-blue-600 cursor-pointer hover:underline">
                  <Link to={`/c/${video.ownerDetails.username}`}>
                    {video.ownerDetails.username}
                  </Link>
                </p>

                <div className="flex justify-between items-center text-sm text-gray-600 mt-1 px-1">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>{video.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke="none"
                    >
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
               4.42 3 7.5 3c1.74 0 3.41 0.81 
               4.5 2.09C13.09 3.81 14.76 3 
               16.5 3 19.58 3 22 5.42 22 
               8.5c0 3.78-3.4 6.86-8.55 
               11.54L12 21.35z"
                      />
                    </svg>
                    <span>{video.likesCount || 0} likes</span>
                  </div>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(video._id)}
                  className={`mt-2 px-3 py-1 rounded text-white w-full ${
                    likes[video._id] ? "bg-red-500" : "bg-gray-600"
                  }`}
                >
                  {likes[video._id] ? "Unlike" : "Like"}
                </button>

                {/* Comments */}
                <form
                  onSubmit={(e) => handleCommentSubmit(video._id, e)}
                  className="mt-4"
                >
                  <textarea
                    className="w-full border rounded p-2 mb-2 text-sm"
                    rows={2}
                    placeholder="Add a comment..."
                    value={commentForms[video._id] || ""}
                    onChange={(e) =>
                      setCommentForms((prev) => ({
                        ...prev,
                        [video._id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Post Comment
                  </button>
                </form>

                {comments[video._id]?.docs?.length > 0 ? (
                  <div className="mt-2 space-y-2 text-sm max-h-40 overflow-y-auto">
                    {comments[video._id].docs.map((comment) => (
                      <div
                        key={comment._id}
                        className="border-t border-gray-200 pt-2"
                      >
                        <p>{comment.content}</p>
                        <p className="text-xs text-gray-400">
                          — {comment.owner?.username || "Anonymous"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">No comments yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
