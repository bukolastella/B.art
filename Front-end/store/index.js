import { configureStore } from "@reduxjs/toolkit";
import whielistReducer from "./slice";

const store = configureStore({
  reducer: {
    whitelistState: whielistReducer,
  },
});

export default store;
