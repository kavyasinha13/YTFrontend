import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex items-center gap-2 p-4 bg-white shadow-md"
    >
      <input
        type="text"
        placeholder="Search videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-full outline-none"
      />
      <button type="submit">
        <Search className="text-gray-600 hover:text-black" />
      </button>
    </form>
  );
};

export default SearchBar;
