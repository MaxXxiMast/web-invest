import { GRIP_INVEST_BUCKET_URL } from '../../utils/string';

export const mostAskedQuestions = [
  {
    text: 'Can you summarise this deal for me?',
    icon: `${GRIP_INVEST_BUCKET_URL}ai-assist/list-ordered.svg`,
  },
  {
    text: 'What is the underlying security package?',
    icon: `${GRIP_INVEST_BUCKET_URL}ai-assist/gallery-vertical-end.svg`,
  },
  {
    text: 'Why should I invest in this deal?',
    icon: `${GRIP_INVEST_BUCKET_URL}ai-assist/star.svg`,
  },
];

export const getRatingLabel = (rating: number | null): string => {
  const labels = ['Very Poor', 'Poor', 'Neutral', 'Good', 'Excellent'];
  return rating ? labels[rating - 1] : '';
};

export const setupChatPopupScrollLock = (
  isMobile: boolean,
  chatWindowId = 'chat-popup'
) => {
  const chatWindow = document.getElementById(chatWindowId);
  if (!chatWindow) return () => {};

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

  const handleFocusIn = () => {
    if (isMobile) {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
    }
  };

  const handleFocusOut = () => {
    if (isMobile) {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  if (isMobile) {
    document.addEventListener('click', handleClick);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
  } else {
    chatWindow.addEventListener('mouseenter', handleMouseEnter);
    chatWindow.addEventListener('mouseleave', handleMouseLeave);
  }

  return () => {
    if (isMobile) {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    } else {
      chatWindow.removeEventListener('mouseenter', handleMouseEnter);
      chatWindow.removeEventListener('mouseleave', handleMouseLeave);
    }
    unlockScroll();
  };
};
