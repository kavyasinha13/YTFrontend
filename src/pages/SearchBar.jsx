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
    // HIGHLIGHT START: Main container for centering and spacing
    <div className="flex justify-center my-8 md:my-12 px-4">
      {/* HIGHLIGHT START: Form container for the input and button */}
      <form
        onSubmit={handleSearch}
        className="relative w-full max-w-xl flex items-center bg-white rounded-full shadow-md
                   focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
                   transition-all duration-200 ease-in-out"
      >
        {/* Search Icon inside the input field */}
        <Search className="absolute left-4 text-gray-400 w-6 h-6 pointer-events-none" />{" "}
        {/* Added pointer-events-none */}
        {/* Search Input Field */}
        <input
          type="text"
          placeholder="Search for videos" // More descriptive placeholder
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 pl-12 pr-4 py-3 md:py-3.5 rounded-full border border-transparent focus:outline-none text-lg text-gray-800 placeholder-gray-500 bg-transparent"
        />
        {/* Search Button */}
        <button
          type="submit"
          className="p-3 mr-1 bg-blue-600 text-white rounded-full
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-colors duration-200 transform hover:scale-105 active:scale-95" // HIGHLIGHT: Added more hover/active effects
          aria-label="Search" // Added for accessibility
        >
          <Search className="w-6 h-6" />{" "}
          {/* Icon inside the button, no default color from button class */}
        </button>
      </form>
    </div>
    // HIGHLIGHT END
  );
};

export default SearchBar;
