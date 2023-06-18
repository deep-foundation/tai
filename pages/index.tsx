import React, { useEffect, useState, CSSProperties, useRef } from 'react';
import { useLocalStore } from '@deep-foundation/store/local';
import {
  Text,
  Stack,
  Heading,
  Button,
  Box,
} from '@chakra-ui/react';
import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
const assert = require('assert');
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import startRecording from '../imports/capacitor-voice-recorder/strart-recording';
import stopRecording from '../imports/capacitor-voice-recorder/stop-recording';
import uploadRecords from '../imports/capacitor-voice-recorder/upload-records';
import createContainer from '../imports/capacitor-voice-recorder/create-container';
import ChatBubble from '../components/ChatBubble';

interface ContentParam {
  deep: DeepClient;
  deviceLinkId: number;
}

function Content() {
  useEffect(() => {
    defineCustomElements(window);
  }, []);
  let deep = useDeep();
  const [lastPress, setLastPress] = useState<number>(0);
  const [newConversationLinkId, setNewConversationLinkId] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isChatClosed, setIsChatClosed] = useState<boolean>(false);
  const [isTimeEnded, setIsTimeEnded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const startTime = useRef('');
  let replyMessageLinkId;
  const path = process.env.NEXT_PUBLIC_GQL_PATH;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const googleAuth = process.env.NEXT_PUBLIC_GOOGLE_AUTH || '';
  const systemMsg = process.env.NEXT_PUBLIC_SYSTEM_MSG;
  const apolloClient = generateApolloClient({
    path,
    ssl: true,
    ws: true,
    token: process.env.NEXT_PUBLIC_TOKEN,
  });

  let deepClient = new DeepClient({ apolloClient });

  const [containerLinkId, setContainerLinkId] = useLocalStore<number>(
    'containerLinkId',
    0
  );

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId !== 0) {
        return;
      }
      const guest = await deepClient.guest();
      const guestDeep = new DeepClient({ deep: deepClient, ...guest });
      const adminId = await deepClient.id('deep', 'admin');
      const admin = await deepClient.login({ linkId: adminId });
      deep = new DeepClient({ deep: deepClient, ...admin });
    })
  }, [deep])

  useEffect(() => {
    if (!containerLinkId) {
      const initializeContainerLink = async () => {
        setContainerLinkId(await createContainer(deep));
      };
      initializeContainerLink();
    }
  }, [])

  useEffect(() => {
    (async () => {
      const apiKeyTypeLinkId = await deep.id("@deep-foundation/openai", "ApiKey");
      const googleCloudAuthKeyTypeLink = await deep.id("@deep-foundation/google-speech", "GoogleCloudAuthFile");
      const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
      const { data: checkApiKeyLink } = await deep.select({
        type_id: apiKeyTypeLinkId,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });

      if (!checkApiKeyLink || checkApiKeyLink.length === 0) {
        const { data: [{ id: apiKeyLinkId }] } = await deep.insert({
          type_id: apiKeyTypeLinkId,
          string: { data: { value: apiKey } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            },
          },
        });
      }

      const { data: checkGoogleAuthLink } = await deep.select({
        type_id: googleCloudAuthKeyTypeLink,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });

      if (!checkGoogleAuthLink || checkGoogleAuthLink.length === 0) {
        let parsedGoogleAuth;
        parsedGoogleAuth = JSON.parse(googleAuth);
        parsedGoogleAuth.private_key = parsedGoogleAuth.private_key.replace(/\\n/g, '\n');
        const { data: [{ id: googleAuthLinkId }] } = await deep.insert({
          type_id: googleCloudAuthKeyTypeLink,
          object: { data: { value: parsedGoogleAuth } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            },
          },
        });
      }
    })();
  }, []);

  const handleClick = async () => {
    if (!isRecording) {
      try {
        startTime.current = await startRecording();
        setIsRecording(true);
      } catch (error) {
        console.log('Error starting recording:', error);
      }
    } else {
      try {
        setIsProcessing(true);
        const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
        const transcribeTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcribe");
        const messageTypeLinkId = await deep.id('@deep-foundation/messaging', 'Message');
        const replyTypeLinkId = await deep.id('@deep-foundation/messaging', 'Reply');
        const transcriptionTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcription");
        const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");
        const systemTypeLinkId = await deep.id("@deep-foundation/chatgpt", "System");
        const authorTypeLinkId = await deep.id('@deep-foundation/messaging', 'Author');
        const messagingTreeId = await deep.id('@deep-foundation/messaging', 'MessagingTree');
        const tokensTypeLinkId = await deep.id("@deep-foundation/tokens", "Tokens")
        const soundTypelinkId = await deep.id("@deep-foundation/sound", "Sound");
        const formatTypelinkId = await deep.id("@deep-foundation/sound", "Format");
        const mimetypeTypelinkId = await deep.id("@deep-foundation/sound", "MIME/type");
        const record = await stopRecording(deep, containerLinkId, startTime.current);
        const endTime = new Date().toLocaleDateString();
        const soundLinkId = await uploadRecords(deep, containerLinkId, [{ record, startTime, endTime }])
        console.log("soundLinkId", soundLinkId)

        const { data: [{ id: transcribeTextLinkId }] } = await deep.insert({
          type_id: transcribeTypeLinkId,
          from_id: deep.linkId,
          to_id: soundLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            }
          }
        });
        console.log("transcribeTextLinkId", transcribeTextLinkId)

        const { link: transcribedTextLinkId } = await tryGetLink(deep, {
          delayMs: 1000,
          attemptsCount: 20,
          selectData: {
            type_id: transcriptionTypeLinkId,
            in: {
              type_id: containTypeLinkId,
              from_id: soundLinkId
            },
          },
        });
        assert.notEqual(transcribedTextLinkId, undefined);

        console.log("transcribedTextLinkId", transcribedTextLinkId)

        const { data: checkConversationLink } = await deep.select({
          type_id: conversationTypeLinkId,
          in: {
            type_id: containTypeLinkId,
            from_id: deep.linkId,
          },
        });

        console.log("checkConversationLink", checkConversationLink)

        if (!checkConversationLink || checkConversationLink.length === 0) {
          console.log("newConversationLinkId")
          const { data: [{ id: conversationLinkId }] } = await deep.insert({
            type_id: conversationTypeLinkId,
            string: { data: { value: "New chat" } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });

          setNewConversationLinkId(conversationLinkId)

          console.log("flakeed7");

          const { data: [{ id: systemMessageLinkId }] } = await deep.insert({
            type_id: messageTypeLinkId,
            string: { data: { value: systemMsg } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            },
          });

          console.log("systemMsg", systemMsg)

          const { data: [{ id: systemMessageToConversationLinkId }] } = await deep.insert({
            type_id: systemTypeLinkId,
            from_id: systemMessageLinkId,
            to_id: conversationLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });

          const { data: [{ id: messageLinkId }] } = await deep.insert({
            type_id: messageTypeLinkId,
            string: { data: { value: transcribedTextLinkId.value.value } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            },
          });

          const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
            type_id: replyTypeLinkId,
            from_id: messageLinkId,
            to_id: conversationLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });
          replyMessageLinkId = replyToMessageLinkId;
        } else {
          const sortedData = checkConversationLink.sort((a, b) => b.id - a.id);
          console.log("sortedData", sortedData)
          setNewConversationLinkId(sortedData[0].id)
        }

        console.log("isChatClosed", isChatClosed)

        if (newConversationLinkId) {
          if (isTimeEnded || isChatClosed) {
            console.log("isChatClosed", isChatClosed)
            setIsChatClosed(false)
            console.log("flakeed7");

            const { data: [{ id: systemMessageLinkId }] } = await deep.insert({
              type_id: messageTypeLinkId,
              string: { data: { value: systemMsg } },
              in: {
                data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                }
              },
            });

            console.log("systemMsg", systemMsg)

            const { data: [{ id: systemMessageToConversationLinkId }] } = await deep.insert({
              type_id: systemTypeLinkId,
              from_id: systemMessageLinkId,
              to_id: newConversationLinkId,
              in: {
                data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                },
              },
            });

            const { data: [{ id: messageLinkId }] } = await deep.insert({
              type_id: messageTypeLinkId,
              string: { data: { value: transcribedTextLinkId.value.value } },
              in: {
                data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                }
              },
            });

            const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
              type_id: replyTypeLinkId,
              from_id: messageLinkId,
              to_id: newConversationLinkId,
              in: {
                data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                },
              },
            });

            replyMessageLinkId = replyToMessageLinkId;
            setIsTimeEnded(false)
          } else {
            console.log("timeDifferenceInSeconds <= 15 || !isChatClose")
            const { data: replyLinks } = await deep.select({
              type_id: replyTypeLinkId,
            });

            const replyLink = replyLinks.sort((a, b) => {
              if (b.id !== undefined && a.id !== undefined) {
                return b.id - a.id;
              } else {
                return 0;
              }
            });

            console.log("replyLinks", replyLink)

            const { data: conversationLink } = await deep.select({
              tree_id: { _eq: messagingTreeId },
              parent: { type_id: { _in: [conversationTypeLinkId, messageTypeLinkId] } },
              link: { id: { _eq: replyLink[0].from_id } },
            }, {
              table: 'tree',
              variables: { order_by: { depth: "asc" } },
              returning: `
              id
              depth
              root_id
              parent_id
              link_id
              parent {
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
                tokens: out (where: { type_id: { _eq: ${tokensTypeLinkId}} }) { 
                  id
                  from_id
                  type_id
                  to_id
                  value
                }
              }`
            })

            console.log("conversationLink", conversationLink)

            const { data: [{ id: messageLinkId }] } = await deep.insert({
              type_id: messageTypeLinkId,
              string: { data: { value: transcribedTextLinkId.value.value } },
              in: {
                data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                }
              },
            });

            const { data: [{ id: replyToMessageLinkId }] } = await deep.insert({
              type_id: replyTypeLinkId,
              from_id: messageLinkId,
              to_id: replyLink[0].from_id,
              in: {
                data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                },
              },
            });
            replyMessageLinkId = replyToMessageLinkId;
            console.log("replyMessageLinkId", replyMessageLinkId)
          }
        }

        console.log("flakeed8");
        setLastPress(Date.now());
        setIsRecording(false);
        setIsProcessing(false);
      } catch (error) {
        console.log('Error stopping recording:', error);
      }
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const doAsyncStuff = async () => {
        if (Date.now() - lastPress >= 60000 && !isRecording) {
          const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
          const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");

          const { data: [{ id: conversationLinkId }] } = await deep.insert({
            type_id: conversationTypeLinkId,
            string: { data: { value: "New chat" } },
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });
          setNewConversationLinkId(conversationLinkId)
          console.log("flakeed7");
          setIsTimeEnded(true)
        }
      };
      doAsyncStuff();
    }, 60000);

    return () => clearTimeout(timeoutId);
  }, [lastPress, isRecording]);

  const ScreenChat = ({ newConversationLinkId }) => {
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

      const intervalId = setInterval(fetchMessages, 5000);

      return () => clearInterval(intervalId);
    }, []);

    return (
      <Box
        position="fixed"
        bottom={0}
        left={0}
        zIndex={1000}
        overflowY="scroll"
        height='500px'
        width='500px'
        bg={"grey"}
        p={3}
        borderRadius="20px"
      >
        <Box position="absolute" right={3} top={3}>
          <Button onClick={handleCloseChat}>X</Button>
        </Box>
        {messagesCount ?
          [
            <Text key="header" fontWeight="bold" fontSize="lg">Conversation with {messagesCount} messages:</Text>,
            ...messages.map((message, index) => (
              <Box key={index} mb={3} p={2} borderRadius="5px" bg={message?.link?.author?.[0]?.to_id === chatGptLinkId ? "blue.100" : "green.100"}>
                <Text borderBottom="1px solid" pb={2}>
                  {message?.link?.author?.[0]?.to_id === chatGptLinkId ? "You" : "Online consultant"}:
                </Text>
                <Text>{message?.link?.value?.value}</Text>
              </Box>
            ))
          ] : []
        }
      </Box>
    );
  }

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const ChatBubblesContainer = ({ children }) => {
    const containerStyle: CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    };

    return <div style={containerStyle}>{children}</div>;
  };

  const generateRandomChatBubbles = (count) => {
    const messages = [
      "Hello!",
      "How are you?",
      "What are you doing?",
      "Nice to meet you!",
      "Have a good day!",
    ];

    const sides = ["left", "right"];

    const bubbles = Array.from({ length: count }, (_, i) => (
      <ChatBubble
        key={i}
        text={getRandom(messages)}
        side={getRandom(sides)}
        top={Math.floor(Math.random() * (window.innerHeight - 150))}
        left={Math.floor(Math.random() * (window.innerWidth - 150))}
      />
    ));
    return bubbles;
  };

  const handleCloseChat = async () => {
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
    const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");

    const { data: [{ id: conversationLinkId }] } = await deep.insert({
      type_id: conversationTypeLinkId,
      string: { data: { value: "New chat" } },
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      },
    });
    setNewConversationLinkId(conversationLinkId)
    console.log("flakeed7");
    setIsChatClosed(true);
  };

  return (
    <Stack alignItems={'center'}>
      <NavBar />
      <Heading as={'h1'}>Tai</Heading>

      <Button
  style={{
    position: 'absolute',
    zIndex: 1000,
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    top: window.innerHeight / 2,
    backgroundColor: isProcessing ? '#505050' : (isRecording ? '#505050' : '#B0B0B0'),
  }}
  onClick={handleClick}
  isLoading={isProcessing}
>
  {isProcessing ? 'IN PROCESSING' : (isRecording ? 'STOP RECORDING' : 'START RECORDING')}
</Button>


      <ScreenChat newConversationLinkId={newConversationLinkId} />
      <ChatBubblesContainer>{generateRandomChatBubbles(10)}</ChatBubblesContainer>
    </Stack>
  );
}

export default function IndexPage() {
  return (
    <Page
      renderChildren={({ deep, deviceLinkId }) => (
        <Content />
      )}
    />
  );
}

function Pages() {
  return <Stack>
    {/* <Link as={NextLink} href="/audiorecord">
      Audiorecord
    </Link> */}

  </Stack>
}

export async function tryGetLink(deep, { selectData, delayMs, attemptsCount }) {
  let resultLink;
  for (let i = 0; i < attemptsCount; i++) {
    const {
      data: [link],
    } = await deep.select(selectData);

    if (link) {
      resultLink = link;
    }

    if (attemptsCount !== 0) {
      await sleep(delayMs);
    }
  }
  return { link: resultLink };
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}