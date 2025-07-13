// src/services/playlistServices.js
import axios from "axios";

export const createPlaylist = async (payload, token) => {
  const res = await axios.post("/api/v1/playlists", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export const getUserPlaylists = async (userId, token) => {
  const res = await axios.get(`/api/v1/playlists/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export const getPlaylistById = async (playlistId, token) => {
  const res = await axios.get(`/api/v1/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};

export const addVideoToPlaylist = async (playlistId, videoId, token) => {
  const res = await axios.patch(
    `/api/v1/playlists/add/${videoId}/${playlistId}`,
    { videoId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};

export const removeVideoFromPlaylist = async (playlistId, videoId, token) => {
  const res = await axios.patch(
    `/api/v1/playlists/remove/${videoId}/${playlistId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};

// 6. Update Playlist (name or description)
export const updatePlaylist = async (playlistId, updatedData, token) => {
  const res = await axios.patch(
    `/api/v1/playlists/${playlistId}`,
    updatedData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.data;
};

// 7. Delete Playlist
export const deletePlaylist = async (playlistId, token) => {
  const res = await axios.delete(`/api/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};
