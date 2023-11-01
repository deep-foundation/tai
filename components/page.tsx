import { WithProvidersAndSetup } from './withProvidersAndSetup';
import { StoreProvider } from './store-provider';
import { Button, Stack, Text } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect, useRef } from 'react';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { WithDeviceInsertionIfDoesNotExistAndSavingData,getAllDeviceInfo,insertDevice } from '@deep-foundation/capacitor-device';
import delay from 'delay';
import { ChakraProvider } from '@chakra-ui/react';
import themeChakra from './theme/theme';

export interface PageParam {
  renderChildren: (param: {
    deep: DeepClient;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  const [processingPackage, setProcessingPackage] = useState(null);
  const [packagesBeingInstalled, setPackagesBeingInstalled] = useState(new Set());

  // const ThemeProviderCustom = ChakraProvider;
  // const themeCustom = themeChakra;
  
  const installPackage = async (param: {
    packageName: string, deep: DeepClient
  }) => {
    const { packageName, deep } = param;
    setPackagesBeingInstalled(prevPackages => new Set([...prevPackages, packageName]));

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

      if (packageName == '@deep-foundation/chatgpt-azure') {
        await deep.insert([
          {
            type_id: await deep.id('@deep-foundation/core', 'Join'),
            from_id: await deep.id('@deep-foundation/chatgpt-tokens-gpt-4-encoder'),
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
      {/* <ThemeProviderCustom theme={themeCustom}> */}
        <WithProvidersAndSetup
          renderChildren={({ deep }) => {
            return (
              <WithPackagesInstalled
                deep={deep}
                packageNames={[
                  '@deep-foundation/capacitor-voice-recorder',
                  '@deep-foundation/google-speech',
                  '@deep-foundation/chatgpt-azure',
                  '@deep-foundation/capacitor-device',
                  '@deep-foundation/sound',
                  '@flakeed/loyverse'
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
      {/* </ThemeProviderCustom> */}
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

interface WithDeviceLinkIdParam {
  deep: DeepClient;
  renderChildren: (param: { deviceLinkId: number }) => JSX.Element;
}

function WithDeviceLinkId({ deep, renderChildren }: WithDeviceLinkIdParam) {
  const [deviceLinkId, setDeviceLinkId] = useLocalStore<number>(
    CapacitorStoreKeys[CapacitorStoreKeys.DeviceLinkId],
    0
  );
  const insertDeviceCallback = async () => {
    const insertionResult = await insertDevice({
      deep,
      containerLinkId: deep.linkId || 0,
      info: await getAllDeviceInfo(),
    });
    setDeviceLinkId(insertionResult.deviceLink.id);
  };
  return (
    <WithDeviceInsertionIfDoesNotExistAndSavingData
      containerLinkId={deep.linkId || 0}
      deep={deep}
      deviceLinkId={deviceLinkId}
      renderIfLoading={() => <Text>Initializing device...</Text>}
      renderIfNotInserted={() => <Text>Initializing device...</Text>}
      insertDeviceCallback={insertDeviceCallback}
    >
      {renderChildren({ deviceLinkId })}
    </WithDeviceInsertionIfDoesNotExistAndSavingData>
  );
}