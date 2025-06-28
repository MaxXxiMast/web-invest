// redux/slices/aiAssistSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AiMessage {
  text: string;
  type: 'user' | 'ai' | 'typing';
}

interface AiAssistState {
  isPopupOpen: boolean;
  messages: AiMessage[];
  assetId: string | null;
}

const initialState: AiAssistState = {
  isPopupOpen: false,
  messages: [],
  assetId: null,
};

const aiAssistSlice = createSlice({
  name: 'aiAssist',
  initialState,
  reducers: {
    setAiPopupState(state, action: PayloadAction<boolean>) {
      state.isPopupOpen = action.payload;
    },
    setAiPopupMessages(state, action: PayloadAction<AiMessage[]>) {
      state.messages = action.payload;
    },
    setAiPopupAssetId(state, action: PayloadAction<string | null>) {
      state.assetId = action.payload;
    },
  },
});

export const {
  setAiPopupState,
  setAiPopupMessages,
  setAiPopupAssetId,
} = aiAssistSlice.actions;

export const selectAiPopupMessages = (state: any) => state.aiAssist.messages;
export const selectAiPopupAssetId = (state: any) => state.aiAssist.assetId;

export default aiAssistSlice.reducer;
