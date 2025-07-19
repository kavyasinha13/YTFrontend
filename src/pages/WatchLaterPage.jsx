// pages/WatchLater.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoCard from "./VideoCard"; // Import the VideoCard component

export default function WatchLater() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const userId = user?._id; // Ensure userId is available for fetching user-specific playlists
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [likes, setLikes] = useState({}); // Keep track of liked status
  const [loading, setLoading] = useState(true);
  const [userPlaylists, setUserPlaylists] = useState([]); // User's playlists

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWatchLaterData = async () => {
      try {
        if (!token) {
          console.error("No token found, redirecting to login.");
          navigate("/login");
          return;
        }

        // Fetch user's watch later videos
        const watchLaterRes = await axios.get(
          "http://localhost:8000/api/v1/users/watchLater",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWatchLaterVideos(watchLaterRes.data.data || []); // Assuming data directly contains the videos

        // Fetch user's liked videos (to correctly show like status in VideoCard)
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

        // Fetch user's playlists (if you want to allow adding from watch later to other playlists)
        if (userId) {
          const playlistRes = await axios.get(
            `http://localhost:8000/api/v1/playlists/user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserPlaylists(playlistRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching watch later videos:", err);
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
        setWatchLaterVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchLaterData();
  }, [token, userId, navigate]);

  // All handler functions (toggleLike, handleWatchHistory, handleAddToWatchLater, handleAddToPlaylist, handleViewComments)
  // will be the SAME as in Home.jsx, as they interact with the *same* backend endpoints
  // You can either:
  // 1. Duplicate them (simpler for now, but less DRY)
  // 2. Create a custom hook (e.g., useVideoActions.js) to share this logic across components (recommended for larger apps)

  const toggleLike = async (videoId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/v/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const isLikedNow = res.data.data.isLiked;
      setLikes((prev) => ({ ...prev, [videoId]: isLikedNow }));

      // Optimistically update likes count in watchLaterVideos
      setWatchLaterVideos((prevVideos) =>
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
    try {
      await axios.post(
        `http://localhost:8000/api/v1/users/history/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error adding to watch history:", err);
    }
  };

  const handleAddToWatchLater = async (videoId) => {
    try {
      // Assuming this endpoint also removes from watch later if already present
      await axios.post(
        `http://localhost:8000/api/v1/users/watchLater/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Watch Later status updated ✅");
      // Remove video from watchLaterVideos state if it was removed from watch later
      setWatchLaterVideos((prevVideos) =>
        prevVideos.filter((v) => v._id !== videoId)
      );
    } catch (error) {
      console.error("Failed to toggle Watch Later status:", error);
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

  if (loading)
    return (
      <p className="text-center text-gray-500 text-lg">
        Loading watch later videos...
      </p>
    );
  if (watchLaterVideos.length === 0)
    return (
      <p className="text-center text-gray-600 text-lg mt-10">
        No videos in Watch Later.
      </p>
    );

  return (
    <div className="flex min-h-screen bg-gray-100 p-6">
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Your Watch Later List
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchLaterVideos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              isLiked={likes[video._id]}
              onToggleLike={toggleLike}
              onAddToWatchLater={handleAddToWatchLater} // This will now remove from watch later if clicked again
              onViewComments={handleViewComments}
              onVideoPlay={handleWatchHistory}
              userPlaylists={userPlaylists}
              onAddToPlaylist={handleAddToPlaylist}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
