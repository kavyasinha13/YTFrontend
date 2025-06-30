import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ Extract token
        if (!token) {
          console.error("No token found");
          return;
        }

        const res = await axios.get("http://localhost:8000/api/v1/videos", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token dynamically
          },
        });

        const docs = res?.data?.data?.docs || [];
        setVideos(docs);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">All Videos</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-500">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-white rounded shadow hover:shadow-lg transition p-4"
            >
              <img
                src={video.thumbnail.url}
                alt={video.title}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-600 truncate">{video.description}</p>
              <video
                src={video.videoFile.url}
                controls
                className="w-full mt-2 rounded"
              ></video>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
