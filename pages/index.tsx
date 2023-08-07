import {
  Box,
  Heading,
  VStack,
  Button
} from '@chakra-ui/react';
import {
  DeepClient,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
import { useLocalStore } from '@deep-foundation/store/local';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import React, { useEffect, useRef, useState } from 'react';
import { BackgroundProbableQuestions } from '../components/background-probable-questions';
import { ScreenChat } from '../components/chat/screen-chat';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import { RecordButton } from '../components/record-button';
import createContainer from '../imports/capacitor-voice-recorder/create-container';
import stopRecording from '../imports/capacitor-voice-recorder/stop-recording';
import startRecording from '../imports/capacitor-voice-recorder/strart-recording';
import uploadRecords from '../imports/capacitor-voice-recorder/upload-records';
import ItemsModal from '../components/items-modal';
const assert = require('assert');


export const Content = React.memo<any>(() => {
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
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);

  const openItemsModal = () => {
      setIsItemsModalOpen(true);
  };

  const closeItemsModal = () => {
      setIsItemsModalOpen(false);
  };
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
        const soundLinkId = await uploadRecords(deep, containerLinkId, [{ record, startTime, endTime }]);

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

        const { data: checkConversationLink } = await deep.select({
          type_id: conversationTypeLinkId,
          in: {
            type_id: containTypeLinkId,
            from_id: deep.linkId,
          },
        });

        if (checkConversationLink && checkConversationLink.length > 0) {
        const sortedData = checkConversationLink.sort((a, b) => b.id - a.id);
        setNewConversationLinkId(sortedData[0].id)      
        }

        if (!checkConversationLink || checkConversationLink.length === 0 || !newConversationLinkId || newConversationLinkId === 0) {
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
          setNewConversationLinkId(sortedData[0].id)
        }

        if (newConversationLinkId && newConversationLinkId !== 0) {
          if (isTimeEnded || isChatClosed) {

            setIsChatClosed(false)


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
          }
        }

        setLastPress(Date.now());
        setIsRecording(false);
        setIsProcessing(false);
      } catch (error) {
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
          setIsTimeEnded(true)
        }
      };
      doAsyncStuff();
    }, 60000);

    return () => clearTimeout(timeoutId);
  }, [lastPress, isRecording]);

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
    setIsChatClosed(true);
  };

  const rawItems = [

  ];
  
  const customStyles = {

  };
  
  
  const addToCart= () =>{

  }

  const items = rawItems.map(item => ({

  }));
  

  return (<VStack position='relative' width='100vw' height='100vh'>
{!isItemsModalOpen && (
  <button
    onClick={openItemsModal}
    style={{
        position: 'fixed',
        right: '20px',
        top: '20px',
        background: 'linear-gradient(45deg, #4CAF50, #8BC34A)', 
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px 30px', 
        border: '2px solid #388E3C', 
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
        transition: '0.5s', 
        zIndex: 1
    }}
    onMouseOver={(e) => {
        e.currentTarget.style.background = 'linear-gradient(45deg, #81C784, #C5E1A5)'; 
        e.currentTarget.style.transform = 'scale(1.05)';
    }}
    onMouseOut={(e) => {
        e.currentTarget.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)'; 
        e.currentTarget.style.transform = 'scale(1)'; 
    }}
>
    Products
  </button>
)}

      <ItemsModal
                isOpen={isItemsModalOpen}
                onRequestClose={closeItemsModal}
                addToCart={addToCart}
                items={items}
                style={customStyles}
                chatNumber={newConversationLinkId}
            />
      <BackgroundProbableQuestions />
      <Box sx={{color: 'antiquewhite', zIndex: 1}}>
        <Heading as='h1' sx={{color: 'antiquewhite', zIndex: 1}}>Diamond</Heading>
      </Box>
      <RecordButton isProcessing={isProcessing} isRecording={isRecording} handleClick={handleClick} />
      <ScreenChat deep={deep} newConversationLinkId={newConversationLinkId} handleCloseChat={handleCloseChat}/>
      
    </VStack>
  );
})

export default function IndexPage() {
  return (
    <Page
      renderChildren={({ deep, deviceLinkId }) => (
        <Content />
      )}
    />
  );
}


export async function tryGetLink(deep, { selectData, delayMs, attemptsCount }) {
  let resultLink;
  for (let i = 0; i < attemptsCount; i++) {
    const {
      data: [link],
    } = await deep.select(selectData);

    if (link) {
      resultLink = link;
      break;
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