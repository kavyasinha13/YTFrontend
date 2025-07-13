import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getTweetCommentsPaginated,
  getCommentRepliesPaginated,
  addTweetReply,
} from "../../services/tweetCommentServices";
import axios from "axios";

const TweetComments = ({ tweetId, token }) => {
  const [comments, setComments] = useState([]);
  const [repliesMap, setRepliesMap] = useState({});
  const [repliesExpanded, setRepliesExpanded] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [commentInput, setCommentInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  // Fetch paginated comments and organize them
  const fetchComments = async () => {
    try {
      const data = await getTweetCommentsPaginated(tweetId, page, 5, token);

      // Separate main comments and replies
      const main = data.filter((c) => !c.parentComment);
      const replies = data.filter((c) => c.parentComment);

      // Group replies
      const newRepliesMap = { ...repliesMap };
      for (let reply of replies) {
        if (!newRepliesMap[reply.parentComment]) {
          newRepliesMap[reply.parentComment] = [];
        }
        const exists = newRepliesMap[reply.parentComment]?.some(
          (r) => r._id === reply._id
        );
        if (!exists) {
          newRepliesMap[reply.parentComment].push(reply);
        }
      }

      // Avoid duplicates
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const filtered = main.filter((c) => !existingIds.has(c._id));
        return [...prev, ...filtered];
      });
      setRepliesMap(newRepliesMap);

      if (data.length < 5) setHasMoreComments(false);
    } catch (err) {
      console.error("Error fetching comments", err);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [page]);

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await axios.post(
        `/api/v1/comments/tweet/${tweetId}`,
        { content: commentInput },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments((prev) => [res.data.data, ...prev]);
      setCommentInput("");
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleReplySubmit = async (commentId) => {
    const replyText = replyInputs[commentId];
    if (!replyText?.trim()) return;

    try {
      const reply = await addTweetReply(commentId, replyText, token);

      setRepliesMap((prev) => {
        const existing = prev[commentId] || [];
        const alreadyExists = existing.some((r) => r._id === reply._id);
        return {
          ...prev,
          [commentId]: alreadyExists ? existing : [...existing, reply],
        };
      });

      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("Failed to add reply", err);
    }
  };

  const toggleReplies = async (commentId) => {
    if (repliesExpanded[commentId]) {
      setRepliesExpanded((prev) => ({ ...prev, [commentId]: false }));
    } else {
      try {
        const replies = await getCommentRepliesPaginated(
          commentId,
          1,
          10,
          token
        );

        // 🔄 Replace replies instead of appending
        setRepliesMap((prev) => ({
          ...prev,
          [commentId]: replies,
        }));

        setRepliesExpanded((prev) => ({ ...prev, [commentId]: true }));
      } catch (err) {
        console.error("Error fetching replies", err);
      }
    }
  };

  return (
    <div className="mt-4 px-2 space-y-6">
      {/* ➕ Add new comment */}
      <div className="bg-white p-4 rounded shadow-md space-y-3 border border-gray-200">
        <textarea
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={3}
          placeholder="Write a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition text-sm"
        >
          Add Comment
        </button>
      </div>

      {/* 🗨️ Render comments */}
      {comments.map((comment) => (
        <div
          key={comment._id}
          className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 mt-4"
        >
          <p className="text-sm font-semibold text-blue-700">
            @{comment.owner?.username}
          </p>
          <p className="text-gray-700 text-sm mt-1 mb-3">{comment.content}</p>

          {/* Reply input */}
          <div className="ml-4 mt-3 space-y-2">
            <textarea
              className="w-full border rounded-md px-3 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={2}
              placeholder="Write a reply..."
              value={replyInputs[comment._id] || ""}
              onChange={(e) =>
                setReplyInputs((prev) => ({
                  ...prev,
                  [comment._id]: e.target.value,
                }))
              }
            />
            <button
              onClick={() => handleReplySubmit(comment._id)}
              className="bg-gray-800 text-white text-xs px-4 py-1 rounded hover:bg-gray-900 transition"
            >
              Add Reply
            </button>
          </div>

          {/* Show/Hide Replies */}
          {repliesMap[comment._id]?.length > 0 && (
            <button
              onClick={() => toggleReplies(comment._id)}
              className="text-blue-500 text-xs mt-2 flex items-center gap-1 hover:underline"
            >
              {repliesExpanded[comment._id] ? (
                <>
                  Hide replies <ChevronUp size={14} />
                </>
              ) : (
                <>
                  View replies ({repliesMap[comment._id].length}){" "}
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          )}

          {/* Show replies if expanded */}
          {repliesExpanded[comment._id] &&
            repliesMap[comment._id]?.map((reply) => (
              <div
                key={reply._id}
                className="ml-6 mt-3 p-3 border-l-2 border-blue-200 bg-white rounded-md shadow-sm"
              >
                <p className="text-sm font-semibold text-blue-600">
                  @{reply.owner?.username}
                </p>
                <p className="text-sm text-gray-600 mt-1">{reply.content}</p>
              </div>
            ))}
        </div>
      ))}

      {/* 🔽 Load more comments */}
      {hasMoreComments && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
          >
            View more comments <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TweetComments;
