import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import VideoCard from "./VideoCard";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);

  const query = searchParams.get("query");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axios.get(`/api/v1/videos?query=${query}`);
        setVideos(data.data.docs || []);
      } catch (error) {
        console.error("Error fetching search results", error);
      }
    };
    if (query) fetchResults();
  }, [query]);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">
        Search results for: <span className="font-semibold">{query}</span>
      </h2>
      {videos.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
