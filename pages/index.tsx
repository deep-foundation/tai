import React, { useEffect, useState, useCallback, CSSProperties } from 'react';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import {
  Text,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
} from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { WithInitDeviceIfNotInitedAndSaveData } from '../components/device/withInitDeviceIfNotInitedAndSaveData';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import startAudioRec from '../imports/capacitor-voice-recorder/strart-recording';
import stopAudioRec from '../imports/capacitor-voice-recorder/stop-recording';
import ChatBubble from '../components/ChatBubble';
const delay = (time) => new Promise(res => setTimeout(() => res(null), time));

function Content() {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const deep = useDeep();

  const [sounds, setSounds] = useLocalStore("Sounds", []);
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useLocalStore("apikey", undefined);
  const [googleAuth, setGoogleAuth] = useLocalStore("googleAuth", undefined);
  let replyMessageLinkId;

  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  useEffect(() => {
    new Promise(async () => {
      if (deep.linkId !== 0) {
        return;
      }
      await deep.guest();
    })
  }, [deep])

  const generalInfoCard = (
    <Card>
      <CardHeader>
        <Heading as={'h2'}>General Info</Heading>
      </CardHeader>
      <CardBody>
        <Text suppressHydrationWarning>
          Authentication Link Id: {deep.linkId ?? ' '}
        </Text>
        <Text suppressHydrationWarning>
          Device Link Id: {deviceLinkId ?? ' '}
        </Text>
      </CardBody>
    </Card>
  );

  useEffect(() => {
    if (!isRecording) return;
    const useRecords = async () => {
      const PACKAGE_NAME = "@deep-foundation/capacitor-voice-recorder";
      const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
      const audioRecordsLinkId = await deep.id(PACKAGE_NAME, "AudioRecords");
      const soundTypeLinkId = await deep.id("@deep-foundation/sound", "Sound");
      const recordTypeLinkId = await deep.id(PACKAGE_NAME, "Record");
      const durationTypeLinkId = await deep.id(PACKAGE_NAME, "Duration");
      const startTimeTypeLinkId = await deep.id(PACKAGE_NAME, "StartTime");
      const endTimeTypeLinkId = await deep.id(PACKAGE_NAME, "EndTime");
      const mimetypeTypeLinkId = await deep.id("@deep-foundation/sound", "MIME/type");
      const formatTypeLinkId = await deep.id("@deep-foundation/sound", "Format");
      const transcribeTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcribe");
      const gcloudAuthKeyTypeLink = await deep.id("@deep-foundation/google-speech", "GoogleCloudAuthFile");
      const messageTypeLinkId = await deep.id('@deep-foundation/messaging', 'Message');
      const replyTypeLinkId = await deep.id('@deep-foundation/messaging', 'Reply');
      const transcriptionTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcription");
      const apiKeyTypeLinkId = await deep.id("@deep-foundation/openai", "ApiKey");
      const conversationTypeLinkId = await deep.id("@deep-foundation/chatgpt", "Conversation");
      const systemTypeLinkId = await deep.id("@deep-foundation/chatgpt", "System");
      const authorTypeLinkId = await deep.id('@deep-foundation/messaging', 'Author');
      const messagingTreeId = await deep.id('@deep-foundation/messaging', 'MessagingTree');

      console.log("before insert sound link", sounds);
      console.log("flakeed2");
      const { data: [{ id: soundLinkId }] } = await deep.insert(sounds.map((sound) => ({
        type_id: recordTypeLinkId,
        in: {
          data: [{
            type_id: containTypeLinkId,
            from_id: audioRecordsLinkId,
          }]
        },
        out: {
          data: [
            {
              type_id: containTypeLinkId,
              to: {
                data: {
                  type_id: soundTypeLinkId,
                  string: { data: { value: sound.record["recordDataBase64"] } },
                  out: {
                    data: [
                      {
                        type_id: containTypeLinkId,
                        to: {
                          data: {
                            type_id: mimetypeTypeLinkId,
                            string: { data: { value: sound.record["mimeType"] } },
                          }
                        }
                      },
                      {
                        type_id: containTypeLinkId,
                        to: {
                          data: {
                            type_id: formatTypeLinkId,
                            string: { data: { value: sound.record["mimeType"] === "audio/webm;codecs=opus" ? "webm" : "aac" } },
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            {
              type_id: containTypeLinkId,
              to: {
                data: {
                  type_id: durationTypeLinkId,
                  number: { data: { value: sound.record["msDuration"] } },
                }
              }
            },
            {
              type_id: containTypeLinkId,
              to: {
                data: {
                  type_id: startTimeTypeLinkId,
                  string: { data: { value: sound.startTime } },
                }
              }
            },
            {
              type_id: containTypeLinkId,
              to: {
                data: {
                  type_id: endTimeTypeLinkId,
                  string: { data: { value: sound.endTime } },
                }
              }
            }]
        }
      })));
      console.log("flakeed1");
      console.log("soundLinkId", soundLinkId)

      const { data: [isGcloudAuthKeyLinkId] } = await deep.select({
        type_id: gcloudAuthKeyTypeLink,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });

      console.log("googleauth", googleAuth);
      if (!isGcloudAuthKeyLinkId) {
        const parsedGoogleAuth = JSON.parse(googleAuth);
        await deep.insert({
          type_id: gcloudAuthKeyTypeLink,
          object: { data: { value: parsedGoogleAuth } },
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
              }
            ]
          }
        })
      }
      console.log("flakeed3");

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

      await delay(8000);
      const { data: [transcribedTextLinkId] } = await deep.select({
        type_id: transcriptionTypeLinkId,
        in: {
          type_id: containTypeLinkId,
          from_id: soundLinkId
        },
      });
      console.log("transcribedTextLinkId", transcribedTextLinkId)

      const { data: [isApiKeyLinkId] } = await deep.select({
        type_id: apiKeyTypeLinkId,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });

      console.log("flakeed5");
      if (!isApiKeyLinkId) {
        await deep.insert({
          type_id: apiKeyTypeLinkId,
          string: { data: { value: apiKey } },
          in: {
            data: [
              {
                type_id: await deep.id('@deep-foundation/core', "Contain"),
                from_id: deep.linkId,
              }]
          }
        });
      }

      console.log("flakeed6");
      const { data: [isConversationLinkId] } = await deep.select({
        type_id: conversationTypeLinkId,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });
      if (isConversationLinkId) {
        const { data: replyLinks } = await deep.select({
          type_id: replyTypeLinkId,
        });

        const replyLink = replyLinks.sort((a, b) => b.from_id - a.from_id);
        console.log("replyLinks", replyLinks)

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
          }`
        })

        const messageLinks = conversationLink
          .map(item => item.parent)
          .filter(link => link && link.type_id === messageTypeLinkId);

        const authorLinks = messageLinks
          .filter(messageLink => messageLink.author && messageLink.author[0])
          .map(messageLink => messageLink.author[0].from_id);


        console.log("messageLinks", messageLinks);
        console.log("authorLinks", authorLinks);

        console.log("trascribedTextLinkId", transcribedTextLinkId.value?.value)

        const { data: [{ id: messageLinkId }] } = await deep.insert({
          type_id: messageTypeLinkId,
          string: { data: { value: transcribedTextLinkId.value?.value } },
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
          to_id: authorLinks[authorLinks.length - 1],
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            },
          },
        });
        replyMessageLinkId = replyToMessageLinkId;
      }

      if (!isConversationLinkId) {
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
        console.log("flakeed7");

        const { data: [{ id: systemMessageLinkId }] } = await deep.insert({
          type_id: messageTypeLinkId,
          string: { data: { value: "Ты сегодня продавец, вот твой список товара: цибуля. майонез, картошка, огурцы, клубника, малина, смородина" } },
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
          string: { data: { value: transcribedTextLinkId.value?.value } },
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
      };
      console.log("flakeed8");
      setSounds([]);
    };

    if (sounds.length > 0) useRecords();
  }, [sounds, isRecording]);

  useEffect(() => {
    if (!isRecording) return;

    let loop = true;
    const startRecordingCycle = async (duration) => {
      for (; isRecording && loop;) {
        await startAudioRec(deep);
        const startTime = new Date().toLocaleDateString();
        await delay(duration);
        const record = await stopAudioRec(deep);
        const endTime = new Date().toLocaleDateString();
        console.log({ record });
        setSounds([{ record, startTime, endTime }]);
      }
    };

    startRecordingCycle(5000);
    return function stopCycle() {
      loop = false;
    };
  }, [isRecording]);

  const ScreenChat = ({ replyToMessageLinkId }) => {
    const [messages, setMessages] = useState([]);
    const [messagesCount, setMessagesCount] = useState(0);
    let chatGptLinkId;
    async () => { chatGptLinkId = await deep.id('@deep-foundation/chatgpt', 'ChatGPT') }

    useEffect(() => {
      (async () => {
        const messagingTreeId = await deep.id("@deep-foundation/messaging", "MessagingTree");
        const messageTypeLinkId = await deep.id("@deep-foundation/messaging", "Message");
        const authorTypeLinkId = await deep.id("@deep-foundation/messaging", "Author");

        const result = await deep.select({
          tree_id: { _eq: messagingTreeId },
          link: { type_id: { _eq: messageTypeLinkId } },
          root_id: { _eq: replyMessageLinkId },
          // @ts-ignore
          self: { _eq: true },
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
              author: out (where: { type_id: { _eq: ${authorTypeLinkId} } }) { 
                id
                from_id
                type_id
                to_id
              }
            }`
        });

        setMessages(result?.data);
        setMessagesCount(result?.data.length);
      })();
    }, [replyToMessageLinkId]);

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
        {messagesCount ?
          [
            <Text key="header" fontWeight="bold" fontSize="lg">Conversation with {messagesCount} messages:</Text>,
            ...messages.map((message, index) => (
              <Box key={index} mb={3} p={2} borderRadius="5px" bg={message?.link?.author?.[0]?.to_id === chatGptLinkId ? "blue.100" : "green.100"}>
                <Text borderBottom="1px solid" pb={2}>
                  {index === 0 ? "System" : message?.link?.author?.[0]?.to_id === chatGptLinkId ? "You" : "Online consultant"}:
                </Text>
                <Text>{message?.link?.value?.value}</Text>
              </Box>
            ))
          ] : []
        }
      </Box>
    );
  }

  const handleButtonClick = useCallback(() => {
      setIsRecording((prevIsRecording) => !prevIsRecording);
  }, []);

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

  return (
    <Stack alignItems={'center'}>
      <NavBar />
      <Heading as={'h1'}>Tai</Heading>
      {generalInfoCard}
      {
        <>
          <WithInitDeviceIfNotInitedAndSaveData deep={deep} deviceLinkId={deviceLinkId} setDeviceLinkId={setDeviceLinkId} />
          {
            Boolean(deviceLinkId) ? (
              <>
                <Pages />
              </>
            ) : (
              <Text>Initializing the device...</Text>
            )
          }
        </>
      }
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
        }}
        onClick={handleButtonClick}
      >
        {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
      </Button>
      <ScreenChat replyToMessageLinkId={replyMessageLinkId} />
      <ChatBubblesContainer>{generateRandomChatBubbles(10)}</ChatBubblesContainer>
    </Stack>
  );
}

export default function IndexPage() {
  return <Page>
    <Content />
  </Page>
}

function Pages() {
  return <Stack>
    {/* <Link as={NextLink} href="/audiorecord">
      Audiorecord
    </Link> */}

  </Stack>
}