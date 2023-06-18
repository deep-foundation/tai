import React, { useState, useEffect, useRef, CSSProperties } from 'react';

interface ChatBubbleProps {
  text: string;
  side: 'left' | 'right';
  top: number;
  left: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, side, top, left }) => {
  const [position, setPosition] = useState<{top: number, left: number}>({ top: 0, left: 0 });
  const animationRef = useRef<number | null>(null);

  const updatePosition = () => {
    top = Math.floor(Math.random() * (window.innerHeight - 150));
    left = Math.floor(Math.random() * (window.innerWidth - 150));
    setPosition({ top, left });
    animationRef.current = window.setTimeout(updatePosition, 3500);
  };

  useEffect(() => {
    const initialTop = Math.floor(Math.random() * (window.innerHeight - 150));
    const initialLeft = Math.floor(Math.random() * (window.innerWidth - 150));
    setPosition({ top: initialTop, left: initialLeft });
    animationRef.current = window.setTimeout(updatePosition, 3500);

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  const bubbleStyle: CSSProperties = {
    position: 'absolute',
    borderRadius: '20px',
    padding: '15px 25px',
    margin: '10px',
    maxWidth: '60%',
    wordWrap: 'break-word',
    float: side,
    clear: 'both' as 'both',
    backgroundColor: side === 'left' ? '#f1f1f1' : '#4caf50',
    color: side === 'right' ? 'white' : 'black',
    fontSize: '36px',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transition: 'top 1s ease, left 1s ease',
  };

  return <div style={bubbleStyle}>{text}</div>;
};

export default ChatBubble;
