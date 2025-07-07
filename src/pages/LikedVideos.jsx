import React, { useEffect, useState } from "react";
import axios from "axios";

function LikedVideos() {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
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
      } catch (err) {
        console.error("Error fetching liked videos:", err);
        setLikedVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Liked Videos</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : likedVideos.length === 0 ? (
        <p className="text-gray-500">You haven't liked any videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {likedVideos.map((video) => (
            <div
              key={video._id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <img
                src={video.thumbnail?.url}
                alt={video.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-600 truncate">
                {video.description}
              </p>
              <video
                src={video.videoFile?.url}
                controls
                className="w-full mt-2 rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LikedVideos;
