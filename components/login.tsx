import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useState } from "react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { StoreProvider } from './store-provider';
import { useLocalStore } from "@deep-foundation/store/local";
import getAudioRecPermission from '../imports/capacitor-voice-recorder/get-permission';
import { useIsPackageInstalled } from '../imports/use-is-package-installed';
import checkAudioRecPermission from '../imports/capacitor-voice-recorder/check-permission'
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
  let audioPermission;
  let isRecordPackageInstalled;
  let isChatGPTPackageInstalled;
  let isSpeechPackageInstalled;
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  const recordPackageStatus = useIsPackageInstalled({
    packageName: "@deep-foundation/capacitor-voice-recorder",
    shouldIgnoreResultWhenLoading: true,
    onError: ({ error }) => { console.error(error.message) }
  });

  const chatGPTPackageStatus = useIsPackageInstalled({
    packageName: "@deep-foundation/chatgpt",
    shouldIgnoreResultWhenLoading: true,
    onError: ({ error }) => { console.error(error.message) }
  });

  const speechPackageStatus = useIsPackageInstalled({
    packageName: "@deep-foundation/google-speech",
    shouldIgnoreResultWhenLoading: true,
    onError: ({ error }) => { console.error(error.message) }
  });


  const installRecordPackage = async () => {
    let isRecordPackageInstalled = recordPackageStatus;
    console.log("isRecordPackageInstalled",isRecordPackageInstalled)
    do {
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

      if (isRecordPackageInstalled) {
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
      };

      if (!isRecordPackageInstalled) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } while (!isRecordPackageInstalled);
  }

  const installChatGPTPackage = async () => {
    let isChatGPTPackageInstalled = chatGPTPackageStatus;
    console.log("isChatGPTPackageInstalled",isChatGPTPackageInstalled)
    do {
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
        console.log("gello")
      };

      if (isChatGPTPackageInstalled) {
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
      };

      if (!isChatGPTPackageInstalled) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } while (!isChatGPTPackageInstalled);
  }

  const installSpeechPackage = async () => {
    let isSpeechPackageInstalled = speechPackageStatus;
    console.log("isSpeechPackageInstalled",isSpeechPackageInstalled)
    do {
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
        console.log("gello")
      };

      if (isSpeechPackageInstalled) {
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
      };

      if (!isSpeechPackageInstalled) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } while (!isSpeechPackageInstalled);
  }

  const submitForm = async () => {
    let error = '';

    audioPermission = await checkAudioRecPermission(deep, deviceLinkId);
    if (!audioPermission) {
      error += 'GET RECORDING PERMISSION, ';
    }

    if (isSpeechPackageInstalled) {
      if (!isSpeechPackageInstalledPressed) {
        error += 'Install Speech package, ';
      }
    }

    if (isChatGPTPackageInstalled) {
      if (!isChatGPTPackageInstalledPressed) {
        error += 'Install ChatGPT package, ';
      }
    }

    if (isRecordPackageInstalled) {
      if (!isRecordPackageInstalledPressed) {
        error += 'Install Record package, ';
      }
    }

    if (error !== '') {
      alert(`${error} were not pressed or installed.`);
      return;
    } else {
      arg.onSubmit({
        apiKey,
        googleAuth
      });
        const parsedGoogleAuth = JSON.parse(googleAuth);
        await deep.insert({
          type_id: await deep.id("@deep-foundation/google-speech", "GoogleCloudAuthFile"),
          object: { data: { value: parsedGoogleAuth } },
          in: {
            data: [
              {
                type_id: await deep.id("@deep-foundation/core", "Contain"),
                from_id: deep.linkId,
              }
            ]
          }
        });
        await deep.insert({
          type_id: await deep.id("@deep-foundation/openai", "ApiKey"),
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

        <Button disabled={!isSendDataPressed || isChatGPTPackageInstalledPressed || isChatGPTPackageInstalled} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installChatGPTPackage(); setIsChatGPTPackageInstalledPressed(true); }}>Install ChatGPT package</Button>
        
        <Button disabled={!isSendDataPressed || isSpeechPackageInstalledPressed || isSpeechPackageInstalled} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installSpeechPackage(); setIsSpeechPackageInstalledPressed(true); }}>Install Speech package</Button>

        <Button disabled={!isSendDataPressed || isRecordPackageInstalledPressed || isRecordPackageInstalled} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installRecordPackage(); setIsRecordPackageInstalledPressed(true); }}>Install Record package</Button>

        <Button disabled={!isSendDataPressed || isGetPermissionPressed || audioPermission} style={{ position: 'relative', zIndex: 1000 }} onClick={async () => { await getAudioRecPermission(deep, deviceLinkId); setIsGetPermissionPressed(true); }} >GET RECORDING PERMISSION</Button>
      
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
      }}>
        Submit
      </Button>
    </CardBody>
  </Card>
}
