import {
  Box,
  Heading,
  VStack,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import {
  DeepClient,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
import { useLocalStore } from '@deep-foundation/store/local';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BackgroundProbableQuestions } from '../components/background-probable-questions';
import { Page } from '../components/page';
import { RecordButton } from '../components/record-button';
import createContainer from '../imports/capacitor-voice-recorder/create-container';
import stopRecording from '../imports/capacitor-voice-recorder/stop-recording';
import startRecording from '../imports/capacitor-voice-recorder/strart-recording';
import uploadRecords from '../imports/capacitor-voice-recorder/upload-records';
import { MemoizedItemsModal } from '../components/product-bin/items-modal';
const assert = require('assert');
// import { Switcher } from '../components/chat/switcher';
import { motion, useCycle } from 'framer-motion';
import { Tab } from '../components/chat/switcher';
import { ScreenChat } from '../components/chat/screen-chat';

const MotionBox = motion(Box);

export const Content = React.memo(() => {
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
  const [shoppingCartId, setShoppingCartId] = useState(0);
  const [getItemsData, setGetItemsData] = useState<any[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, nextState] = useCycle("voice", "keyboard");

  const startTime = useRef('');
  const path = process.env.NEXT_PUBLIC_GQL_PATH;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const googleAuth = process.env.NEXT_PUBLIC_GOOGLE_AUTH || '';
  const systemMsg = process.env.NEXT_PUBLIC_SYSTEM_MSG;
  const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
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
    const initializeData = async () => {
      const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
      const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");
      const shoppingCartTypeLinkId = await deep.id("@flakeed/loyverse", "ShoppingCart");
      const getItemsTypeLinkId = await deep.id("@flakeed/loyverse", "GetItems");
      let currentConversationId = newConversationLinkId;

      if (currentConversationId === 0 || !currentConversationId) {
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
        setNewConversationLinkId(conversationLinkId);
        currentConversationId = conversationLinkId;
      }

      const { data: checkConversationLink } = await deep.select({
        id: currentConversationId,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        }
      }, {
        returning: `
                id
                value
                shoppingCart: in(where: { type_id: { _eq: ${shoppingCartTypeLinkId} } }) {
                    id
                }
            `
      });
      if (!checkConversationLink || !checkConversationLink[0] || !checkConversationLink[0].shoppingCart || checkConversationLink[0].shoppingCart.length === 0) {
        const { data: insertedShoppingCart } = await deep.insert({
          type_id: shoppingCartTypeLinkId,
          from_id: currentConversationId,
          to_id: currentConversationId,
          object: { data: { value: [] } }
        });
        setShoppingCartId(insertedShoppingCart[0].id);
      } else {
        setShoppingCartId(checkConversationLink[0].shoppingCart[0].id);
      }
      const { data: checkGetItemsLink } = await deep.select({
        type_id: getItemsTypeLinkId,
        order_by: { id: "desc" }
      });

      try {
        if (!checkGetItemsLink || checkGetItemsLink.length === 0) {
          const { data: insertedGetItemsLink } = await deep.insert({
            type_id: getItemsTypeLinkId,
            in: {
              data: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              },
            },
          });

          const processedData = await fetchAssociatedLinks(deep, insertedGetItemsLink[0].id);
          setGetItemsData(processedData);
        } else {
          const processedData = await fetchAssociatedLinks(deep, checkGetItemsLink[0].id);
          setGetItemsData(processedData);
        }
      } catch (error) {
        console.error("An error occurred:", error.message);
      }
    };

    initializeData();
  }, [newConversationLinkId]);

  useEffect(() => {
    (async () => {
      const apiKeyTypeLinkId = await deep.id("@deep-foundation/openai", "ApiKey");
      const authTokenTypeLinkId = await deep.id("@flakeed/loyverse", "AuthToken");
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

      const { data: checkAuthTokenLink } = await deep.select({
        type_id: authTokenTypeLinkId,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });

      if (!checkAuthTokenLink || checkAuthTokenLink.length === 0) {
        const { data: [{ id: authTokenLink }] } = await deep.insert({
          type_id: authTokenTypeLinkId,
          string: { data: { value: authToken } },
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
        const systemTypeLinkId = await deep.id("@deep-foundation/chatgpt", "System");
        const messagingTreeId = await deep.id('@deep-foundation/messaging', 'MessagingTree');
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

        const { data: messagesLinkId } = await deep.select({
          tree_id: { _eq: messagingTreeId },
          link: { type_id: { _eq: messageTypeLinkId } },
          root_id: { _eq: newConversationLinkId },
          // @ts-ignore
          self: { _eq: true }
        }, {
          table: 'tree',
          variables: { order_by: { depth: "desc" } },
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
              replies: out (where: { type_id: { _eq: ${replyTypeLinkId} } }) {
                id
                type_id
                from_id
                to_id
                value
              }
            }
          `
        });

        const { data: checkConversationLink } = await deep.select({
          id: newConversationLinkId,
          in: {
            type_id: containTypeLinkId,
            from_id: deep.linkId,
          }
        }, {
          returning: `
            id
            value
            systemMessages: in(where: { type_id: { _eq: ${systemTypeLinkId} } }) {
              id
              type_id
              from_id
              to_id
              value
            }
          `
        });

        if (checkConversationLink[0].systemMessages.length === 0) {

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
        }

        if (checkConversationLink[0].systemMessages.length > 0) {
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
            setIsTimeEnded(false)
          } else {
            const assistantMessageLinkId = messagesLinkId[0].link.id
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
              to_id: assistantMessageLinkId,
              in: {
                data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
                },
              },
            });
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
        if (Date.now() - lastPress >= 120000 && !isRecording && !isOpen) {
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
    }, 120000);
  
    return () => clearTimeout(timeoutId);
  }, [lastPress, isRecording, isOpen]);

  const handleCloseChat = useMemo(() => {
    return () => {
      (async () => {
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
        setNewConversationLinkId(conversationLinkId);
        setIsChatClosed(true);
      })();
    };
  }, [deep]);

  const handleAddToCart = async (itemId) => {
    const addToCartTypeLinkId = await deep.id("@flakeed/loyverse", "AddToCart");
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
    const { data: addedToCartLink } = await deep.insert({
      type_id: addToCartTypeLinkId,
      from_id: itemId,
      to_id: shoppingCartId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        }
      },
    });
  }

  const items = getItemsData.map(item => ({
    // id: item.id,
    linkId: item.linkId,
    // handle: item.handle,
    itemName: item.item_name,
    // description: item.description,
    imageUrl: item.image_url,
    price: item.variants?.[0]?.default_price || 0,//price in $ or ฿
  }));

  return (<VStack position='relative' width='100vw' height='100vh'>
      {!isOpen && (
        <Button
          onClick={isOpen ? onClose : onOpen}
          size='sm'
          sx={{
            position: 'fixed',
            right: '1rem',
            top: '1rem',
            background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            _hover: {
              background: 'linear-gradient(45deg, #81C784, #C5E1A5)',
              transform: 'scale(1.05)',
            },
          }}
          // onMouseOver={(e) => {
          //   e.currentTarget.style.background = 'linear-gradient(45deg, #81C784, #C5E1A5)';
          //   e.currentTarget.style.transform = 'scale(1.05)';
          // }}
          // onMouseOut={(e) => {
          //   e.currentTarget.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
          //   e.currentTarget.style.transform = 'scale(1)';
          // }}
        >
          Products
        </Button>
      )}

      <MemoizedItemsModal
        deep={deep}
        addToCart={handleAddToCart}
        items={items}
        isOpen={isOpen}
        onClose={onClose}
        chatNumber={newConversationLinkId}
      />
      <BackgroundProbableQuestions />
      <Box sx={{ color: 'antiquewhite', zIndex: 1 }}>
        <Heading as='h1' sx={{ color: 'antiquewhite', zIndex: 1 }}>Diamond</Heading>
      </Box>
      <Tab 
        isProcessing={isProcessing} 
        isRecording={isRecording} 
        handleClick={handleClick} 
        state={state} 
        stateVoice={state}
        onClickKeyboard={() => nextState()} 
      />
      <ScreenChat deep={deep} newConversationLinkId={newConversationLinkId} handleCloseChat={handleCloseChat} openInput={state === 'keyboard'} />

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

async function fetchAssociatedLinks(deep, linkId) {
  const itemTypeLinkId = await deep.id("@flakeed/loyverse", "Item");

  const { data: associatedLinks } = await deep.select({
    type_id: itemTypeLinkId,
    from_id: linkId,
  }, {
    returning: `
          id
          value
      `
  });
  if (!associatedLinks || associatedLinks.length === 0) {
    throw new Error("Error: The store has no items.");
  }

  return associatedLinks.map(link => {
    const itemData = typeof link.value.value === 'string' ? JSON.parse(link.value.value) : link.value.value;
    return {
      ...itemData,
      linkId: link.id
    };
  });
}

