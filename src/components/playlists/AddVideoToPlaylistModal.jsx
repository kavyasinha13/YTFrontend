import React, { useEffect, useState } from "react";
import { getChannelVideos } from "../../services/videoServices";
import { addVideoToPlaylist } from "../../services/playlistServices";
import { useSelector } from "react-redux";

const AddVideoToPlaylistModal = ({ playlistId, onClose }) => {
  const [videos, setVideos] = useState([]);
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await getChannelVideos(user.username, token);
        console.log("Fetched user videos:", res); // ✅ Debugging
        setVideos(res); // Remove .filter if you're not sure isPublished is present
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };
    fetchVideos();
  }, []);

  const handleAdd = async (videoId) => {
    await addVideoToPlaylist(playlistId, videoId, token);
    alert("Video added to playlist!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Video to Playlist</h2>
          <button onClick={onClose} className="text-red-500 font-bold">
            X
          </button>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {videos.map((video) => (
            <div
              key={video._id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <p className="font-semibold">{video.title}</p>
                <p className="text-sm text-gray-600">{video.description}</p>
              </div>
              <button
                onClick={() => handleAdd(video._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddVideoToPlaylistModal;
