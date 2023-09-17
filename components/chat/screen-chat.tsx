import React, { useEffect, useState, useRef } from 'react';
import { Box, IconButton, Text } from '@chakra-ui/react';
import { TfiClose } from 'react-icons/tfi';
import { MemoizedMessage } from './message';
import { m, motion } from 'framer-motion';
import { MemoizedInputChat } from './input-chat';

const MotionBox = motion(Box);

function _ScreenChat({
  newConversationLinkId,
  deep,
  handleCloseChat,
  openInput,
  value,
  onChange,
  sendMessage
}: {
  newConversationLinkId: number;
  deep: any;
  handleCloseChat: () => void;
  openInput: boolean;
  value: any;
  onChange: any;
  sendMessage: any;
}) {
  const [messages, setMessages] = useState<Array<any>>([]);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [linkData, setLinkData] = useState({
    messageTypeLinkId: null,
    authorTypeLinkId: null,
    messagingTreeId: null
  });
  const { messageTypeLinkId, authorTypeLinkId, messagingTreeId } = linkData;
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLinkIds = async () => {
      setLinkData({
        messageTypeLinkId: await deep.id("@deep-foundation/messaging", "Message"),
        authorTypeLinkId: await deep.id("@deep-foundation/messaging", "Author"),
        messagingTreeId: await deep.id("@deep-foundation/messaging", "messagingTree")
      });
    };

    fetchLinkIds();
  }, [deep]);

  const allLinks = deep.useDeepSubscription({
    down: {
      _or: [
        {
          tree_id: { _eq: messagingTreeId },
          link: { type_id: { _eq: messageTypeLinkId } },
          root_id: { _eq: newConversationLinkId },
          self: { _eq: true }
        },
        {
          link: { type_id: { _eq: authorTypeLinkId } }
        }
      ]
    }
  });

  const result = allLinks.data;
  const filteredMessages = deep.minilinks.byType[1057] || [];

  const messagesWithReplies = result.filter(message =>
    result.some(link => link.from_id === message.id)
  );

  useEffect(() => {
    const fetchMessages = async () => {
      const lastMessage = filteredMessages && filteredMessages.length ? filteredMessages[filteredMessages.length - 1] : null;
      const isLastMessageReplied = lastMessage && messagesWithReplies.some(message => message.id === lastMessage.id);
      setIsWaitingResponse(!isLastMessageReplied);
      if (filteredMessages.length !== messages.length) {
        setMessages(filteredMessages);
      }
    };
    fetchMessages();

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [allLinks]);

  return (
    <MotionBox position="fixed" bottom={0} left={0} zIndex={1000} width='100vw' height='34.7vh'>
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
        <Box ref={chatContainerRef} display="flex" flexDirection="column" overflowY="scroll" height='100%' position='relative' sx={{ '&>*': { marginBottom: '1rem', } }}>
          <Text key="header" fontWeight="bold" align='center' fontSize="lg" color='#deffee'>Online consultant</Text>
          {messages.map(message => (
            <MemoizedMessage
              key={message.id}
              text={message?.string?.value}
              align={messagesWithReplies.some(reply => reply.id === message.id) ? 'left' : 'right'}
              arrow={messagesWithReplies.some(reply => reply.id === message.id) ? 'left' : 'right'}
              fill={messagesWithReplies.some(reply => reply.id === message.id) ? '#dcdcdc' : '#cce4ff'}
            />
          ))}
          {isWaitingResponse && messages.length > 0 && <MemoizedMessage text="Thinking..." align='left' arrow='left' fill='#dcdcdc' />}
        </Box>
        <MemoizedInputChat openInput={openInput} sendMessage={sendMessage} value={value} onChange={onChange} />
      </Box>
    </MotionBox>
  );
}

export const ScreenChat = React.memo(_ScreenChat);