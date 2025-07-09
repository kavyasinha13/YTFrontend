import { createSlice } from "@reduxjs/toolkit";

const tweetSlice = createSlice({
  name: "tweet",
  initialState: {
    allTweets: [],
  },
  reducers: {
    addTweet: (state, action) => {
      state.allTweets.unshift(action.payload);
    },
    setTweets: (state, action) => {
      state.allTweets = action.payload;
    },
    deleteTweet: (state, action) => {
      state.allTweets = state.allTweets.filter(
        (tweet) => tweet.id !== action.payload
      );
    },
    updateTweet: (state, action) => {
      const index = state.allTweets.findIndex(
        (t) => t.id === action.payload.id
      );
      if (index !== -1) state.allTweets[index] = action.payload;
    },
  },
});

export const { addTweet, setTweets, deleteTweet, updateTweet } =
  tweetSlice.actions;
export default tweetSlice.reducer;
