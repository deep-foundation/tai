import React, { useEffect, useState, useCallback,CSSProperties } from 'react';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import {

  Text,
  Link,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Switch,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';
import { Provider } from '../imports/provider';
import {

  useDeep,
  useDeepSubscription,
} from '@deep-foundation/deeplinks/imports/client';
import { DEEP_MEMO_PACKAGE_NAME as DEEP_MEMO_PACKAGE_NAME } from '../imports/deep-memo/package-name';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { WithSubscriptions } from '../components/deep-memo/with-subscriptions';
import { useIsPackageInstalled } from '../imports/use-is-package-installed';
import { WithInitDeviceIfNotInitedAndSaveData } from '../components/device/withInitDeviceIfNotInitedAndSaveData';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';

import startAudioRec from '../imports/capacitor-voice-recorder/strart-recording';
import stopAudioRec from '../imports/capacitor-voice-recorder/stop-recording';
import getAudioRecPermission from '../imports/capacitor-voice-recorder/get-permission';
import installPackage from '../imports/capacitor-voice-recorder/install-package';
import uploadRecords from '../imports/capacitor-voice-recorder/upload-records';
import ChatBubble from '../components/ChatBubble';

const delay = (time) => new Promise(res => setTimeout(() => res(null), time));

function Content() {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const deep = useDeep();
  const [recording, setRecording] = useState(false);
  const [sounds, setSounds] = useLocalStore(CapacitorStoreKeys[CapacitorStoreKeys.Sounds], []);
  const [records, setRecords] = useState([]);

  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    CapacitorStoreKeys[CapacitorStoreKeys.DeviceLinkId],
    undefined
  );

  const { isPackageInstalled: isMemoPackageInstalled } = useIsPackageInstalled({ packageName: DEEP_MEMO_PACKAGE_NAME, shouldIgnoreResultWhenLoading: true, onError: ({ error }) => { console.error(error.message) } });
  useEffect(() => {
    console.log({ isMemoPackageInstalled })
  }, [isMemoPackageInstalled])

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
    const useRecords = async () => {
      await uploadRecords(deep, deviceLinkId, sounds);
      setSounds([]);
    }
    if (sounds.length > 0) useRecords();
  }, [sounds])

  const toggleRecording = async () => {
    if (!recording) {
      await startAudioRec(deep);
    } else {
      const record = await stopAudioRec(deep);
      setSounds([...sounds, record]);
    }
    setRecording((prevRecording) => !prevRecording);
  };

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
        top={Math.floor(Math.random() * (window.innerHeight - 150))} // Увеличьте размер диапазона
        left={Math.floor(Math.random() * (window.innerWidth - 150))} // Увеличьте размер диапазона
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
                  <WithSubscriptions deep={deep} />
                  <Pages />
                </>
              ) : (
                <Text>Initializing the device...</Text>
              )
            }
          </>
       
      }
      <Button style={{ position: 'relative', zIndex: 1000 }} onClick={async () => await installPackage(deviceLinkId)}>
      INSTALL PACKAGE
    </Button>
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
    top:window.innerHeight/2,
  }}
  onClick={toggleRecording}
>
        {recording ? 'STOP RECORDING' : 'START RECORDING'}
      </Button>
        <Button style={{ position: 'relative', zIndex: 1000 }} onClick={async () => await getAudioRecPermission(deep, deviceLinkId)}>
      GET RECORDING PERMISSION
    </Button>
    {records?.map((r) => <audio key={r.id} controls src={`data:${r.mimetype};base64,${r.sound}`} />)}
<ChatBubblesContainer>{generateRandomChatBubbles(10)}</ChatBubblesContainer>
      
    </Stack>
  );
}

export default function IndexPage() {
  return <Page>
    <Content />
  </Page>
}

function MemoPackageIsNotInstalledAlert() {
  // return <Text>Package is not installed</Text>
  return <Alert status="error">
    <AlertIcon />
    <AlertTitle>Install {DEEP_MEMO_PACKAGE_NAME.toString()} to proceed!</AlertTitle>
    <AlertDescription>
      {DEEP_MEMO_PACKAGE_NAME.toString()} package contains all the packages required to
      use this application. You can install it by using npm-packager-ui
      located in deepcase or any other posibble way.
    </AlertDescription>
  </Alert>
}

function Pages() {
  return <Stack>
    {/* <Link as={NextLink} href="/audiorecord">
      Audiorecord
    </Link> */}

  </Stack>
}

