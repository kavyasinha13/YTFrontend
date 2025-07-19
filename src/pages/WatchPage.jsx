// pages/WatchPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Heart, MessageCircle, PlusCircle } from "lucide-react"; // Only import needed icons
import { Link, useNavigate } from "react-router-dom";

export default function WatchPage() {
  const { videoId } = useParams(); // Get the videoId from the URL
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false); // State for current user's like status
  const [likesCount, setLikesCount] = useState(0); // State for total likes
  const [commentsCount, setCommentsCount] = useState(0); // State for total comments

  const user = useSelector((state) => state.user.user);
  const userId = user?._id;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showPlaylists, setShowPlaylists] = useState(false);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        if (!token) {
          setError("Authentication token missing.");
          navigate("/login");
          return;
        }

        // 1. Fetch video details
        // API: GET /api/v1/videos/:videoId
        const videoRes = await axios.get(
          `http://localhost:8000/api/v1/videos/${videoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Assuming video details come back directly in data.data
        const fetchedVideo = videoRes.data.data;
        setVideo(fetchedVideo);
        setLikesCount(fetchedVideo.likesCount || 0);
        // Assuming your video details API also returns commentsCount (you might need to fetch comments separately later)
        setCommentsCount(fetchedVideo.commentsCount || 0); // This might be a placeholder.

        // 2. Fetch user's liked status for this specific video
        // API: GET /api/v1/likes/videos - Your Home.jsx fetches all, but here we need for one.
        // A more direct API for single video like status would be ideal,
        // but if not available, we can filter from the all-liked-videos list.
        // For now, let's assume an endpoint like: /api/v1/likes/toggle/v/:videoId (checking status)
        // or a dedicated 'isLiked' status endpoint if your backend provides one.
        // Based on your Home.jsx, your like-toggle endpoint returns 'isLiked'.
        // So we can hit that to get initial state, or rely on a specific status endpoint.
        // Let's assume you have an endpoint to check if a specific video is liked by current user.
        // If not, you might need to fetch all liked videos and check.
        // A common pattern is `GET /api/v1/likes/isLiked/v/:videoId`
        // If such an endpoint doesn't exist, we'll have to adjust.
        // For demonstration, let's use the toggle endpoint to get status, though it's not ideal for just getting status.
        // BEST: Your backend should provide a dedicated endpoint for checking if a video is liked by the current user.
        // Example (hypothetical, but common):
        try {
          const likeStatusRes = await axios.get(
            `http://localhost:8000/api/v1/likes/isLiked/v/${videoId}`,
            {
              // <-- HYPOTHETICAL API ENDPOINT
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setIsLiked(likeStatusRes.data.data.isLiked);
        } catch (statusError) {
          console.warn(
            "Could not fetch specific like status, assuming not liked or handling error:",
            statusError.message
          );
          setIsLiked(false); // Default to not liked if endpoint fails or doesn't exist
        }

        // 3. Add to watch history
        // API: POST /api/v1/users/history/:videoId
        await axios.post(
          `http://localhost:8000/api/v1/users/history/${videoId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 4. Fetch user's playlists
        // API: GET /api/v1/playlists/user/:userId
        if (userId) {
          // Only fetch playlists if userId is available (user logged in)
          const playlistRes = await axios.get(
            `http://localhost:8000/api/v1/playlists/user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserPlaylists(playlistRes.data.data || []);
        }
      } catch (err) {
        console.error(
          "Error fetching video details or initial data for WatchPage:",
          err
        );
        setError("Failed to load video details. Please try again.");
        if (err.response && err.response.status === 401) {
          navigate("/login"); // Redirect to login if unauthorized
        }
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      // Ensure videoId exists before making API calls
      fetchVideoDetails();
    }
  }, [videoId, token, userId, navigate]); // Add dependencies to useEffect

  // Handler for toggling like
  // API: POST /api/v1/likes/toggle/v/:videoId
  const toggleLike = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/likes/toggle/v/${videoId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const isLikedNow = res.data.data.isLiked;
      setIsLiked(isLikedNow);
      setLikesCount((prevCount) =>
        isLikedNow ? prevCount + 1 : prevCount - 1
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to toggle like 😢");
    }
  };

  // Handler for adding/removing from Watch Later
  // API: POST /api/v1/users/watchLater/:videoId
  const handleAddToWatchLater = async () => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/users/watchLater/${videoId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Watch Later status updated ✅");
      // You might want to update a local state to reflect if the video is now in watch later or not
      // For now, a simple alert is fine.
    } catch (error) {
      console.error("Failed to add/remove from Watch Later:", error);
      alert("Failed to update Watch Later status 😢");
    }
  };

  // Handler for adding video to a playlist
  // API: PATCH /api/v1/playlists/add/:videoId/:playlistId
  const handleAddToPlaylist = async (playlistId) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/playlists/add/${videoId}/${playlistId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Video added to playlist ✅");
      setShowPlaylists(false); // Close dropdown after selection
    } catch (error) {
      console.error("Failed to add video to playlist:", error);
      alert("Failed to add to playlist 😢");
    }
  };

  // Helper function to navigate to comments page
  const handleViewComments = () => {
    navigate(`/comments/${videoId}`);
  };

  if (loading)
    return (
      <div className="text-center text-xl mt-10 p-6">Loading video...</div>
    );
  if (error)
    return (
      <div className="text-center text-xl text-red-600 mt-10 p-6">
        Error: {error}
      </div>
    );
  if (!video)
    return (
      <div className="text-center text-xl mt-10 p-6">
        Video not found or access denied.
      </div>
    );

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex flex-col md:flex-row">
        {/* Main Video Player Area */}
        <div className="md:w-3/4 p-4 flex flex-col">
          <video
            src={video.videoFile?.url}
            poster={video.thumbnail?.url}
            controls
            className="w-full h-auto rounded-lg mb-4 max-h-[70vh] object-contain bg-black" // Added max-h and object-contain
            autoPlay // Optional: Auto-play the video
          />
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {video.title}
          </h1>
          <p className="text-gray-700 mb-4">{video.description}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-b py-3 mb-4 gap-4">
            {/* Owner Details */}
            <Link
              to={`/c/${video.ownerDetails?.username}`}
              className="flex items-center gap-3"
            >
              {video.ownerDetails?.avatar?.url && (
                <img
                  src={video.ownerDetails.avatar.url}
                  alt={video.ownerDetails.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-lg text-blue-600 hover:underline">
                  {video.ownerDetails?.username}
                </p>
                <p className="text-sm text-gray-600">
                  {video.views} views •{" "}
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4 flex-wrap">
              {" "}
              {/* Added flex-wrap for responsiveness */}
              <button
                onClick={toggleLike}
                className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                title="Like/Unlike"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isLiked ? "text-red-500" : "text-gray-400"
                  }`}
                  fill={isLiked ? "red" : "none"}
                />
                <span className="text-gray-700">{likesCount}</span>
              </button>
              <button
                onClick={handleViewComments} // Use the helper function
                className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                title="View/Add Comments"
              >
                <MessageCircle className="w-6 h-6 text-gray-700" />
                <span className="text-gray-700">{commentsCount}</span>
              </button>
              <button
                onClick={handleAddToWatchLater}
                className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                title="Add to Watch Later"
              >
                <PlusCircle className="w-6 h-6 text-gray-700" />
                <span className="text-gray-700">Watch Later</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowPlaylists(!showPlaylists)}
                  className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                  title="Add to Playlist"
                >
                  <PlusCircle className="w-6 h-6 text-gray-700" />
                  <span className="text-gray-700">Playlist</span>
                </button>
                {showPlaylists && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 min-w-[150px]">
                    <p className="font-medium mb-1 text-gray-800">Add to:</p>
                    {userPlaylists.length > 0 ? (
                      userPlaylists.map((pl) => (
                        <button
                          key={pl._id}
                          onClick={() => handleAddToPlaylist(pl._id)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          {pl.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No playlists.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section (Placeholder) */}
          <div className="mt-8 flex-grow">
            {" "}
            {/* flex-grow to push sidebar to bottom if content is short */}
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Comments</h3>
            {/* You'll integrate your actual comments component here later */}
            <p className="text-gray-600">
              Comments section will be integrated here.
            </p>
          </div>
        </div>

        {/* Suggested Videos / Sidebar (Placeholder) */}
        <div className="md:w-1/4 p-4 bg-gray-50 border-l border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Up Next</h3>
          {/* You'll likely fetch and map over other VideoCard components here */}
          <p className="text-gray-600">Suggested videos will appear here.</p>
        </div>
      </div>
    </div>
  );
}
