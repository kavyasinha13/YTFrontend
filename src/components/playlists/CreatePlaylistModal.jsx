// src/components/CreatePlaylistModal.jsx
import React, { useState } from "react";
import { createPlaylist } from "../../services/playlistServices";

const CreatePlaylistModal = ({ onClose, onSuccess }) => {
  const [name, setname] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await createPlaylist({ name, description }, token);
    onSuccess(); // refresh playlists
    onClose(); // close modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
        <h3 className="text-lg font-bold mb-4">Create New Playlist</h3>
        <input
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Playlist name"
          value={name}
          onChange={(e) => setname(e.target.value)}
        />
        <textarea
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
