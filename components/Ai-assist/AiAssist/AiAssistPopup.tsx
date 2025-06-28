import React, { useState, useEffect, useRef } from 'react';
import styles from './AiAssistPopup.module.css';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import ProfileImage from '../../primitives/Navigation/ProfileImage';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { newRelicErrLogs } from '../../../utils/gtm';
import { setupChatPopupScrollLock } from '../utils';
import {
  selectAiPopupMessages,
  selectAiPopupAssetId,
  setAiPopupMessages,
  setAiPopupAssetId,
} from '../../../redux/slices/AiAssist';

interface AiAssistPopupProps {
  questions: { text: string; icon: string }[];
  isOpen: boolean;
  onBlur: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onSendMessage: (query: string, assetID: string) => void;
  onStopChat: () => void;
  aiResponse: string;
  isProcessing: boolean;
  wasMinimized: boolean;
}
const AiAssistPopup: React.FC<AiAssistPopupProps> = ({
  questions,
  isOpen,
  onClose,
  onSendMessage,
  onStopChat,
  onMinimize,
  aiResponse,
  isProcessing,
  wasMinimized,
}) => {
  const [localQuery, setLocalQuery] = useState('');

  const [_firstResponseReceived, setFirstResponseReceived] = useState(false);
  const [chatStopped, setChatStopped] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery();
  const dispatch = useAppDispatch();
  const userID = useAppSelector((state) => state.user.userData?.userID);
  const asset = useAppSelector((state) => state.assets.selectedAsset);

  const persistedMessages = useAppSelector(selectAiPopupMessages);
  const persistedAssetId = useAppSelector(selectAiPopupAssetId);
  const [messages, setMessages] =
    useState<{ text: string; type: 'user' | 'ai' | 'typing' }[]>(
      persistedMessages
    );

  useEffect(() => {
    if (asset?.assetID && asset.assetID !== persistedAssetId) {
      dispatch(setAiPopupMessages([]));
      dispatch(setAiPopupAssetId(asset.assetID));
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset?.assetID]);

  useEffect(() => {
    dispatch(setAiPopupMessages(messages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    const cleanupScrollLock = setupChatPopupScrollLock(isMobile);
    return cleanupScrollLock;
  }, [isMobile]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  useEffect(() => {
    if (isOpen && wasMinimized) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement && activeElement.tagName === 'TEXTAREA';

      if (isInputFocused && isMobile) {
        activeElement.scrollIntoView({ block: 'end' });

        const footer = document.querySelector(`.${styles.footer}`);
        if (footer) {
          setTimeout(() => {
            footer.scrollIntoView({ block: 'end', behavior: 'smooth' });
          }, 100);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    if (
      isProcessing &&
      !chatStopped &&
      !hasSentMessage &&
      localQuery.trim() !== ''
    ) {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== 'typing'),
        { text: localQuery, type: 'user' },
        { text: 'Deal-Assist is analyzing...', type: 'typing' },
      ]);
      setLocalQuery('');
      setHasSentMessage(true);
      setFirstResponseReceived(true);
    }
  }, [isProcessing, chatStopped, hasSentMessage, localQuery]);

  useEffect(() => {
    if (aiResponse && !chatStopped) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.type === 'typing' ? { text: aiResponse, type: 'ai' } : msg
        )
      );
      setHasSentMessage(false);
    }
  }, [aiResponse, chatStopped]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'user' || lastMessage?.type === 'typing') {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  const handleClose = () => {
    newRelicErrLogs('Deal Assist:Chat Stopped', 'info', {
      assetID: asset?.assetID || '',
      userID,
    });
    setMessages([]);
    dispatch(setAiPopupMessages([]));
    dispatch(setAiPopupAssetId(null));
    setFirstResponseReceived(false);
    setChatStopped(false);
    onClose();
    setHasSentMessage(false);
  };

  const mostAskedQuestions =
    questions.length > 0
      ? questions
      : [
          `Can you summarise this deal for me?`,
          `What is the underlying security package?`,
          `Why should i invest in this deal?`,
        ];

  const handleSendMessage = () => {
    if (localQuery.trim() === '') return;
    let processedQuery = localQuery.trim();
    setChatStopped(false);
    onSendMessage(processedQuery, asset?.assetID);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  if (!isOpen) return null;

  const handleQuestionClick = (question: string) => {
    newRelicErrLogs('Deal Assist:Chat Started', 'info', {
      assetID: asset?.assetID || '',
      userID,
    });
    setLocalQuery(question);
    onSendMessage(question, asset?.assetID);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay}></div>
      {isOpen && (
        <div className={styles.popupContainer} id="chat-popup">
          <div className={styles.header}>
            <span className={styles.DealAssistIcon}>
              <div
                className={`flex items-center ${styles.dealAssistButtonDisabled}`}
              >
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}ai-assist/deal-assist-star.svg`}
                  alt="Deal Assist Star"
                  width={17}
                  height={17}
                />{' '}
                Deal Assist
              </div>
            </span>
            <span className="flex items-center">
              <button onClick={onMinimize} className={styles.minimizeButton}>
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}ai-assist/minimize_button.svg`}
                  alt="minimize"
                  width={24}
                  height={24}
                />
              </button>
              <button onClick={handleClose} className={styles.closeButton}>
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}ai-assist/close-button.svg`}
                  alt="close"
                  width={24}
                  height={24}
                />
              </button>
            </span>
          </div>
          <div className={styles.scrollWrapper}>
            <div className={styles.mostAskedSection}>
              <div className={styles.headerContainer}>
                <p className={styles.subHeader}>MOST ASKED QUESTIONS</p>
                <div className={styles.lineContainer}>
                  <Image
                    className={styles.line}
                    src={`${GRIP_INVEST_BUCKET_URL}ai-assist/line.svg`}
                    alt="icon"
                    width={10}
                    height={2}
                  />
                </div>
              </div>
              {mostAskedQuestions.map((question: any, index: any) => (
                <button
                  key={index}
                  className={`flex items-center justify-start ${styles.questionButton}`}
                  onClick={() => handleQuestionClick(question.text)}
                >
                  <Image
                    src={question.icon}
                    alt="icon"
                    width={20}
                    height={20}
                  />
                  <span>{question.text}</span>
                </button>
              ))}
            </div>
            <div className={styles.chatContainer}>
              {messages.map((message, index) => {
                const cleanedText = String(message.text)
                  .replace(/(\n\s*){2,}/g, '\n\n')
                  .trim();
                return (
                  <div
                    key={index}
                    className={
                      message.type === 'user'
                        ? styles.userMessage
                        : message.type === 'typing'
                        ? styles.typingMessage
                        : styles.responseBox
                    }
                  >
                    <div
                      key={index}
                      className={
                        message.type === 'user'
                          ? styles.userMessageContainer
                          : styles.aiMessageContainer
                      }
                    >
                      {message.type !== 'user' && (
                        <div className={styles.aiIcon}>
                          <Image
                            src={`${GRIP_INVEST_BUCKET_URL}ai-assist/star-feedback.svg`}
                            alt=""
                            width={35}
                            height={35}
                          />
                        </div>
                      )}
                      <div
                        className={
                          message.type === 'user'
                            ? styles.userContent
                            : styles.aiMessage
                        }
                      >
                        {cleanedText ? (
                          <ReactMarkdown>{String(cleanedText)}</ReactMarkdown>
                        ) : null}
                      </div>
                      {message.type === 'user' && (
                        <div className={styles.userIcon}>
                          <ProfileImage size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef}></div>
            </div>
          </div>
          <div className={styles.queryInputSection}>
            <textarea
              className={styles.queryInput}
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (isMobile) {
                  setTimeout(() => {
                    const footer = document.querySelector(`.${styles.footer}`);
                    if (footer) {
                      footer.scrollIntoView({
                        block: 'end',
                        behavior: 'smooth',
                      });
                    }
                  }, 300);
                }
              }}
              placeholder="Type a query"
              rows={1}
            />
            <button
              onClick={isProcessing ? onStopChat : handleSendMessage}
              className={styles.sendButton}
              disabled={localQuery.trim() === '' && !isProcessing}
            >
              {isProcessing ? (
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}ai-assist/button_stop.svg`}
                  alt="pause"
                  width={36}
                  height={31}
                />
              ) : (
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}ai-assist/button_send.svg`}
                  alt="send"
                  width={36}
                  height={31}
                />
              )}
            </button>
          </div>
          <div className={styles.footer}>
            <p>
              AI-generated responses may be inaccurate. Refer to the offer{' '}
              document before investing.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
export default AiAssistPopup;
