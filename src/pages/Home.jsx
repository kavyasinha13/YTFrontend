// pages/Home.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VideoCard from "./VideoCard"; // Import the new VideoCard component

export default function Home() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const userId = user?._id;
  const [commentsCounts, setCommentsCounts] = useState({});
  const [videos, setVideos] = useState([]);
  const [likes, setLikes] = useState({}); // Stores liked status by video ID
  const [watchLaterStatus, setWatchLaterStatus] = useState({}); // Stores watch later status by video ID
  const [loading, setLoading] = useState(true);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (!token) {
          console.error("No token found, redirecting to login.");
          navigate("/login");
          return;
        }

        // Fetch all videos
        const videosRes = await axios.get(
          "http://localhost:8000/api/v1/videos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVideos(videosRes?.data?.data?.docs || []);

        // Fetch user's liked videos
        const likedVideosRes = await axios.get(
          "http://localhost:8000/api/v1/likes/videos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const likedMap = {};
        likedVideosRes.data.data.forEach((entry) => {
          if (entry.likedVideo?._id) {
            likedMap[entry.likedVideo._id] = true;
          }
        });
        setLikes(likedMap);

        // Fetch user's watch later videos
        const watchLaterRes = await axios.get(
          "http://localhost:8000/api/v1/users/watchLater",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const watchLaterMap = {};
        watchLaterRes.data.data.forEach((video) => {
          watchLaterMap[video._id] = true;
        });
        setWatchLaterStatus(watchLaterMap);

        // Fetch user's playlists
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
        console.error("Error fetching initial data:", err);
        // Handle specific errors like 401 (unauthorized)
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [token, userId, navigate]);

  const toggleLike = async (videoId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/v/${videoId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const isLikedNow = res.data.data.isLiked;

      setLikes((prev) => ({ ...prev, [videoId]: isLikedNow }));

      setVideos((prevVideos) =>
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Error adding to watch history:", err);
    }
  };

  const handleAddToWatchLater = async (videoId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/users/watchLater/${videoId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Added to Watch Later ");

      setWatchLaterStatus((prev) => ({ ...prev, [videoId]: true }));
    } catch (error) {
      console.error("Failed to add to Watch Later:", error);
      alert("Failed to add to Watch Later 😢");
    }
  };

  const handleAddToPlaylist = async (videoId, playlistId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/playlists/add/${videoId}/${playlistId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Video added to playlist ");
      // No need to update specific state here, just confirmation
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
      {" "}
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Explore Videos
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-center text-gray-600 text-lg mt-10">
            No videos found. Start uploading!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                isLiked={likes[video._id]} // Pass the liked status
                onToggleLike={toggleLike}
                onAddToWatchLater={handleAddToWatchLater}
                onViewComments={handleViewComments}
                onVideoPlay={handleWatchHistory}
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
