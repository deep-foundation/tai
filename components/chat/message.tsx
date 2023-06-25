import { Box, HStack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { Avatar } from '@chakra-ui/react';


export const CreatureAvatar = React.memo<any>(({
  emoji,
  name,
  src,
  size,
}: {
  emoji?: string;
  name?: string;
  src?: string;
  size?: string;
}) => {
  return src
    ? <Avatar src={src} size={size} />
    : emoji
    ? <Avatar name={emoji} getInitials={str => str} size={size} />
    : name
    ? <Avatar name={name} size={size} />
    : <Avatar name={'?'} size={size} />
});


const MotionBox = motion(Box);

export const Bubble = React.memo<any>(({ messages }) => { 
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      width="100%"
      height="100%"
      bg="rgba(0,0,0,0.5)"
      zIndex={1000}
      overflowY="auto"
      p={4}
    >
      {messages.map((message, index) => (
        <Message key={index} text={message} />
      ))}
    </Box>
  );
})

const BubbleArrowRight = ({
  width="12pt",
  height="12pt",
  fill="rgba(0,0,0, 0.5)",
  stroke="transparent",
  strokeOpacity=0.5,
  strokeWidth=0,
  ...props
}) => {
  const [invisible, setInvisible] = useState(true);


  return <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    style={{ isolation: "isolate" }}
    viewBox="0 0 12 12"
    width={width}
    height={height}
    {...props}
  >
    <defs>
      <clipPath id="bubble-arrow-right">
        <path d="M0 0H12V12H0z" />
      </clipPath>
    </defs>
    <g clipPath="url(#bubble-arrow-right)">
      <path
        d="M6.991.597Q7 5.126 7.817 6.928q.817 1.802 3.519 3.887c.223.171.177.342-.101.38q-3.837.525-6.033-.275-2.196-.801-4.679-2.822L6.991.597z"
        fill={fill}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeLinecap="square"
        strokeMiterlimit={3}
      />
    </g>
  </svg>
}

const BubbleArrowLeft = ({
  width="12pt",
  height="12pt",
  fill="rgba(0,0,0, 0.5)",
  stroke="transparent",
  strokeOpacity=0.5,
  strokeWidth=0,
  ...props
}) => {
  const [invisible, setInvisible] = useState(true);


  return <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    style={{ isolation: "isolate" }}
    viewBox="0 0 12 12"
    width={width}
    height={height}
    {...props}
  >
    <defs>
      <clipPath id="bubble-arrow-left">
        <path d="M0 0H12V12H0z" />
      </clipPath>
    </defs>
    <g clipPath="url(#bubble-arrow-left)">
      <path
        d="M5.009.597Q5 5.126 4.183 6.928 3.366 8.73.664 10.815c-.223.171-.177.342.101.38q3.837.525 6.033-.275 2.196-.801 4.679-2.822L5.009.597z"
        fill={fill}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeLinecap="square"
        strokeMiterlimit={3}
      />
    </g>
  </svg>
}

interface IMessage {
  date?: Date;
  text: any;
  align?: 'left' | 'right';
  arrow?: 'none' | 'left' | 'right';
  fill?: string;
  color?: string;
  src?: any;
  emoji?: any;
  name?: any;
  stage?: 'none' | 'sended' | 'received' | 'viewed';
  flexDivProps?: any;
  messageDivProps?: any;
  answerButton?: any;
};

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const Message = ({
  text='Однообразные мелькают Все с той же болью дни мои, Как будто розы опадают И умирают соловьи. Но и она печальна тоже, Мне приказавшая любовь, И под ее атласной кожей Бежит отравленная кровь.',
  align = 'left',
  arrow = align,
  fill = align === 'right' ? '#dcdcdc' : '#cce4ff',
  color = '#000',
  src,
  emoji='💀',
  name,
  stage = 'none',
  flexDivProps = {},
  messageDivProps = {},
  answerButton,
}:IMessage) => {

  return (<MotionBox
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={messageVariants}
      // @ts-ignore
      transition={{ duration: 0.3 }}
      width="calc(100% - 2.5rem)"
    > 
      <HStack maxW='sm' display='flex' alignItems='flex-end' spacing={2}>
        {arrow === 'left' && <CytoReactLinkAvatar emoji={emoji} name={name} src={src} />}
        <Box {...flexDivProps} sx={{
          ...flexDivProps.style,
          width: 'calc(100% - 55px)',
          display: 'flex',
          alignItems: align === 'right' ? 'flex-end' : 'flex-start',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        }}>
          <Box
            padding='0.5rem 0.75rem'
            position='relative'
            w='auto'
            maxW='100%'
            wordWrap='break-word'
            wordBreak='break-word'
            borderRadius='2xl'
            boxSizing='border-box'
            sx={{
              clear: 'both',
              'hyphens': 'auto',
            }}  
            {...messageDivProps} style={{
            ...messageDivProps.style,
            backgroundColor: fill,
          }}>
              <Text fontSize='sm' color='gray900'>
                {text}
              </Text>
            {arrow === 'left' && <BubbleArrowLeft fill={fill} style={{position: 'absolute', left: -6, bottom: 0}} />}
            {arrow === 'right' && <BubbleArrowRight fill={fill} style={{position: 'absolute', right: -6, bottom: 0}} />}
          </Box>
        </Box>
        {align === 'right' && <CytoReactLinkAvatar emoji={emoji} name={name} src={src} />}
      </HStack>
    </MotionBox>
  )
}