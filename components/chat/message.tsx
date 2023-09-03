import { Avatar, Box, HStack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import { GiHemp } from 'react-icons/gi';
import { BubbleArrowLeft, BubbleArrowRight } from "./bubble-arrow";


function CreatureAvatar({
  emoji,
  name,
  src,
  size,
  icon,
  bg = '#01fffa',
  fontSizeEmoji = '1rem',
  fontSizeName = '1rem',
}: {
  emoji?: string;
  name?: string;
  src?: string;
  size?: string;
  icon?: any;
  bg?: string;
  fontSizeEmoji?: string;
  fontSizeName?: string;
}) {
  return src
    ? <Avatar src={src} size={size} bg={bg} />
    : emoji
    ? <Avatar name={emoji} getInitials={str => str} size={size} bg={bg}
        sx={{
          '& > div': {
            fontSize: fontSizeEmoji
          },
        }} />
    : name
    ? <Avatar name={name} size={size} bg={bg} fontSize={fontSizeName} />
    : <Avatar icon={icon} size={size} bg={bg} />
};

const MemoizedCreatureAvatar = React.memo(CreatureAvatar);

const MotionBox = motion(Box);

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
  flexDivProps?: any;
  messageDivProps?: any;
};

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function Message ({
  text='Hello',
  align = 'left',
  arrow = align,
  fill = align === 'right' ? '#deffee' : '#03001d',
  src,
  emoji='💀',
  name,
  flexDivProps = {},
  messageDivProps = {},
}:IMessage) {

  return (<MotionBox
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={messageVariants}
      // @ts-ignore
      transition={{ duration: 0.3 }}
      width="100%"
      // width="calc(100% - 2.5rem)"
    > 
      <HStack 
        w='100%' 
        display='flex' 
        alignItems='flex-end'
        justifyContent={ align === 'left' ? 'flex-start' : 'flex-end'}
        spacing={2}
      >
        {align === 'left' && <CreatureAvatar icon={<GiHemp />} bg='#306604' />}
        <Box {...flexDivProps} sx={{
          ...flexDivProps.style,
          width: 'calc(100% - 6rem)',
          display: 'flex',
          alignItems: align === 'right' ? 'flex-end' : 'flex-start',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        }}>
          <Box
            padding='0.5rem 0.75rem'
            position='relative'
            w='auto'
            maxW='100%'
            borderRadius='2xl'
            boxSizing='border-box'
            sx={{
              wordWrap: 'break-word',
              wordBreak: 'break-word',
              clear: 'both',
              'hyphens': 'auto',
            }}  
            {...messageDivProps} style={{
            ...messageDivProps.style,
            backgroundColor: align === 'right' ? '#deffee' : '#334f1c',
          }}>
              <Text fontSize='sm' color={arrow === 'right' ? '#334f1c' : '#deffee'}>
                {text}
              </Text>
            {align === 'left' && <BubbleArrowLeft fill='#334f1c' style={{position: 'absolute', left: -5, bottom: -1}} />}
            {align === 'right' && <BubbleArrowRight fill='#deffee' style={{position: 'absolute', right: -9, bottom: 0}} />}
          </Box>
        </Box>
        {align === 'right' && <CreatureAvatar emoji='You' />}
      </HStack>
    </MotionBox>
  )
}

export const MemoizedMessage = React.memo(Message);
