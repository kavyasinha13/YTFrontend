import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import axios from "axios";


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
      const likeRes = await axios.get("http://localhost:8000/api/v1/likes/videos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      const res = await axios.post(`http://localhost:8000/api/v1/comments/${videoId}`,
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


  return (
    <>
      <div className="flex">
        <Sidebar />
     <div className="ml-60 p-6 w-full">
     
     <div className="p-4"> 
      <h2 className="text-2xl font-bold mb-4 text-center">All Videos</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-500">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  
  {videos.map((video) => (
  <div
    key={video._id}
    className="bg-white rounded shadow hover:shadow-lg transition p-4"
  >
    <img
      src={video.thumbnail?.url}
      alt={video.title}
      className="w-full h-48 object-cover rounded mb-2"
    />
    <h3 className="font-semibold">{video.title}</h3>
    <p className="text-sm text-gray-600 truncate">{video.description}</p>

    <video
      src={video.videoFile?.url}
      controls
      className="w-full mt-2 rounded"
    ></video>

    {/* Like Button */}
    <button
      onClick={() => toggleLike(video._id)}
      className={`mt-2 px-3 py-1 rounded text-white ${
        likes[video._id] ? "bg-red-500" : "bg-gray-500"
      }`}
    >
      {likes[video._id] ? "Unlike" : "Like"}
    </button>

    {/* Comment Section (always shown now) */}
    <div className="mt-4">
      {/* Comment Form */}
      <form
        onSubmit={(e) => handleCommentSubmit(video._id, e)}
        className="mb-3"
      >
        <textarea
          className="w-full border rounded p-2 mb-2"
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
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Post Comment
        </button>
      </form>

      {comments[video._id]?.docs?.length > 0 ? (
  <div className="space-y-2 text-sm">
    {comments[video._id].docs.map((comment) => (
      <div key={comment._id} className="border-t border-gray-200 pt-2">
        <p>{comment.content}</p>
        <p className="text-xs text-gray-400">
          — {comment.owner?.username || "Anonymous"}
        </p>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-500 text-sm">No comments yet.</p>
)}


    </div>
  </div>
))}

        </div>
      )}
    </div>
    </div>
   </div>
</>);
}
