import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";

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
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState(null);

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setLoggedInUserId(decoded._id);
    }
  }, [token]);

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

    if (username) {
      fetchChannel();
      fetchUserVideos();
      fetchChannelStats();
      if (channel && loggedInUserId && channel._id !== loggedInUserId) {
        checkSubscriptionStatus();
      }
    }
  }, [username, loggedInUserId]);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!channel || !loggedInUserId) return;
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

    if (channel && loggedInUserId && channel._id !== loggedInUserId) {
      checkSubscriptionStatus();
    }
  });

  if (loading) {
    return <div className="p-6 text-gray-600">Loading channel...</div>;
  }

  if (!channel) {
    return <div className="p-6 text-red-500">Channel not found.</div>;
  }

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/v1/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      alert("Video deleted successfully.");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
  };

  const handleEditSubmit = async (e, videoId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    if (editThumbnail) {
      formData.append("thumbnail", editThumbnail);
    }

    try {
      await axios.patch(
        `http://localhost:8000/api/v1/videos/${videoId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, title: editTitle, description: editDescription }
            : v
        )
      );

      setEditingVideo(null);
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

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
                <div
                  key={video._id}
                  className="relative bg-white rounded shadow p-3"
                >
                  <div className="relative aspect-video overflow-hidden rounded mb-2 group">
                    {/*thumbnail */}
                    <img
                      src={video.thumbnail?.url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    {/*edit and delete button */}
                    {loggedInUserId === channel._id && (
                      <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(video)}
                          className="p-1 bg-white rounded-full shadow hover:bg-blue-100"
                          title="Edit Video"
                        >
                          <Pencil className="h-5 w-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="p-1 bg-white rounded-full shadow hover:bg-red-100"
                          title="Delete Video"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    )}
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
          {/* Edit Modal */}
          {editingVideo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Edit Video</h2>
                <form onSubmit={(e) => handleEditSubmit(e, editingVideo._id)}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full mb-2 border px-3 py-2 rounded"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full mb-2 border px-3 py-2 rounded"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditThumbnail(e.target.files[0])}
                    className="mb-4"
                  />
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setEditingVideo(null)}
                      className="px-4 py-2 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
