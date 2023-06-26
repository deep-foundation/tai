import React, { useEffect, useState } from 'react';
import { Box, IconButton, Text } from '@chakra-ui/react';
import { TfiClose } from 'react-icons/tfi';
import { Message } from './message';


export const ScreenChat = React.memo<any>(({ newConversationLinkId, deep, handleCloseChat }) => {
  const [messages, setMessages] = useState<Array<any>>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  
  let chatGptLinkId;
  
  async () => { chatGptLinkId = await deep.id('@deep-foundation/chatgpt', 'ChatGPT') }

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
      setMessages(result?.data);
      setMessagesCount(result?.data.length);
    };
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 1000);
    return () => clearInterval(intervalId);
  }, [newConversationLinkId]);
  return (
    <Box
      display="flex"
      flexDirection="column"
      position="fixed"
      bottom={0}
      left={0}
      zIndex={1000}
      overflowY="scroll"
      height='30vh'
      width='100vw'
      bg='#03001da8'
      p={3}
      _before={{ content: '""', position: 'absolute', top: 0, left: 0, width: 0, borderTop: '1.5rem solid #0c3b01', borderRight: '1.5rem solid transparent' }}
      _after={{ content: '""', position: 'absolute', top: 0, right: 0, width: 0, borderTop: '1.5rem solid #0c3b01', borderLeft: '1.5rem solid transparent' }}
      sx={{
        '& > *:not(:last-child)': {
          mb: '1rem',
        },
      }}
    >
      {/* <Diamand /> */}
      <Box position="absolute" right={3} top={3}>
        <IconButton variant='outline' borderColor='#909294' aria-label='Close chat' isRound icon={<TfiClose color='#909294' />} onClick={handleCloseChat} />
      </Box>
      { messagesCount ? [<Text key="header" fontWeight="bold" align='center' fontSize="lg" color='#deffee'>Online consultant</Text>] : null }
      { messagesCount ? [
          messages.map(message => (
            <Message key={message.id}
              text={message?.link?.value?.value}
              align = {message?.link?.author?.[0]?.to_id === chatGptLinkId ? 'right' : 'left'}
              arrow = {message?.link?.author?.[0]?.to_id === chatGptLinkId ? 'right' : 'left'}
              fill = {message?.link?.author?.[0]?.to_id === chatGptLinkId ? 'left' : 'right' ? '#dcdcdc' : '#cce4ff'}
            />
          ))
        ] : []
      }
    </Box>
  );
})

const Diamand = () => {
  return (<Box
    sx={{
      bg: '#03001d',
      clipPath: 'polygon(25% 0, 75% 0, 100% 20%, 50% 100%, 0 20%)',
      allignSelf: 'center',
      margin: 'auto',
    }}/>
  )
}