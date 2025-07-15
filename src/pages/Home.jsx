import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

/*todo- 
comments are only showing for the logged in user - problem solved but the username is only visible after reload
*/
export default function Home() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [likes, setLikes] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [watchLater, setWatchLater] = useState({});
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

        const watchLaterRes = await axios.get(
          "http://localhost:8000/api/v1/users/watchLater",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const watchLaterVideos = watchLaterRes.data.data || [];
        const watchLaterMap = {};
        watchLaterVideos.forEach((video) => {
          watchLaterMap[video._id] = true;
        });
        setWatchLater(watchLaterMap);

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

  const handleAddToWatchLater = async (videoId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/users/watchLater/${videoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Added to Watch Later ✅");
    } catch (error) {
      console.error("Failed to add to Watch Later:", error);
      alert("Failed to add 😢");
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
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4"
              >
                <h3 className="font-semibold truncate">{video.title}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {video.description}
                </p>
                <video
                  src={video.videoFile?.url}
                  poster={video.thumbnail?.url}
                  controls
                  className="w-full mt-2 rounded"
                  onPlay={() => handleWatchHistory(video._id)}
                />
                <button
                  onClick={() => handleAddToWatchLater(video._id)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1 rounded-full shadow"
                  title="Add to Watch Later"
                >
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>

                <p className=" my-3 text-sm text-blue-600 cursor-pointer hover:underline">
                  <Link to={`/c/${video.ownerDetails.username}`}>
                    {video.ownerDetails.username}
                  </Link>
                </p>

                {/*views count*/}
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1 px-1">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>{video.views} views</span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(video._id)}
                    className="hover:text-red-500 transition-colors duration-150"
                    title="Like/Unlike"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likes[video._id] ? "text-red-500" : "text-gray-400"
                      }`}
                      fill={likes[video._id] ? "red" : "none"}
                    />
                    <span>{video.likesCount || 0} likes</span>
                  </button>
                </div>

                {/* Comments */}
                <button
                  onClick={() => navigate(`/comments/${video._id}`)}
                  className="hover:text-blue-500 transition-colors duration-150"
                  title="View/Add Comments"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
