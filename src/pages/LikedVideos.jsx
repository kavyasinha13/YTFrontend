import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import VideoCard from "./VideoCard";

function LikedVideos() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const userId = user?._id;

  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Add state for overall liked status map and user playlists
  // 'likes' map is needed because VideoCard expects a map to know if a video is liked
  const [likes, setLikes] = useState({});
  // 'userPlaylists' is needed for the 'Add to Playlist' functionality in VideoCard
  const [userPlaylists, setUserPlaylists] = useState([]);

  useEffect(() => {
    const fetchLikedVideosData = async () => {
      try {
        // Add authentication check
        if (!token) {
          console.error("No token found, redirecting to login.");
          navigate("/login");
          return;
        }

        // 1. Fetch liked videos (Primary data for this page)
        const res = await axios.get(
          "http://localhost:8000/api/v1/likes/videos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const videos = res.data.data || [];

        const cleanedVideos = videos
          .filter((entry) => entry.likedVideo)
          .map((entry) => entry.likedVideo);

        setLikedVideos(cleanedVideos);

        //  Populate the 'likes' state for VideoCard
        // Since all videos on this page ARE liked, we can pre-fill the map.
        const currentLikedMap = {};
        cleanedVideos.forEach((video) => {
          currentLikedMap[video._id] = true;
        });
        setLikes(currentLikedMap);

        //  Fetch user's playlists for VideoCard
        // This is necessary if you want to allow adding these videos to other playlists
        if (userId) {
          const playlistRes = await axios.get(
            `http://localhost:8000/api/v1/playlists/user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserPlaylists(playlistRes.data.data || []);
        }
        //
      } catch (err) {
        console.error("Error fetching liked videos data:", err);
        setLikedVideos([]);
        //  Handle authentication errors
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideosData();
    //Add dependencies to useEffect
  }, [token, userId, navigate]);

  const toggleLike = async (videoId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/v/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const isLikedNow = res.data.data.isLiked;
      setLikes((prev) => ({ ...prev, [videoId]: isLikedNow }));

      // If the user unlikes a video from this page, remove it from the list
      if (!isLikedNow) {
        setLikedVideos((prevVideos) =>
          prevVideos.filter((video) => video._id !== videoId)
        );
      } else {
      }

      // Optimistically update likesCount for the specific video
      setLikedVideos((prevVideos) =>
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
      await axios.post(
        `http://localhost:8000/api/v1/users/watchLater/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Watch Later status updated ✅");
      // If your backend endpoint toggles, you might need state updates here too
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
    // : Changed background color for consistency
    <div className="flex min-h-screen bg-gray-100 p-6">
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          Your Liked Videos
        </h2>
        {loading ? (
          // : Improved loading message style
          <p className="text-center text-gray-500 text-lg">
            Loading your liked videos...
          </p>
        ) : //
        likedVideos.length === 0 ? (
          // : Improved empty state message style
          <p className="text-center text-gray-600 text-lg mt-10">
            You haven't liked any videos yet.
          </p>
        ) : (
          //
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedVideos.map((video) => (
              // : Replace manual video rendering with VideoCard
              <VideoCard
                key={video._id}
                video={video}
                isLiked={likes[video._id]} // Pass the liked status (should be true for all here)
                onToggleLike={toggleLike}
                onAddToWatchLater={handleAddToWatchLater}
                onViewComments={handleViewComments}
                onVideoPlay={handleWatchHistory}
                userPlaylists={userPlaylists}
                onAddToPlaylist={handleAddToPlaylist}
              />
              //
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LikedVideos;
