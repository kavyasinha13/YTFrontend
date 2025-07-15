import React, { useEffect, useState } from "react";
import axios from "axios";

export default function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/users/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHistory(res.data.data || []);
      } catch (error) {
        console.error("Error fetching watch history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Watch History</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-gray-500">No videos watched yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {history.map((video) => (
            <div
              key={video._id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-600 truncate">
                {video.description}
              </p>
              <video
                src={video.videoFile?.url}
                poster={video.thumbnail?.url}
                controls
                className="w-full mt-2 rounded"
              ></video>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={video.owner?.avatar?.url}
                  alt={video.owner?.username}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-700">
                  {video.owner?.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
