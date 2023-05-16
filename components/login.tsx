import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button, Alert, AlertTitle, AlertIcon, Text, AlertDescription } from "@chakra-ui/react";
import { useState } from "react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { StoreProvider } from './store-provider';
import { useLocalStore } from "@deep-foundation/store/local";
import { useIsPackageInstalled } from '../imports/use-is-package-installed';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { Page } from '../components/page';
import { Fragment } from 'react';
export function Setup(arg: {
  onAuthorize: (arg: { gqlPath: string, token: string }) => void,
  onSubmit: (arg: { apiKey: string, googleAuth: string, systemMsg: string  }) => void
}) {
  // const defaultGqlPath = "3006-deepfoundation-dev-mst16p4n7jz.ws-eu96b.gitpod.io/gql";
  // const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4iLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzc4In0sImlhdCI6MTY4MzQ4MDUyMH0.rp9HzhnRMEA-hKf_2aReoJvBI6aSlItNSQ-cop58w5U";
  const deep = useDeep();
  const [gqlPath, setGqlPath] = useLocalStore<string>("gqlPath", "");
  const [token, setToken] = useLocalStore<string>("token", "");
  const [apiKey, setApiKey] = useLocalStore<string>("apikey", "");
  const [googleAuth, setGoogleAuth] = useLocalStore<string>("googleAuth", "");
  const [systemMsg, setSystemMsg] = useLocalStore<string>("systemMsg", "");
  const [isRecordPackageInstalledPressed, setIsRecordPackageInstalledPressed] = useState(false);
  const [isChatGPTPackageInstalledPressed, setIsChatGPTPackageInstalledPressed] = useState(false);
  const [isSpeechPackageInstalledPressed, setIsSpeechPackageInstalledPressed] = useState(false);
  const [isGetPermissionPressed, setIsGetPermissionPressed] = useState(false);
  const [isSendDataPressed, setIsSendDataPressed] = useState(false);
  const [arePermissionsGranted, setArePermissionsGranted] = useState<boolean | undefined>(undefined)
  // let isRecordPackageInstalled,chatGPTPackageStatus,speechPackageStatus;
  let audioPermission;
  let isRecordPackageInstalled=false;
  let isChatGPTPackageInstalled=false;
  let isSpeechPackageInstalled=false;
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  const installRecordPackage = async () => {
    console.log("isRecordPackageInstalled",isRecordPackageInstalled)
    if (!isRecordPackageInstalled) {
      const { data: [{ id: recorderPackageLinkId }] } = await deep.insert([
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
      console.log("gello")

        await deep.insert([
          {
            type_id: await deep.id("@deep-foundation/core", "Join"),
            from_id: recorderPackageLinkId,
            to_id: await deep.id('deep', 'users', 'packages'),
          },
          {
            type_id: await deep.id("@deep-foundation/core", "Join"),
            from_id: recorderPackageLinkId,
            to_id: await deep.id('deep', 'admin'),
          },
        ]);
        console.log("hello")
      }
  }

  const installChatGPTPackage = async () => {
    console.log("isChatGPTPackageInstalled",isChatGPTPackageInstalled)
    if (!isChatGPTPackageInstalled) {
      const { data: [{ id: chatGPTPackageLinkId }] }= await deep.insert([
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
      await deep.insert([
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: chatGPTPackageLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
          type_id: await deep.id("@deep-foundation/core", "Join"),
          from_id: chatGPTPackageLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ]);
      console.log("hello")
    }
  }

  const installSpeechPackage = async () => {
    console.log("isSpeechPackageInstalled",isSpeechPackageInstalled)
    if (!isSpeechPackageInstalled) {
      const { data: [{ id: speechPackageLinkId }] } = await deep.insert([
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
        await deep.insert([
          {
            type_id: await deep.id("@deep-foundation/core", "Join"),
            from_id: speechPackageLinkId,
            to_id: await deep.id('deep', 'users', 'packages'),
          },
          {
            type_id: await deep.id("@deep-foundation/core", "Join"),
            from_id: speechPackageLinkId,
            to_id: await deep.id('deep', 'admin'),
          },
        ]);
        console.log("hello")
      }
  }


  const submitForm = async () => {
    let error = '';;
    if (!arePermissionsGranted) {
      error += 'GET RECORDING PERMISSION, ';
    }

    if (!isSpeechPackageInstalled) {
      if (!isSpeechPackageInstalledPressed) {
        error += 'Install Speech package, ';
      }
    }

    if (!isChatGPTPackageInstalled) {
      if (!isChatGPTPackageInstalledPressed) {
        error += 'Install ChatGPT package, ';
      }
    }

    if (!isRecordPackageInstalled) {
      if (!isRecordPackageInstalledPressed) {
        error += 'Install Record package, ';
      }
    }

    if (error !== '') {
      alert(`${error} were not pressed or installed.`);
      return;
    }
      arg.onSubmit({
        apiKey,
        googleAuth,
        systemMsg
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

  return (
    <>
      <Card>
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
        </FormControl>
      <FormControl id="System Message">
        <FormLabel>System Message</FormLabel>
        <Input type="text" onChange={(newSystemMsg) => {
          setSystemMsg(newSystemMsg.target.value)
        }} />

        <Button disabled={!isSendDataPressed || isChatGPTPackageInstalled} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installChatGPTPackage(); setIsChatGPTPackageInstalledPressed(true); }}>Install ChatGPT package</Button>
        
        <Button disabled={!isSendDataPressed || isSpeechPackageInstalled} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installSpeechPackage(); setIsSpeechPackageInstalledPressed(true); }}>Install Speech package</Button>

        <Button disabled={!isSendDataPressed || isRecordPackageInstalled} style={{ position: 'relative', zIndex: 1000 }} onClick={() => { installRecordPackage(); setIsRecordPackageInstalledPressed(true); }}>Install Record package</Button>

        <Button disabled={!isSendDataPressed || audioPermission} style={{ position: 'relative', zIndex: 1000 }} onClick={async () => { const { value: arePermissionsGranted } = await VoiceRecorder.requestAudioRecordingPermission();
          setArePermissionsGranted(arePermissionsGranted); setIsGetPermissionPressed(true); }} >GET RECORDING PERMISSION</Button>
      
      </FormControl>
      <Button onClick={() => {
          arg.onAuthorize({
            gqlPath,
            token,
          })
          setTimeout(() => {
            setIsSendDataPressed(true)
          }, 3000);
        }}>
          Send Data
        </Button>
        <Button onClick={() => {
          submitForm();
        }}>
          Submit
        </Button>
        {isSendDataPressed && (
          <WithPackagesInstalled
          packageNames={["@deep-foundation/chatgpt"]}
          renderIfError={(error) => (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>{error && error.message}</AlertDescription>
            </Alert>
          )}
          renderIfNotInstalled={() => {
            isChatGPTPackageInstalled=true
            return <Alert status="error">
              <AlertIcon />
              <AlertTitle>Install '@deep-foundation/chatgpt' to proceed!</AlertTitle>
            </Alert>
          }}
          
          renderIfLoading={() => (
            <>
              <Loading />
            </>
          )}
          shouldIgnoreResultWhenLoading={true}
        >
          <Text>Package installation check complete!</Text>
        </WithPackagesInstalled>
        )}
        {isSendDataPressed && (
          <WithPackagesInstalled
          packageNames={["@deep-foundation/google-speech"]}
          renderIfError={(error) => (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>{error && error.message}</AlertDescription>
            </Alert>
          )}
          renderIfNotInstalled={() => {
            isSpeechPackageInstalled=true
            return <Alert status="error">
              <AlertIcon />
              <AlertTitle>Install '@deep-foundation/google-speech' to proceed!</AlertTitle>
            </Alert>
          }}
          
          renderIfLoading={() => (
            <>
              <Loading />
            </>
          )}
          shouldIgnoreResultWhenLoading={true}
        >
          <Text>Package installation check complete!</Text>
        </WithPackagesInstalled>
        )}
        {isSendDataPressed && (
          <WithPackagesInstalled
          packageNames={["@deep-foundation/capacitor-voice-recorder"]}
          renderIfError={(error) => (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>{error && error.message}</AlertDescription>
            </Alert>
          )}
          renderIfNotInstalled={() => {
            isRecordPackageInstalled=true
            return <Alert status="error">
              <AlertIcon />
              <AlertTitle>Install '@deep-foundation/capacitor-voice-recorder' to proceed!</AlertTitle>
            </Alert>
          }}
          
          renderIfLoading={() => (
            <>
              <Loading />
            </>
          )}
          shouldIgnoreResultWhenLoading={true}
        >
          <Text>Package installation check complete!</Text>
        </WithPackagesInstalled>
        )}
      </CardBody>
    </Card>
  </>
);
}

function Loading() {
  return <Text>Loading...</Text>;
}