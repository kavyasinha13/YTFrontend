// pages/WatchHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import VideoCard from "./VideoCard"; // Import the VideoCard component

export default function WatchHistory() {
  const navigate = useNavigate(); // Initialize navigate
  const user = useSelector((state) => state.user.user);
  const userId = user?._id; // Get userId for fetching playlists
  const [historyVideos, setHistoryVideos] = useState([]);
  const [likes, setLikes] = useState({}); // To track liked status for VideoCard
  const [userPlaylists, setUserPlaylists] = useState([]); // To pass to VideoCard for playlist functionality
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        if (!token) {
          console.error("No token found, redirecting to login.");
          navigate("/login"); // Redirect if not authenticated
          return;
        }

        // 1. Fetch watch history
        const historyRes = await axios.get(
          "http://localhost:8000/api/v1/users/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Assuming history endpoint returns an array of video objects directly
        setHistoryVideos(historyRes.data.data || []);

        // 2. Fetch user's liked videos (to correctly show like status in VideoCard)
        const likeRes = await axios.get(
          "http://localhost:8000/api/v1/likes/videos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const likedMap = {};
        likeRes.data.data.forEach((entry) => {
          if (entry.likedVideo?._id) {
            likedMap[entry.likedVideo._id] = true;
          }
        });
        setLikes(likedMap);

        // 3. Fetch user's playlists (if you want to allow adding from history to other playlists)
        if (userId) {
          const playlistRes = await axios.get(
            `http://localhost:8000/api/v1/playlists/user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserPlaylists(playlistRes.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching watch history data:", error);
        setHistoryVideos([]);
        if (error.response && error.response.status === 401) {
          navigate("/login"); // Redirect to login on auth failure
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [token, userId, navigate]); // Add dependencies

  // --- Reusable Handler Functions (Same as in Home.jsx and WatchLater.jsx) ---
  // Ideally, these would be in a custom hook (e.g., useVideoActions.js)
  // to avoid duplication across Home, WatchLater, History, etc.
  // For now, we'll duplicate them for clarity.

  const toggleLike = async (videoId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/v/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const isLikedNow = res.data.data.isLiked;
      setLikes((prev) => ({ ...prev, [videoId]: isLikedNow }));

      // Optimistically update likes count in historyVideos
      setHistoryVideos((prevVideos) =>
        prevVideos.map((video) => {
          if (video._id === videoId) {
            return {
              ...video,
              likesCount: isLikedNow
                ? video.likesCount + 1
                : video.likesCount - 1,
            };
          }
          return video;
        })
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to toggle like 😢");
    }
  };

  const handleWatchHistory = async (videoId) => {
    // This function is technically called when a video is played
    // from any page, including the history page itself.
    // The backend endpoint typically adds a new entry or updates
    // an existing one's timestamp. No UI change needed here.
    try {
      await axios.post(
        `http://localhost:8000/api/v1/users/history/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // No alert needed for history update, it's a background action
    } catch (err) {
      console.error("Error adding to watch history:", err);
    }
  };

  const handleAddToWatchLater = async (videoId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/users/watchLater/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Watch Later status updated ✅");
      // If the backend toggles, you might want to remove from Watch Later list if it was removed
      // setWatchLaterVideos(prevVideos => prevVideos.filter(v => v._id !== videoId));
    } catch (error) {
      console.error("Failed to add/remove from Watch Later:", error);
      alert("Failed to update Watch Later status 😢");
    }
  };

  const handleAddToPlaylist = async (videoId, playlistId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/playlists/add/${videoId}/${playlistId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Video added to playlist ✅");
    } catch (error) {
      console.error("Failed to add video to playlist:", error);
      alert("Failed to add to playlist 😢");
    }
  };

  const handleViewComments = (videoId) => {
    navigate(`/comments/${videoId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-6">
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Your Watch History
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 text-lg">
            Loading watch history...
          </p>
        ) : historyVideos.length === 0 ? (
          <p className="text-center text-gray-600 text-lg mt-10">
            No videos in your watch history.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {historyVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                isLiked={likes[video._id]} // Pass the liked status
                onToggleLike={toggleLike}
                onAddToWatchLater={handleAddToWatchLater}
                onViewComments={handleViewComments}
                onVideoPlay={handleWatchHistory} // Link clicks/plays add to history
                userPlaylists={userPlaylists}
                onAddToPlaylist={handleAddToPlaylist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
