import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Trash2 } from "lucide-react";

export default function WatchLaterPage() {
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWatchLater = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/users/watchLater",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWatchLaterVideos(res.data.data || []);
      } catch (error) {
        console.error("Error fetching watch later:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchLater();
  }, []);

  const removeFromWatchLater = async (videoId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/users/watchLater/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWatchLaterVideos((prev) =>
        prev.filter((video) => video._id !== videoId)
      );
    } catch (error) {
      console.error("Error removing from watch later:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Watch Later</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : watchLaterVideos.length === 0 ? (
        <p className="text-gray-500">No videos in Watch Later.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {watchLaterVideos.map((video) => (
            <div
              key={video._id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <img
                src={video.thumbnail?.url}
                alt={video.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="font-semibold truncate">{video.title}</h3>
              <p className="text-sm text-gray-600 truncate mb-1">
                {video.description}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <img
                  src={video.owner?.avatar}
                  alt={video.owner?.username}
                  className="w-6 h-6 rounded-full"
                />
                <p className="text-sm text-gray-700">{video.owner?.username}</p>
              </div>

              <video
                src={video.videoFile?.url}
                controls
                className="w-full mt-3 rounded"
              ></video>

              <button
                onClick={() => removeFromWatchLater(video._id)}
                className="mt-3 flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
