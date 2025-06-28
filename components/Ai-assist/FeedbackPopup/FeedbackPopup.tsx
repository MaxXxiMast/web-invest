import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './FeedbackPopup.module.css';
import { GRIP_INVEST_BUCKET_URL } from '../../../utils/string';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';
import { newRelicErrLogs, trackEvent } from '../../../utils/gtm';
import { getRatingLabel } from '../utils';
import { useAppSelector } from '../../../redux/slices/hooks';
interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const countWords = (text: string) => {
  if (!text.trim()) return 0;
  return text.trim().match(/\S+/g)?.length || 0;
};

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isError, setIsError] = useState(false);
  const userID = useAppSelector((state) => state.user.userData?.userID);
  const asset = useAppSelector((state) => state.assets.selectedAsset);
  const isMobile = useMediaQuery();

  const wordCount = countWords(feedback);

  useEffect(() => {
    setIsError(wordCount > 200);
  }, [wordCount]);
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setFeedback(newText);
  };
  const handleSubmit = () => {
    const feedbackData = {
      rating: rating || 'No rating provided',
      feedback: feedback || 'No feedback provided',
      userID: userID || 'Guest',
      assetID: asset?.assetID || 'Unknown Asset',
    };
    newRelicErrLogs('Deal Assist: Feeddback Submitted', 'info', feedbackData);

    trackEvent('ai_assist_feedback_submitted', feedbackData);

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    });
  };

  useEffect(() => {
    const chatWindow = document.getElementById('feedback-popup');

    if (!chatWindow) return;

    const lockScroll = () => {
      document.body.style.overflow = 'hidden';
    };

    const unlockScroll = () => {
      document.body.style.overflow = 'unset';
    };

    const handleClick = (event: any) => {
      if (chatWindow.contains(event.target)) {
        lockScroll();
      } else {
        unlockScroll();
      }
    };

    const handleMouseEnter = () => lockScroll();
    const handleMouseLeave = () => unlockScroll();

    if (isMobile) {
      document.addEventListener('click', handleClick);
    } else {
      chatWindow.addEventListener('mouseenter', handleMouseEnter);
      chatWindow.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (isMobile) {
        document.removeEventListener('click', handleClick);
      } else {
        chatWindow.removeEventListener('mouseenter', handleMouseEnter);
        chatWindow.removeEventListener('mouseleave', handleMouseLeave);
      }
      unlockScroll();
    };
  }, [isMobile]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.feedbackContainer} id="feedback-popup">
        <div className={styles.feedbackBox}>
          {!isMobile ? (
            <div>
              <span className={styles.chatpopupSpan}>
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

              <button onClick={onClose} className={styles.closeButton}>
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}ai-assist/close-button.svg`}
                  alt="close"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          ) : (
            <span className="star-feedback">
              <Image
                src={`${GRIP_INVEST_BUCKET_URL}ai-assist/star-feedback.svg`}
                alt="star-feedback"
                width={70}
                height={70}
                className={styles.starFeedback}
              />
              <button onClick={onClose} className={styles.closeButton}>
                <Image
                  src={`${GRIP_INVEST_BUCKET_URL}ai-assist/close-button.svg`}
                  alt="close"
                  width={28}
                  height={28}
                  className={styles.closeButtonIcon}
                />
              </button>
            </span>
          )}

          <h3>How was your AI chat experience?</h3>
          {!isMobile && (
            <p className={styles.subText}>
              Please take a moment to rate and review! <br />
              Your feedback helps us improve!
            </p>
          )}

          {!submitted && (
            <>
              <div className={styles.starContainer}>
                {[...Array(5)].map((_, index) => {
                  const isFilled = index < rating;
                  const imageName = isFilled
                    ? 'feedback-colored-star.svg'
                    : 'feedback-empty-star.svg';

                  return (
                    <Image
                      key={index}
                      src={`${GRIP_INVEST_BUCKET_URL}ai-assist/${imageName}`}
                      alt="Star"
                      width={40}
                      height={40}
                      className={styles.star}
                      onClick={() => setRating(index + 1)}
                    />
                  );
                })}
                <p className={styles.experienceLabel}>
                  {getRatingLabel(rating)}
                </p>
              </div>
              <div className={styles.feedbackTextArea}>
                <label
                  className={`${styles.feedbackLabel} ${
                    isFocused || feedback ? styles.activeLabel : ''
                  }`}
                >
                  Describe what motivated your review (optional)
                </label>
                <textarea
                  className={`${styles.feedbackInput} ${
                    isError ? styles.feedbackInputError : ''
                  }`}
                  value={feedback}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(feedback.length > 0)}
                  onChange={handleFeedbackChange}
                />
                {isError && (
                  <p className={`${styles.wordCount} ${styles.wordCountError}`}>
                    Word Limit Exceeded ({wordCount}/200)
                  </p>
                )}
              </div>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={!rating || isError}
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
