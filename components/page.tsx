import { WithProvidersAndSetup } from './withProvidersAndSetup';
import { StoreProvider } from './store-provider';
import { Button, Stack, Text,FormControl, FormLabel,Input } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect, useRef, Children } from 'react';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { WithDeviceInsertionIfDoesNotExistAndSavingdata } from '@deep-foundation/capacitor-device';
import delay from 'delay';

export interface PageParam {
  renderChildren: (param: {
    deep: DeepClient;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  const [processingPackage, setProcessingPackage] = useState(null);
  const [packagesBeingInstalled, setPackagesBeingInstalled] = useState(new Set());
  const [apiKey, setApiKey] = useState<string>("");
  const [googleAuth, setGoogleAuth] = useState<string>("");
  const [systemMsg, setSystemMsg] = useLocalStore<string>("systemMsg", "");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [canRenderChildren, setCanRenderChildren] = useState(false);

  const installPackage = async (param: {
    packageName: string, deep: DeepClient
  }) => {
    const { packageName, deep } = param;
    setPackagesBeingInstalled(prevPackages => new Set([...prevPackages, packageName]));
      console.log('if condition');

      const {data: [installLink]} = await deep.insert({
        type_id: await deep.id('@deep-foundation/npm-packager', 'Install'),
        from_id: deep.linkId,
        to: {
          data: {
            type_id: await deep.id('@deep-foundation/core', 'PackageQuery'),
            string: { data: { value: packageName } },
          },
        },
      });

      let packageLinkId: number|undefined = undefined;
      while (!packageLinkId) {
        try {
          packageLinkId = await deep.id(packageName);
        } catch (error) {
          console.log(
            `Package ${packageName} not installed yet, retrying in 1 second...`
          );
          await delay(1000);
        }
      }
      // await deep.await(installLink.id);
      // const packageLinkId = await deep.id(packageName)
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/core', 'Join'),
          from_id: packageLinkId,
          to_id: deep.linkId,
        },
      ]);

      if (packageName == '@deep-foundation/chatgpt') {
        await deep.insert([
          {
            type_id: await deep.id('@deep-foundation/core', 'Join'),
            from_id: await deep.id(
              '@deep-foundation/chatgpt-tokens-gpt-3-encoder'
            ),
            to_id: await deep.id('deep', 'users', 'packages'),
          },
          {
            type_id: await deep.id('@deep-foundation/core', 'Join'),
            from_id: await deep.id(
              '@deep-foundation/chatgpt-tokens-gpt-3-encoder'
            ),
            to_id: await deep.id('deep', 'admin'),
          },
        ]);
      }

      if (packageName == '@deep-foundation/capacitor-device') {
        await deep.insert([
          {
            type_id: await deep.id('@deep-foundation/core', 'Join'),
            from_id: await deep.id(
              '@freephoenix888/object-to-links-async-converter'
            ),
            to_id: await deep.id('deep', 'users', 'packages'),
          },
          {
            type_id: await deep.id('@deep-foundation/core', 'Join'),
            from_id: await deep.id(
              '@freephoenix888/object-to-links-async-converter'
            ),
            to_id: await deep.id('deep', 'admin'),
          },
        ]);
      }
      setPackagesBeingInstalled(prevPackages => {
        const newPackages = new Set(prevPackages);
        newPackages.delete(packageName);
        return newPackages;
      });
  };

  return (
    <StoreProvider>
      <WithProvidersAndSetup
        renderChildren={({ deep }) => {
          return (
            <WithPackagesInstalled
              deep={deep}
              packageNames={[
                '@deep-foundation/capacitor-voice-recorder',
                '@deep-foundation/google-speech',
                '@deep-foundation/chatgpt',
                '@deep-foundation/capacitor-device',
              ]}
              renderIfError={(error) => <div>{error.message}</div>}
              renderIfNotInstalled={(packageNames) => {
                return (
                  <Stack>
                    <Text>
                    {`Install these deep packages to proceed: ${packageNames.join(', ')}`}
                    </Text>
                    
                    {packageNames
                      .map((packageName) => {
                        return (
                          <Button
                            key={packageName}
                            onClick={async () => {
                              if(!packagesBeingInstalled.has(packageName)) {
                                await installPackage({packageName, deep});
                              }
                            }}
                            isLoading={packagesBeingInstalled.has(packageName)}
                          >
                            Install {packageName}
                          </Button>
                        );
                      })}
                  </Stack>
                );
              }}
              renderIfLoading={() => (
                <Text>Checking if deep packages are installed...</Text>
              )}
            >
                <WithPermissionsGranted deep={deep}>
                  <WithDeviceLinkId
                    deep={deep}
                    renderChildren={({ deviceLinkId }) =>
                      renderChildren({ deep, deviceLinkId })
                    }
                  />
                </WithPermissionsGranted>
            </WithPackagesInstalled>
          );
        }}
      />
    </StoreProvider>
  );
}

function WithPermissionsGranted({ children,deep }: { children: JSX.Element,deep:DeepClient }) {
  const [arePermissionsGranted, setArePermissionsGranted] = useState<
    boolean | undefined
  >(undefined);
  const [formDataSubmitted, setFormDataSubmitted] = useLocalStore<boolean>("formDataSubmitted",false);
  const [apiKey, setApiKey] = useState<string>("");
  const [googleAuth, setGoogleAuth] = useState<string>("");
  const [systemMsg, setSystemMsg] = useState<string>("");

  const onSubmit = async (arg: { systemMsg: string }, deep: DeepClient ) => {
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

    console.log("checkApiKeyLink", checkApiKeyLink);

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

      console.log("apiKeyLinkId", apiKeyLinkId);
    }

    const { data: checkGoogleAuthLink } = await deep.select({
      type_id: googleCloudAuthKeyTypeLink,
      in: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      },
    });

    console.log("checkGoogleAuthLink", checkGoogleAuthLink);

    if (!checkGoogleAuthLink || checkGoogleAuthLink.length === 0) {
      const parsedGoogleAuth = JSON.parse(googleAuth);
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

      console.log("googleAuthLinkId", googleAuthLinkId);
    }
    if (apiKey && googleAuth && systemMsg) {
     setFormDataSubmitted(true);
    }
}
useEffect(() => {
  if (formDataSubmitted) {
    VoiceRecorder.requestAudioRecordingPermission().then(
      ({ value: isPermissionGranted }) => {
        setArePermissionsGranted(isPermissionGranted);
      }
    );
  }
}, [formDataSubmitted]);

if (arePermissionsGranted === undefined) {
  return (
    <div>
      <FormControl id="openai-api-key">
        <FormLabel>OpenAI API key</FormLabel>
        <Input type="text" onChange={(newApiKey) => {
          setApiKey(newApiKey.target.value)
        }} />
      </FormControl>
      <FormControl id="google-service-account">
        <FormLabel>Google service account</FormLabel>
        <Input type="text" onChange={(newGoogleAuth) => {
          setGoogleAuth(newGoogleAuth.target.value)
        }} />
      </FormControl>
      <FormControl id="system-message">
        <FormLabel>System Message</FormLabel>
        <Input type="text" onChange={(newSystemMsg) => {
          setSystemMsg(newSystemMsg.target.value)
        }} />
      </FormControl>
      <Button onClick={() => onSubmit({ systemMsg }, deep)}>Submit</Button>
    </div>
  );
} else if (arePermissionsGranted === false) {
  return (
    <Button
      style={{ position: 'relative', zIndex: 1000 }}
      onClick={async () => {
        const { value: arePermissionsGranted } =
          await VoiceRecorder.requestAudioRecordingPermission();
        setArePermissionsGranted(arePermissionsGranted);
      }}
    >
      Provide Recodring Permissions
    </Button>
  );
} else {
  return children;
}
}

interface WithDeviceLinkIdProps {
  deep: DeepClient;
  renderChildren: (param: { deviceLinkId: number }) => JSX.Element;
}

function WithDeviceLinkId({ deep, renderChildren }: WithDeviceLinkIdProps) {
  const [deviceLinkId, setDeviceLinkId] = useLocalStore<number>(
    CapacitorStoreKeys[CapacitorStoreKeys.DeviceLinkId],
    0
  );

  return (
    <WithDeviceInsertionIfDoesNotExistAndSavingdata
      containerLinkId={deep.linkId || 0}
      deep={deep}
      deviceLinkId={deviceLinkId}
      setDeviceLinkId={setDeviceLinkId}
      renderIfLoading={() => <Text>Initializing device...</Text>}
      renderIfNotInserted={() => <Text>Initializing device...</Text>}
    >
      {renderChildren({ deviceLinkId })}
    </WithDeviceInsertionIfDoesNotExistAndSavingdata>
  );
}