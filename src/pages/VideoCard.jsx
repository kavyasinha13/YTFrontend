// components/VideoCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Eye, PlusCircle, Bookmark } from "lucide-react";

export default function VideoCard({
  video,
  isLiked,
  onToggleLike,
  onAddToWatchLater,
  onViewComments,
  onVideoPlay,
  userPlaylists,
  onAddToPlaylist,
}) {
  const [showPlaylists, setShowPlaylists] = useState(false);

  const formatDuration = (seconds) => {
    if (typeof seconds !== "number" || isNaN(seconds)) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out p-4 flex flex-col w-full max-w-xs cursor-pointer">
      {/* Video Thumbnail/Player */}
      <Link
        to={`/watch/${video._id}`}
        onClick={() => onVideoPlay(video._id)}
        className="block relative mb-3 overflow-hidden rounded-lg group"
      >
        {video.thumbnail?.url && (
          <img
            src={video.thumbnail.url}
            alt={video.title}
            className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-0.5 rounded-md font-medium">
            {formatDuration(video.duration)}
          </span>
        )}
      </Link>

      {/* Video Details */}
      <div className="flex items-start mb-3">
        {video.ownerDetails?.avatar?.url && (
          <Link
            to={`/c/${video.ownerDetails.username}`}
            className="flex-shrink-0 mr-3 mt-1"
          >
            <img
              src={video.ownerDetails.avatar.url}
              alt={video.ownerDetails.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          </Link>
        )}
        <div className="flex-grow">
          <Link
            to={`/watch/${video._id}`}
            onClick={() => onVideoPlay(video._id)}
          >
            <h3 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
              {video.title}
            </h3>
          </Link>
          {video.ownerDetails?.username && (
            <Link to={`/c/${video.ownerDetails.username}`}>
              <p className="text-sm text-gray-600 hover:text-blue-500 transition-colors">
                {video.ownerDetails.username}
              </p>
            </Link>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {video.views} views • {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-3 mt-auto gap-2 flex-wrap">
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleLike(video._id);
          }}
          className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
          title="Like/Unlike"
        >
          <Heart
            className={`w-5 h-5 ${
              isLiked
                ? "text-red-500"
                : "text-gray-500 group-hover:text-red-500"
            }`}
            fill={isLiked ? "red" : "none"}
            strokeWidth={1.5}
          />
          <span className="text-gray-700 font-medium">
            {video.likesCount || 0}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewComments(video._id);
          }}
          className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
          title="View/Add Comments"
        >
          <MessageCircle
            className="w-5 h-5 text-gray-500 group-hover:text-blue-600"
            strokeWidth={1.5}
          />
          <span className="text-gray-700 font-medium">
            {video.commentsCount || 0}
          </span>
        </button>

        {/* Add to Watch Later */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToWatchLater(video._id);
          }}
          className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
          title="Add to Watch Later"
        >
          <Bookmark
            className="w-5 h-5 text-gray-500 group-hover:text-purple-600"
            strokeWidth={1.5}
          />
          <span className="text-gray-700 font-medium">Watch Later</span>
        </button>

        {/* Add to Playlist Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPlaylists(!showPlaylists);
            }}
            className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
            title="Add to Playlist"
          >
            <PlusCircle
              className="w-5 h-5 text-gray-500 group-hover:text-green-600"
              strokeWidth={1.5}
            />
            <span className="text-gray-700 font-medium">Playlist</span>
          </button>
          {showPlaylists && (
            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-2 min-w-[150px] max-h-48 overflow-y-auto transform origin-bottom-right animate-fade-in-up">
              <p className="font-semibold text-gray-800 text-sm mb-1 pb-1 border-b border-gray-200">
                Add to:
              </p>
              {userPlaylists.length > 0 ? (
                userPlaylists.map((pl) => (
                  <button
                    key={pl._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToPlaylist(video._id, pl._id);
                      setShowPlaylists(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors rounded-md"
                  >
                    {pl.name}
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-500 py-2">
                  No playlists found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    // HIGHLIGHT END
  );
}
