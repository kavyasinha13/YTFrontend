import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../services/playlistServices";
import AddVideoToPlaylistModal from "../components/playlists/AddVideoToPlaylistModal";
import axios from "axios";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [playlist, setPlaylist] = useState(null);
  const [newVideoId, setNewVideoId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDesc, setUpdatedDesc] = useState("");
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);

  // Fetch playlist
  const fetchPlaylist = async () => {
    try {
      const data = await getPlaylistById(playlistId, token);
      setPlaylist(data);
      setUpdatedName(data.name);
      setUpdatedDesc(data.description);
    } catch (err) {
      console.error("Error loading playlist", err);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const handleAddVideo = async () => {
    try {
      await addVideoToPlaylist(playlistId, newVideoId, token);
      setNewVideoId("");
      fetchPlaylist();
    } catch (err) {
      console.error("Failed to add video", err);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(playlistId, videoId, token);
      fetchPlaylist();
    } catch (err) {
      console.error("Failed to remove video", err);
    }
  };

  const handleUpdatePlaylist = async () => {
    try {
      await updatePlaylist(
        playlistId,
        {
          name: updatedName,
          description: updatedDesc,
        },
        token
      );
      setEditMode(false);
      fetchPlaylist();
    } catch (err) {
      console.error("Failed to update playlist", err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    try {
      await deletePlaylist(playlistId, token);
      navigate("/playlists");
    } catch (err) {
      console.error("Failed to delete playlist", err);
    }
  };

  if (!playlist) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{playlist.name}</h1>
          <p className="text-gray-600">{playlist.description}</p>
          <p className="text-sm text-gray-400">
            Total videos: {playlist.totalVideos}
          </p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setEditMode(true)}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={handleDeletePlaylist}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="bg-gray-100 p-4 rounded shadow mb-4">
          <input
            type="text"
            placeholder="New name"
            className="w-full mb-2 p-2 border rounded"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
          <textarea
            placeholder="New description"
            className="w-full mb-2 p-2 border rounded"
            value={updatedDesc}
            onChange={(e) => setUpdatedDesc(e.target.value)}
          />
          <button
            onClick={handleUpdatePlaylist}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Save
          </button>
        </div>
      )}

      {/* Add Video */}
      {showAddVideoModal && (
        <AddVideoToPlaylistModal
          playlistId={playlistId}
          onClose={() => setShowAddVideoModal(false)}
        />
      )}

      <button
        onClick={() => setShowAddVideoModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Add Video
      </button>

      {/* List of videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {playlist.videos?.map((video) => (
          <div
            key={video._id}
            className="border p-3 rounded shadow flex flex-col gap-2"
          >
            <img
              src={video.thumbnail?.url}
              alt={video.title}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="text-md font-semibold">{video.title}</h3>
            <p className="text-sm text-gray-500">{video.views} views</p>
            <button
              onClick={() => handleRemoveVideo(video._id)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
