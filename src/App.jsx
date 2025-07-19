// src/App.jsx
import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import Layout from "./components/Layout.jsx";
import VideoCard from "./pages/VideoCard";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage.jsx";
import WatchHistory from "./pages/WatchHistory";
import LikedVideos from "./pages/LikedVideos";
import Profile from "./pages/Profile";
import TweetFeed from "./components/tweets/TweetFeed";
import TweetDetail from "./components/tweets/TweetDetail";
import PlaylistsPage from "./pages/PlaylistsPages.jsx";
import PlaylistDetail from "./pages/PlaylistDetail.jsx";
import WatchLaterPage from "./pages/WatchLaterPage.jsx";
import CommentsPage from "./pages/CommentsPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import WatchPage from "./pages/WatchPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/search" element={<SearchPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            }
          />
          <Route path="/video/:videoId" element={<VideoCard />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/history" element={<WatchHistory />} />
          <Route
            path="/videos"
            element={
              <PrivateRoute>
                <LikedVideos />
              </PrivateRoute>
            }
          />
          <Route
            path="/c/:username"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/tweets" element={<TweetFeed />} />
          <Route path="/tweets/:tweetId" element={<TweetDetail />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
          <Route path="users/watchLater" element={<WatchLaterPage />} />
          <Route path="/comments/:videoId" element={<CommentsPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
      </Routes>
    </div>
  );
}
