import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false,
  presaleStarted: null,
  presaleEnded: null,
};

export const whielistSlice = createSlice({
  name: "whielist",
  initialState,
  reducers: {
    changeWhitelistState: (state, action) => {
      state.value = action.payload;
    },
    setPresaleStarted: (state, action) => {
      state.presaleStarted = action.payload;
    },
    setPresaleEnded: (state, action) => {
      state.presaleEnded = action.payload;
    },
  },
});

export const { changeWhitelistState, setPresaleStarted, setPresaleEnded } =
  whielistSlice.actions;

export default whielistSlice.reducer;
