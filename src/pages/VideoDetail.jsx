import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function VideoList() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/videos");
        setVideos(res.data?.videos || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <Link
          to={`/video/${video._id}`}
          key={video._id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-3">
            <h3 className="font-semibold text-lg truncate">{video.title}</h3>
            <p className="text-sm text-gray-600">{video.owner.fullName}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
