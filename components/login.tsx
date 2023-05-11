import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useState } from "react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { StoreProvider } from './store-provider';
import { useLocalStore } from "@deep-foundation/store/local";
import getAudioRecPermission from '../imports/capacitor-voice-recorder/get-permission';
import { useIsPackageInstalled } from '../imports/use-is-package-installed';
export function Setup(arg: { 
  onAuthorize: (arg: { gqlPath: string, token: string }) => void,
  onSubmit: (arg: { apiKey: string, googleAuth: string }) => void 
}) {
    // const defaultGqlPath = "3006-deepfoundation-dev-mst16p4n7jz.ws-eu96b.gitpod.io/gql";
  // const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4iLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzc4In0sImlhdCI6MTY4MzQ4MDUyMH0.rp9HzhnRMEA-hKf_2aReoJvBI6aSlItNSQ-cop58w5U";
  const deep = useDeep();
  const [gqlPath, setGqlPath] = useLocalStore("gqlPath", undefined);
  const [token, setToken] = useLocalStore("token", undefined);
  const [apiKey, setApiKey] = useLocalStore("apikey", undefined);
  const [googleAuth, setGoogleAuth] = useLocalStore("googleAuth", undefined);
  const [isRecordPackageInstalledPressed, setIsRecordPackageInstalledPressed] = useState(false);
  const [isChatGPTPackageInstalledPressed, setIsChatGPTPackageInstalledPressed] = useState(false);
  const [isSpeechPackageInstalledPressed, setIsSpeechPackageInstalledPressed] = useState(false);
  const [isGetPermissionPressed, setIsGetPermissionPressed] = useState(false);
  const [isSendDataPressed, setIsSendDataPressed] = useState(false);
  let isRecordPackageInstalled;
  let isChatGPTPackageInstalled;
  let isSpeechPackageInstalled;
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  const installRecordPackage = async () => {
    try {
      isRecordPackageInstalled = useIsPackageInstalled({
        packageName: "@deep-foundation/capacitor-voice-recorder",
        shouldIgnoreResultWhenLoading: true,
        onError: ({ error }) => { console.error(error.message) }
      });
    } catch (error) {
      console.error('Error useIsPackageInstalled for @deep-foundation/capacitor-voice-recorder', error);
    }
    if (!isRecordPackageInstalled) {
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/npm-packager', 'Install'),
          from_id: deep.linkId,
          to: {
            data: {
              type_id: await deep.id('@deep-foundation/core', 'PackageQuery'),
              string: { data: { value: "@deep-foundation/capacitor-voice-recorder" } }
            }
          },
        }
      ]);
    };
    console.log("gello")
  };

  if (isRecordPackageInstalled) {
    (async () => {
      const packageLinkId = await deep.id("@deep-foundation/capacitor-voice-recorder");
      await deep.insert([
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ]);
      console.log("hello")
    })();
  };


  const installChatGPTPackage = async () => {
    try {
      isChatGPTPackageInstalled = useIsPackageInstalled({
        packageName: "@deep-foundation/chatgpt",
        shouldIgnoreResultWhenLoading: true,
        onError: ({ error }) => { console.error(error.message) }
      });
    } catch (error) {
      console.error('Errorе useIsPackageInstalled for @deep-foundation/chatgpt', error);
    }
    if (!isChatGPTPackageInstalled) {
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/npm-packager', 'Install'),
          from_id: deep.linkId,
          to: {
            data: {
              type_id: await deep.id('@deep-foundation/core', 'PackageQuery'),
              string: { data: { value: "@deep-foundation/chatgpt" } }
            }
          },
        }
      ]);
    };
    console.log("gello")
  };

  if (isChatGPTPackageInstalled) {
    (async () => {
      const packageLinkId = await deep.id("@deep-foundation/chatgpt");
      await deep.insert([
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ]);
      console.log("hello")
    })();
  };
  
  const installSpeechPackage = async () => {
    try {
      isSpeechPackageInstalled = useIsPackageInstalled({
        packageName: "@deep-foundation/google-speech",
        shouldIgnoreResultWhenLoading: true,
        onError: ({ error }) => { console.error(error.message) }
      });
    } catch (error) {
      console.error('Error useIsPackageInstalled for @deep-foundation/google-speech', error);
    } 
    if (!isSpeechPackageInstalled) {
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/npm-packager', 'Install'),
          from_id: deep.linkId,
          to: {
            data: {
              type_id: await deep.id('@deep-foundation/core', 'PackageQuery'),
              string: { data: { value: "@deep-foundation/google-speech" } }
            }
          },
        }
      ]);
    };
    console.log("gello")
  };

  if (isSpeechPackageInstalled) {
    (async () => {
      const packageLinkId = await deep.id("@deep-foundation/google-speech");
      await deep.insert([
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ]);
      console.log("hello")
    })();
  };

  const submitForm = () => {
    if (!isSpeechPackageInstalledPressed) {
      alert("'Install Speech package' button was not pressed.");
      return;
    }
    if (!isChatGPTPackageInstalledPressed) {
      alert('Install ChatGPT package button was not pressed.');
      return;
    }
    if (!isRecordPackageInstalledPressed) {
      alert('Install Record package button was not pressed.');
      return;
    }
    if (!isGetPermissionPressed) {
      alert('GET RECORDING PERMISSION button was not pressed.');
      return;
    }
  }

  return <Card>
    <CardHeader>
      <Heading>
        Setup
      </Heading>
    </CardHeader>
    <CardBody>
      <FormControl id="gql-path">
        <FormLabel>GraphQL Path</FormLabel>
        <Input type="text" onChange={(newGqlPath) => {
          setGqlPath(newGqlPath.target.value)
        }} />
      </FormControl>
      <FormControl id="token" >
        <FormLabel>Token</FormLabel>
        <Input type="text" onChange={(newToken) => {
          setToken(newToken.target.value)
        }} />
      </FormControl>
      <FormControl id="OpenAI API key">
        <FormLabel>Api key</FormLabel>
        <Input type="text" onChange={(newApiKey) => {
          setApiKey(newApiKey.target.value)
        }} />
      </FormControl>
      <FormControl id="Google Auth">
        <FormLabel>Google Auth</FormLabel>
        <Input type="text" onChange={(newGoogleAuth) => {
          setGoogleAuth(newGoogleAuth.target.value)
        }} />

          <Button disabled={!isSendDataPressed || isChatGPTPackageInstalledPressed} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installChatGPTPackage(); setIsChatGPTPackageInstalledPressed(true); }}>Install ChatGPT package</Button>
=
          <Button disabled={!isSendDataPressed || isSpeechPackageInstalledPressed} style={{ position: 'relative', zIndex: 1000 }} onClick={() => {installSpeechPackage(); setIsSpeechPackageInstalledPressed(true);}}>Install Speech package</Button>

          <Button disabled={!isSendDataPressed || isRecordPackageInstalledPressed} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installRecordPackage(); setIsRecordPackageInstalledPressed(true); }}>Install Record package</Button>

        <Button disabled={!isSendDataPressed || isGetPermissionPressed} style={{ position: 'relative', zIndex: 1000 }} onClick={async () => { await getAudioRecPermission(deep, deviceLinkId); setIsGetPermissionPressed(true); }} >GET RECORDING PERMISSION</Button>
      </FormControl>
      <Button onClick={() => {
        arg.onAuthorize({
          gqlPath,
          token,
        })
        setIsSendDataPressed(true)
      }}>
        Sent Data
      </Button>
      <Button onClick={() => {
        submitForm();
        if (!isSpeechPackageInstalledPressed || !isChatGPTPackageInstalledPressed || !isRecordPackageInstalledPressed || !isGetPermissionPressed) {
          return;
        }
        arg.onSubmit({
          apiKey,
          googleAuth
      })
}}>
  Submit
</Button>
    </CardBody>
  </Card>
}