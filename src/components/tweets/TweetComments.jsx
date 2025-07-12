import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ThumbsUp,
  Send,
} from "lucide-react";
import {
  getTweetCommentsPaginated,
  getCommentRepliesPaginated,
  addTweetReply,
  likeComment,
} from "../../services/tweetCommentServices";

const TweetComments = ({ tweetId, token }) => {
  const [comments, setComments] = useState([]);
  const [expandedComments, setExpandedComments] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [replyMap, setReplyMap] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [replyText, setReplyText] = useState({});
  const [likedComments, setLikedComments] = useState({});

  const COMMENTS_PER_PAGE = 2;
  const REPLIES_PER_PAGE = 2;

  // Fetch top-level comments
  const fetchComments = async () => {
    try {
      const data = await getTweetCommentsPaginated(
        tweetId,
        commentPage,
        COMMENTS_PER_PAGE,
        token
      );
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  // Fetch replies for a comment
  const fetchReplies = async (commentId) => {
    try {
      const data = await getCommentRepliesPaginated(
        commentId,
        1,
        REPLIES_PER_PAGE,
        token
      );
      setReplyMap((prev) => ({ ...prev, [commentId]: data }));
    } catch (err) {
      console.error("Failed to fetch replies", err);
    }
  };

  // Handle reply submit
  const handleReply = async (commentId) => {
    if (!replyText[commentId]) return;

    try {
      const newReply = await addTweetReply(
        commentId,
        replyText[commentId],
        token
      );
      setReplyMap((prev) => ({
        ...prev,
        [commentId]: [newReply, ...(prev[commentId] || [])],
      }));
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setShowReplyInput((prev) => ({ ...prev, [commentId]: false }));
    } catch (err) {
      console.error("Failed to submit reply", err);
    }
  };

  // Handle comment like
  const handleLike = async (commentId) => {
    try {
      await likeComment(commentId, token);
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [tweetId, commentPage]);

  return (
    <div className="mt-6 space-y-4">
      {comments.map((comment) => (
        <div
          key={comment._id}
          className="border p-3 rounded-lg shadow-sm bg-gray-50"
        >
          {/* Main Comment */}
          <div className="mb-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">@{comment.owner.username}</span>
              <button
                onClick={() => handleLike(comment._id)}
                className={`flex items-center text-sm ${
                  likedComments[comment._id] ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <ThumbsUp size={16} className="mr-1" />
                {comment.likes?.length || 0}
              </button>
            </div>
            <p className="text-sm text-gray-800">{comment.content}</p>
          </div>

          {/* Reply button */}
          <div className="flex items-center text-xs text-blue-600 gap-3">
            <button
              onClick={() => {
                fetchReplies(comment._id);
                setShowReplyInput((prev) => ({
                  ...prev,
                  [comment._id]: !prev[comment._id],
                }));
              }}
              className="flex items-center"
            >
              <MessageCircle size={14} className="mr-1" />
              Reply
            </button>

            {/* Toggle replies */}
            {replyMap[comment._id] && replyMap[comment._id].length > 0 && (
              <button
                onClick={() =>
                  setReplyMap((prev) => ({
                    ...prev,
                    [comment._id]: prev[comment._id].expanded
                      ? prev[comment._id].slice(0, 2)
                      : prev[comment._id],
                  }))
                }
              >
                {replyMap[comment._id].length > 2 && (
                  <span className="flex items-center">
                    {replyMap[comment._id].expanded ? (
                      <>
                        Hide Replies <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        View More Replies ({replyMap[comment._id].length - 2}){" "}
                        <ChevronDown size={14} />
                      </>
                    )}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput[comment._id] && (
            <div className="flex items-center mt-2 gap-2">
              <input
                value={replyText[comment._id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({
                    ...prev,
                    [comment._id]: e.target.value,
                  }))
                }
                placeholder="Write a reply..."
                className="w-full px-3 py-1 border rounded text-sm"
              />
              <button
                onClick={() => handleReply(comment._id)}
                className="text-blue-600"
              >
                <Send size={18} />
              </button>
            </div>
          )}

          {/* Replies */}
          {replyMap[comment._id]?.length > 0 && (
            <div className="mt-3 ml-4 border-l pl-3 space-y-2">
              {replyMap[comment._id]
                .slice(0, replyMap[comment._id].expanded ? undefined : 2)
                .map((reply) => (
                  <div
                    key={reply._id}
                    className="text-sm text-gray-700 border-b pb-1"
                  >
                    <span className="font-semibold mr-1">
                      @{reply.owner.username}
                    </span>
                    {reply.content}
                  </div>
                ))}
              {replyMap[comment._id].length > 2 && (
                <button
                  onClick={() =>
                    setReplyMap((prev) => ({
                      ...prev,
                      [comment._id]: {
                        ...prev[comment._id],
                        expanded: !prev[comment._id].expanded,
                      },
                    }))
                  }
                  className="text-blue-600 text-xs mt-1 flex items-center gap-1"
                >
                  {replyMap[comment._id].expanded ? (
                    <>
                      Hide Replies <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      View More Replies ({replyMap[comment._id].length - 2}){" "}
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Show more comments */}
      {comments.length === COMMENTS_PER_PAGE && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCommentPage((prev) => prev + 1)}
            className="text-blue-600 text-sm flex items-center gap-1"
          >
            View more comments <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TweetComments;
