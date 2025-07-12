import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TweetComments from "./TweetComments";
import axios from "axios";

export default function TweetDetail() {
  const { tweetId } = useParams();
  const [tweet, setTweet] = useState(null);

  useEffect(() => {
    const fetchTweet = async () => {
      const res = await axios.get(
        `http://localhost:8000/api/v1/tweets/${tweetId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTweet(res.data.data);
    };

    fetchTweet();
  }, [tweetId]);

  if (!tweet) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">
        Tweet by @{tweet.owner?.username}
      </h2>
      <p className="mb-4">{tweet.content}</p>

      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* Central comment section */}
      <TweetComments
        tweetId={tweet._id}
        token={localStorage.getItem("token")}
      />
    </div>
  );
}
