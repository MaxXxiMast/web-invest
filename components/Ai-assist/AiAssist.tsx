import React, { useRef, useState, useEffect } from 'react';
import { useAppSelector } from '../../redux/slices/hooks';
import Dealassist from './DealAssist/Dealassist';
import AiAssistPopup from './AiAssist/AiAssistPopup';
import { mostAskedQuestions } from './utils';
import { fetchAIResponse } from './api';
import FeedbackPopup from './FeedbackPopup/FeedbackPopup';
import { assetStatus } from '../../utils/asset';
import { fetchAPI } from '../../api/strapi';

const AiAssist: React.FC = () => {
  const [showAiPopup, setShowAiPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAiAssistVisible, setIsAiAssistVisible] = useState(false);
  const wasMinimizedRef = useRef(false);

  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const userID = useAppSelector((state) => state.user.userData?.userID);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchAiAssistUsers = async () => {
      try {
        const response = await fetchAPI(
          '/inner-pages-data',
          {
            filters: { url: '/experiment-users' },
            populate: '*',
          },
          {},
          false
        );
        const aiAssistUserIds =
          response?.data?.[0]?.attributes?.pageData[0]?.objectData
            ?.aiAssistUserIds || [];
        const currentUserID = userID;
        setIsAiAssistVisible(aiAssistUserIds.includes(currentUserID));
      } catch (error) {
        console.error('Error fetching AI Assist user IDs:', error);
      }
    };
    fetchAiAssistUsers();
  }, [userID]);

  const handleSendMessage = async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    setIsProcessing(true);
    setAiResponse('');
    try {
      const assetID = Number(asset?.assetID);
      const data = await fetchAIResponse(query, assetID, signal);

      if (!data) {
        console.warn('API returned no data.');
        setAiResponse('No response from AI');
        return;
      }

      setAiResponse(data.response || 'No response from AI');
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Request was aborted');
        setAiResponse('Request was aborted');
      } else {
        console.error('Error fetching AI response:', error);
        setAiResponse('Failed to retrieve AI response.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setAiResponse('');
  };

  const handleMinimize = () => {
    wasMinimizedRef.current = true;
    setShowAiPopup(false);
  };

  return (
    <>
      {assetStatus(asset) === 'active' && isAiAssistVisible && (
        <Dealassist
          setShowAiPopup={setShowAiPopup}
          onMinimize={handleMinimize}
          asset={asset}
        />
      )}

      {showAiPopup && asset && (
        <AiAssistPopup
          questions={mostAskedQuestions}
          isOpen={showAiPopup}
          onBlur={() => setShowAiPopup(false)}
          onClose={() => {
            setShowAiPopup(false);
            setAiResponse('');
            setShowFeedback(true);
          }}
          onMinimize={handleMinimize}
          wasMinimized={wasMinimizedRef.current}
          onSendMessage={handleSendMessage}
          onStopChat={handleStopChat}
          aiResponse={aiResponse}
          isProcessing={isProcessing}
        />
      )}
      {showFeedback && (
        <FeedbackPopup
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};

export default AiAssist;
