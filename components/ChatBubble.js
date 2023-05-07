import React, { useState, useEffect, useRef } from 'react';

const ChatBubble = ({ text, side,top,left }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const animationRef = useRef(null);

  const updatePosition = () => {
    const top = Math.floor(Math.random() * (window.innerHeight - 150));
    const left = Math.floor(Math.random() * (window.innerWidth - 150));
    setPosition({ top, left });
    animationRef.current = setTimeout(updatePosition, 3500);
  };

  useEffect(() => {
    const initialTop = Math.floor(Math.random() * (window.innerHeight - 150));
    const initialLeft = Math.floor(Math.random() * (window.innerWidth - 150));
    setPosition({ top: initialTop, left: initialLeft });
    animationRef.current = setTimeout(updatePosition, 3500);

    return () => {
      clearTimeout(animationRef.current);
    };
  }, []);

  const bubbleStyle = {
    position: 'absolute',
    borderRadius: '20px',
    padding: '15px 25px',
    margin: '10px',
    maxWidth: '60%',
    wordWrap: 'break-word',
    float: side,
    clear: 'both',
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
