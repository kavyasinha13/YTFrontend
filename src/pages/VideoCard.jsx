import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";

export default function VideoCard({ video }) {
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
      console.error("Error adding to watch history", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition duration-200 overflow-hidden border">
      <Link to={`/video/${video._id}`}>
        <video
          src={video.videoFile?.url}
          poster={video.thumbnail?.url}
          controls
          className="w-full mt-2 rounded"
          onPlay={() => handleWatchHistory(video._id)}
        />
      </Link>

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {video.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2">
          {video.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>by {video.ownerDetails?.username || "Unknown"}</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-4 pt-2 text-gray-500">
          <div className="flex items-center gap-1">
            <Heart size={16} />
            <span>{video.likesCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{video.commentsCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
