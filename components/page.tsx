import { WithProvidersAndSetup } from './withProvidersAndSetup';
import { StoreProvider } from './store-provider';
import { Button, Stack, Text } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect, useRef } from 'react';
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

      await deep.await(installLink.id);

      const packageLinkId = await deep.id(packageName)
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/core', 'Join'),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ]);

      if (packageName == '@deep-foundation/chatgpt') {
        await deep.insert([
          {
            type_id: await deep.id('@deep-foundation/core', 'Join'),
            from_id: await deep.id('@deep-foundation/chatgpt-tokens-gpt-3-encoder'),
            to_id: await deep.id('deep', 'admin'),
          },
        ]);
      }

      if (packageName == '@deep-foundation/capacitor-device') {
        await deep.insert([
          {
            type_id: await deep.id('@deep-foundation/core', 'Join'),
            from_id: await deep.id('@freephoenix888/object-to-links-async-converter'),
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
                '@deep-foundation/sound'
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
                        if (packageName === '@deep-foundation/capacitor-voice-recorder' || packageName === '@deep-foundation/google-speech') {
                          if (packageNames.includes('@deep-foundation/sound')) {
                            return null;
                          }
                        }
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
              <WithPermissionsGranted>
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

function WithPermissionsGranted({ children }: { children: JSX.Element }) {
  const [arePermissionsGranted, setArePermissionsGranted] = useState<
    boolean | undefined
  >(undefined);

  useEffect(() => {
    VoiceRecorder.requestAudioRecordingPermission().then(
      ({ value: isPermissionGranted }) => {
        setArePermissionsGranted(isPermissionGranted);
      }
    );
  }, []);

  if (arePermissionsGranted === undefined) {
    return null;
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