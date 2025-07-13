import axios from "axios";
export const getChannelVideos = async (username, token) => {
  const res = await axios.get(`/api/v1/dashboard/videos/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
};
