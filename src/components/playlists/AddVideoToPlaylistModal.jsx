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
        console.log("Fetched user videos:", res); // Debugging
        setVideos(res);
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
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-4">Add Video to Playlist</h2>
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-red-500 text-xl font-bold"
          >
            X
          </button>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {videos.map((video) => (
            <div
              key={video._id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-4">
                <p className="font-semibold">{video.title}</p>
                <video
                  src={video.videoFile?.url}
                  controls
                  className="w-full mt-2 rounded"
                />
              </div>
              <button
                onClick={() => handleAdd(video._id)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
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
