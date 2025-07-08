import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { Bell, Check, MoreHorizontal, Play, Eye, Clock } from "lucide-react";

//configure the status of subscribe button even after reload

export default function Profile() {
  const { username } = useParams();
  const token = localStorage.getItem("token");
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/users/c/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setChannel(res.data.data);
      } catch (error) {
        console.error("Failed to load channel:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserVideos = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/users/allVideos/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setVideos(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };

    const fetchChannelStats = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/users/stats/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    const checkSubscriptionStatus = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/subscriptions/check/${channel._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsSubscribed(res.data.data.subscribed);
      } catch (err) {
        console.error("Failed to check subscription status", err);
      }
    };

    if (username) {
      fetchChannel();
      fetchUserVideos();
      fetchChannelStats();
      checkSubscriptionStatus();
    }
  }, [username]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading channel...</div>;
  }

  if (!channel) {
    return <div className="p-6 text-red-500">Channel not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      <div className="relative w-full h-40 md:h-64 bg-gray-300 overflow-hidden">
        <img
          src={channel.coverImage?.url || "/default-cover.jpg"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Channel Info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end gap-6 -mt-16 relative z-10">
          <div className="w-32 h-32 border-4 border-white rounded-full overflow-hidden bg-gray-200 shadow-lg">
            <img
              src={channel.avatar?.url || "/default-avatar.png"}
              alt={channel.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 pt-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {channel.fullName}
            </h2>
            <p className="text-gray-600">@{channel.username}</p>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
              <span>{channel.subscribersCount} subscribers</span>
              <span>•</span>
              <span>{channel.email}</span>
              {token &&
                channel._id !== JSON.parse(atob(token.split(".")[1]))._id && (
                  <button
                    className={`ml-4 px-4 py-1 rounded text-white ${
                      isSubscribed
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={async () => {
                      try {
                        const res = await axios.post(
                          `http://localhost:8000/api/v1/subscriptions/c/${channel._id}`,
                          {},
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        setIsSubscribed(res.data.data.subscribed);
                      } catch (err) {
                        console.error("Failed to toggle subscription", err);
                      }
                    }}
                  >
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>
                )}

              {stats && (
                <>
                  <span>•</span>
                  <span>{stats.totalVideos} videos</span>
                  <span>•</span>
                  <span>{stats.totalViews} views</span>
                  <span>•</span>
                  <span>{stats.totalLikes} likes</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Uploaded Videos</h3>
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video._id} className="bg-white rounded shadow p-3">
                  <div className="relative aspect-video overflow-hidden rounded mb-2">
                    <img
                      src={video.thumbnail?.url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-gray-800 truncate">
                    {video.title}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {video.description}
                  </p>
                  <video
                    src={video.videoFile?.url}
                    controls
                    className="mt-2 w-full rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
