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
  const [shoppingCartId, setShoppingCartId] = useState(null);

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
    const initializeData = async () => {
        const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
        const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");
        const shoppingCartTypeLinkId = await deep.id("@flakeed/loyverse", "ShoppingCart");

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
            });
            setShoppingCartId(insertedShoppingCart[0].id);
        } else {
            setShoppingCartId(checkConversationLink[0].shoppingCart[0].id);
        }
        console.log("shcart",shoppingCartId)
        console.log("conv",newConversationLinkId)
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
        console.log("btn conv",newConversationLinkId)
        console.log("btn sh",shoppingCartId)
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
        const shoppingCartTypeLinkId = await deep.id("@flakeed/loyverse", "ShoppingCart");
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
            shoppingCart: in(where: { type_id: { _eq: ${shoppingCartTypeLinkId} } }) {
              id
              type_id
              from_id
              to_id
              value
            }
          `
        });
        console.log("checkConversationLink",checkConversationLink)

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
          replyMessageLinkId = replyToMessageLinkId;
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

            replyMessageLinkId = replyToMessageLinkId;
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
        if (Date.now() - lastPress >= 460000 && !isRecording) {
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
    }, 460000);

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
    {
      "id": "362c1cb7-d429-437f-8f99-40b66b6db99e",
      "handle": "dfdsfdsa",
      "reference_id": null,
      "item_name": "dfdsfdsa",
      "description": "<p>GDFDSGFDSGFDS</p>",
      "track_stock": false,
      "sold_by_weight": false,
      "is_composite": false,
      "use_production": false,
      "category_id": "2471e8be-bdc6-4d84-83c1-7ec88f908309",
      "components": [],
      "primary_supplier_id": null,
      "tax_ids": [],
      "modifier_ids": [],
      "form": "SQUARE",
      "color": "GREY",
      "image_url": "https://api.loyverse.com/image/362c1cb7-d429-437f-8f99-40b66b6db99e",
      "option1_name": null,
      "option2_name": null,
      "option3_name": null,
      "created_at": "2023-08-05T23:05:56.000Z",
      "updated_at": "2023-08-05T23:05:56.000Z",
      "deleted_at": null,
      "variants": [
        {
          "variant_id": "5126b0f8-39bf-4e42-ba12-4b72bfaf3c0d",
          "item_id": "362c1cb7-d429-437f-8f99-40b66b6db99e",
          "sku": "10000",
          "reference_variant_id": null,
          "option1_value": null,
          "option2_value": null,
          "option3_value": null,
          "barcode": null,
          "cost": 123,
          "purchase_cost": null,
          "default_pricing_type": "FIXED",
          "default_price": 123,
          "stores": [
            {
              "store_id": "242e0721-8b4b-423f-89b8-9200f23e8722",
              "pricing_type": "FIXED",
              "price": 123,
              "available_for_sale": true,
              "optimal_stock": null,
              "low_stock": null
            }
          ],
          "created_at": "2023-08-05T23:05:56.000Z",
          "updated_at": "2023-08-05T23:05:56.000Z",
          "deleted_at": null
        }
      ]
    },
    {
      "id": "362c1cb7-d429-437f-8f99-40b66b6db99e",
      "handle": "dfdsfdsa",
      "reference_id": null,
      "item_name": "dfdsfdsa",
      "description": "<p>GDFDSGFDSGFDS</p>",
      "track_stock": false,
      "sold_by_weight": false,
      "is_composite": false,
      "use_production": false,
      "category_id": "2471e8be-bdc6-4d84-83c1-7ec88f908309",
      "components": [],
      "primary_supplier_id": null,
      "tax_ids": [],
      "modifier_ids": [],
      "form": "SQUARE",
      "color": "GREY",
      "image_url": "https://api.loyverse.com/image/362c1cb7-d429-437f-8f99-40b66b6db99e",
      "option1_name": null,
      "option2_name": null,
      "option3_name": null,
      "created_at": "2023-08-05T23:05:56.000Z",
      "updated_at": "2023-08-05T23:05:56.000Z",
      "deleted_at": null,
      "variants": [
        {
          "variant_id": "5126b0f8-39bf-4e42-ba12-4b72bfaf3c0d",
          "item_id": "362c1cb7-d429-437f-8f99-40b66b6db99e",
          "sku": "10000",
          "reference_variant_id": null,
          "option1_value": null,
          "option2_value": null,
          "option3_value": null,
          "barcode": null,
          "cost": 123,
          "purchase_cost": null,
          "default_pricing_type": "FIXED",
          "default_price": 123,
          "stores": [
            {
              "store_id": "242e0721-8b4b-423f-89b8-9200f23e8722",
              "pricing_type": "FIXED",
              "price": 123,
              "available_for_sale": true,
              "optimal_stock": null,
              "low_stock": null
            }
          ],
          "created_at": "2023-08-05T23:05:56.000Z",
          "updated_at": "2023-08-05T23:05:56.000Z",
          "deleted_at": null
        }
      ]
    },
    {
      "id": "067a4a41-20a9-4234-86b7-aef5304c0ac0",
      "handle": "gfdgsdf",
      "reference_id": null,
      "item_name": "GFDGSDF",
      "description": "<p>GDFGFDS</p>",
      "track_stock": false,
      "sold_by_weight": false,
      "is_composite": false,
      "use_production": false,
      "category_id": "2471e8be-bdc6-4d84-83c1-7ec88f908309",
      "components": [],
      "primary_supplier_id": null,
      "tax_ids": [],
      "modifier_ids": [],
      "form": "OCTAGON",
      "color": "ORANGE",
      "image_url": null,
      "option1_name": null,
      "option2_name": null,
      "option3_name": null,
      "created_at": "2023-08-05T23:06:15.000Z",
      "updated_at": "2023-08-05T23:06:15.000Z",
      "deleted_at": null,
      "variants": [
        {
          "variant_id": "590b5410-a055-47a1-8a07-74edbea578f0",
          "item_id": "067a4a41-20a9-4234-86b7-aef5304c0ac0",
          "sku": "10001",
          "reference_variant_id": null,
          "option1_value": null,
          "option2_value": null,
          "option3_value": null,
          "barcode": null,
          "cost": 0,
          "purchase_cost": null,
          "default_pricing_type": "FIXED",
          "default_price": 412,
          "stores": [
            {
              "store_id": "242e0721-8b4b-423f-89b8-9200f23e8722",
              "pricing_type": "FIXED",
              "price": 412,
              "available_for_sale": true,
              "optimal_stock": null,
              "low_stock": null
            }
          ],
          "created_at": "2023-08-05T23:06:15.000Z",
          "updated_at": "2023-08-05T23:06:15.000Z",
          "deleted_at": null
        }
      ]
    },
    {
      "id": "067a4a41-20a9-4234-86b7-aef5304c0ac0",
      "handle": "gfdgsdf",
      "reference_id": null,
      "item_name": "GFDGSDF",
      "description": "<p>GDFGFDS</p>",
      "track_stock": false,
      "sold_by_weight": false,
      "is_composite": false,
      "use_production": false,
      "category_id": "2471e8be-bdc6-4d84-83c1-7ec88f908309",
      "components": [],
      "primary_supplier_id": null,
      "tax_ids": [],
      "modifier_ids": [],
      "form": "OCTAGON",
      "color": "ORANGE",
      "image_url": null,
      "option1_name": null,
      "option2_name": null,
      "option3_name": null,
      "created_at": "2023-08-05T23:06:15.000Z",
      "updated_at": "2023-08-05T23:06:15.000Z",
      "deleted_at": null,
      "variants": [
        {
          "variant_id": "590b5410-a055-47a1-8a07-74edbea578f0",
          "item_id": "067a4a41-20a9-4234-86b7-aef5304c0ac0",
          "sku": "10001",
          "reference_variant_id": null,
          "option1_value": null,
          "option2_value": null,
          "option3_value": null,
          "barcode": null,
          "cost": 0,
          "purchase_cost": null,
          "default_pricing_type": "FIXED",
          "default_price": 412,
          "stores": [
            {
              "store_id": "242e0721-8b4b-423f-89b8-9200f23e8722",
              "pricing_type": "FIXED",
              "price": 412,
              "available_for_sale": true,
              "optimal_stock": null,
              "low_stock": null
            }
          ],
          "created_at": "2023-08-05T23:06:15.000Z",
          "updated_at": "2023-08-05T23:06:15.000Z",
          "deleted_at": null
        }
      ]
    },
    {
      "id": "067a4a41-20a9-4234-86b7-aef5304c0ac0",
      "handle": "gfdgsdf",
      "reference_id": null,
      "item_name": "GFDGSDF",
      "description": "<p>GDFGFDS</p>",
      "track_stock": false,
      "sold_by_weight": false,
      "is_composite": false,
      "use_production": false,
      "category_id": "2471e8be-bdc6-4d84-83c1-7ec88f908309",
      "components": [],
      "primary_supplier_id": null,
      "tax_ids": [],
      "modifier_ids": [],
      "form": "OCTAGON",
      "color": "ORANGE",
      "image_url": null,
      "option1_name": null,
      "option2_name": null,
      "option3_name": null,
      "created_at": "2023-08-05T23:06:15.000Z",
      "updated_at": "2023-08-05T23:06:15.000Z",
      "deleted_at": null,
      "variants": [
        {
          "variant_id": "590b5410-a055-47a1-8a07-74edbea578f0",
          "item_id": "067a4a41-20a9-4234-86b7-aef5304c0ac0",
          "sku": "10001",
          "reference_variant_id": null,
          "option1_value": null,
          "option2_value": null,
          "option3_value": null,
          "barcode": null,
          "cost": 0,
          "purchase_cost": null,
          "default_pricing_type": "FIXED",
          "default_price": 412,
          "stores": [
            {
              "store_id": "242e0721-8b4b-423f-89b8-9200f23e8722",
              "pricing_type": "FIXED",
              "price": 412,
              "available_for_sale": true,
              "optimal_stock": null,
              "low_stock": null
            }
          ],
          "created_at": "2023-08-05T23:06:15.000Z",
          "updated_at": "2023-08-05T23:06:15.000Z",
          "deleted_at": null
        }
      ]
    }
  ];

  const customStyles = {
    content: {
      height: '65vh',
      width: '70%',
      overflowY: 'auto',
      borderRadius: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: 'none',
      padding: '20px',
      backgroundColor: '#f4f4f4',
      zIndex: 1002,
      margin: '40px auto',
      position: 'relative',
      top: '0',
    },
  };


  const addToCart = () => {

  }

  const items = rawItems.map(item => ({
    id: item.id,
    handle: item.handle,
    itemName: item.item_name,
    description: item.description,
    imageUrl: item.image_url,
    price: item.variants[0]?.default_price || 0,
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
    <Box sx={{ color: 'antiquewhite', zIndex: 1 }}>
      <Heading as='h1' sx={{ color: 'antiquewhite', zIndex: 1 }}>Diamond</Heading>
    </Box>
    <RecordButton isProcessing={isProcessing} isRecording={isRecording} handleClick={handleClick} />
    <ScreenChat deep={deep} newConversationLinkId={newConversationLinkId} handleCloseChat={handleCloseChat} />

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