import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import tweetReducer from "../features/tweets/tweetSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    tweet: tweetReducer,
  },
});
