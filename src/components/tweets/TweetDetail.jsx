import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TweetDetail() {
  const { tweetId } = useParams();
  const [tweet, setTweet] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchTweet = async () => {
      const res = await axios.get(
        `http://localhost:8000/api/v1/tweets/${tweetId}`
      );
      setTweet(res.data.data);
      setComments(res.data.data.comments || []);
    };

    fetchTweet();
  }, [tweetId]);

  if (!tweet) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">
        Tweet by @{tweet.owner?.username}
      </h2>
      <p className="mb-4">{tweet.content}</p>

      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      {comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c._id} className="bg-gray-100 p-2 rounded">
              <strong>@{c.owner?.username}:</strong> {c.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
