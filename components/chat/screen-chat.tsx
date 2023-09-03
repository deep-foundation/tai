import React, { useEffect, useState, useRef } from 'react';
import { Box, IconButton, Text } from '@chakra-ui/react';
import { TfiClose } from 'react-icons/tfi';
import { MemoizedMessage } from './message';
import { motion } from 'framer-motion';
import { MemoizedInputChat } from './input-chat';
import { RecordButton } from '../record-button';

const MotionBox = motion(Box);

function _ScreenChat({ 
  newConversationLinkId, 
  deep, 
  handleCloseChat, 
  openInput,
  value,
  onChange,
  sendMessage
}:{ 
  newConversationLinkId: number; 
  deep: any; 
  handleCloseChat;
  openInput: boolean;
  value: any;
  onChange: any;
  sendMessage: any;
}) {
  const [messages, setMessages] = useState<Array<any>>([]);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [chatGptLinkId, setChatGptLinkId] = useState(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesCount = useRef<number>(0);

  useEffect(() => {
    const fetchChatGptLinkId = async () => {
      const id = await deep.id('@deep-foundation/chatgpt', 'ChatGPT');
      setChatGptLinkId(id);
    };

    fetchChatGptLinkId();
  }, [deep]);

  useEffect(() => {
    const fetchMessages = async () => {
      const messagingTreeId = await deep.id("@deep-foundation/messaging", "MessagingTree");
      const messageTypeLinkId = await deep.id("@deep-foundation/messaging", "Message");
      const authorTypeLinkId = await deep.id("@deep-foundation/messaging", "Author");
      const result = await deep.select({
        tree_id: { _eq: messagingTreeId },
        link: { type_id: { _eq: messageTypeLinkId } },
        root_id: { _eq: newConversationLinkId },
        // @ts-ignore
        self: { _eq: true }
      }, {
        table: 'tree',
        variables: { order_by: { depth: "asc" } },
        returning: `
          id
          depth
          root_id
          parent_id
          link_id
          link {
            id
            from_id
            type_id
            to_id
            value
            author: out (where: { type_id: { _eq: ${authorTypeLinkId}} }) {
              id
              from_id
              type_id
              to_id
            }
          }`
      });
      const lastMessage = result?.data[result.data.length - 1];

      if (lastMessage?.link?.author?.[0]?.to_id !== chatGptLinkId) {
        setIsWaitingResponse(true);
      } else {
        setIsWaitingResponse(false);
      }

      setMessages(result?.data);
    };
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 1000);
    return () => clearInterval(intervalId);
  }, [newConversationLinkId]);


  useEffect(() => {
      if (chatContainerRef.current && messages.length > prevMessagesCount.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
      prevMessagesCount.current = messages.length;
  }, [messages]);
  
  return (<Box position="fixed" bottom={0} left={0} zIndex={1000} width='100vw' height='34.7vh'>
      <Box position="relative" textAlign='end'>
        <IconButton 
          variant='solid'
          background='#03001da8' 
          borderColor='#909294' 
          boxShadow='inset 0 0 3px 1px #386018'
          aria-label='Close chat' 
           
          icon={<TfiClose color='#909294' />} 
          onClick={handleCloseChat} 
        />
      </Box>
      <Box position='relative' display='grid' gridAutoRows='1fr max-content' bg='#03001da8' p='1rem' boxShadow='0 5px 5px 5px #386018' width='100vw' height='30vh'>
        <Box
          ref={chatContainerRef}
          display="flex"
          flexDirection="column"
          overflowY="scroll"
          height='100%'
          position='relative'
          sx={{
            '&>*': {
              marginBottom: '1rem',
            }
          }}
        >
          {messages.length ? <Text key="header" fontWeight="bold" align='center' fontSize="lg" color='#deffee'>Online consultant</Text> : null}
          {messages.map((message, index) => (
            <MemoizedMessage 
              key={message.id}
              text={message?.link?.value?.value}
              align={message?.link?.author?.[0]?.to_id === chatGptLinkId ? 'left' : 'right'}
              arrow={message?.link?.author?.[0]?.to_id === chatGptLinkId ? 'left' : 'right'}
              fill={message?.link?.author?.[0]?.to_id === chatGptLinkId ? '#dcdcdc' : '#cce4ff'}
            />
          ))}
          {isWaitingResponse && messages.length > 0 && (
            <MemoizedMessage
              text="Thinking..."
              align='left'
              arrow='left'
              fill='#dcdcdc'
            />
          )}
        </Box>
        <MemoizedInputChat openInput={openInput} sendMessage={sendMessage} value={value} onChange={onChange} />
      </Box>
    </Box>
  );
  
  
};

export const ScreenChat = React.memo(_ScreenChat);
