import React, { useEffect, useState } from "react";
import TweetCard from "./TweetCard";
import { Plus } from "lucide-react";
import AddTweetModal from "./AddTweetModal";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addTweet } from "../../features/tweets/tweetSlice.js";

const token = localStorage.getItem("token");

export default function TweetFeed() {
  const dispatch = useDispatch();
  const tweet = useSelector((state) => state.tweet.allTweets);
  const [showModal, setShowModal] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/tweets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTweets(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch tweets", err);
      }
    };

    fetchTweets();
  }, [refresh]);

  const handleAddTweet = async (content) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/tweets",
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optional: Add to Redux if you're maintaining state there
      dispatch(addTweet(res.data.data));

      // Trigger re-fetch to show the new tweet
      setRefresh((prev) => !prev);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add tweet", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Add Tweet Button */}
      <div className="flex justify-end mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-5 h-5" />
          Add Tweet
        </button>
      </div>

      {/* Tweets List */}
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <TweetCard key={tweet._id} tweet={tweet} setRefresh={setRefresh} />
        ))}
      </div>

      {/* Add Tweet Modal */}
      <AddTweetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddTweet}
      />
    </div>
  );
}
