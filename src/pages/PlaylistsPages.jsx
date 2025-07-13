// src/pages/PlaylistsPage.jsx
import React, { useEffect, useState } from "react";
import CreatePlaylistModal from "../components/playlists/CreatePlaylistModal.jsx";
import { getUserPlaylists } from "../services/playlistServices.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const user = useSelector((state) => state.user.user);
  const userId = user._id;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchPlaylists = async () => {
    const res = await getUserPlaylists(userId, token);
    setPlaylists(res);
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Playlists</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Playlist
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            onClick={() => navigate(`/playlists/${playlist._id}`)}
            className="p-4 bg-white shadow rounded hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="text-lg font-semibold">{playlist.name}</h3>
            <p className="text-sm text-gray-600">{playlist.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              {playlist.totalVideos || 0} videos
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <CreatePlaylistModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchPlaylists}
        />
      )}
    </div>
  );
};

export default PlaylistsPage;
