import axios from "axios";

const API_BASE = "/api/v1/comments";

// 1. Get paginated comments on a tweet
export const getTweetCommentsPaginated = async (
  tweetId,
  page = 1,
  limit = 2,
  token
) => {
  const res = await axios.get(
    `${API_BASE}/tweet/${tweetId}?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};

// 2. Get paginated replies for a comment
export const getCommentRepliesPaginated = async (
  commentId,
  page = 1,
  limit = 2,
  token
) => {
  const res = await axios.get(
    `${API_BASE}/replies/${commentId}?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};

// 3. Add a reply to a comment
export const addTweetReply = async (commentId, content, token) => {
  const res = await axios.post(
    `${API_BASE}/reply/${commentId}`,
    { content },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};

// 4. Like/unlike a comment
export const likeComment = async (commentId, token) => {
  const res = await axios.post(
    `/api/v1/likes/toggle/c/${commentId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};

export const addCommentToTweet = async (
  tweetId,
  content,
  token,
  parentComment = null
) => {
  const res = await axios.post(
    `/api/v1/comments/tweet/${tweetId}`,
    { content, parentComment },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.data;
};
