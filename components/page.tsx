import { ProvidersAndLoginOrContent } from "./providers-and-login-or-content";
import { StoreProvider } from "./store-provider";
import { Button, Text } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import {
  DeepClient,
  DeepProvider,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { useState } from "react";
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { WithDeviceInsertionIfDoesNotExistAndSavingdata } from '@deep-foundation/capacitor-device';

export interface PageParam {
  renderChildren: (param: {
    deep: DeepClient;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  const [arePermissionsGranted, setArePermissionsGranted] = useState<boolean>(false)
  const [packagesBeingInstalled, setPackagesBeingInstalled] = useState<Array<string>>([]);
  const [packagesInstalled, setPackagesInstalled] = useState<Array<string>>([]);
  const deep = useDeep();
  const installPackage = async (packageName) => {
    if (!packagesBeingInstalled[packageName]) {
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/npm-packager', 'Install'),
          from_id: deep.linkId,
          to: {
            data: {
              type_id: await deep.id('@deep-foundation/core', 'PackageQuery'),
              string: { data: { value: packageName } }
            }
          },
        }
      ]);
      let packageLinkId
      while (!packageLinkId) {
        try {
          packageLinkId = await deep.id(packageName);
        } catch (error) {
          console.log(`Package ${packageName} not installed yet, retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

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
    }
  };

  return (
    <StoreProvider>
      <ProvidersAndLoginOrContent>
        <WithDeep
          renderChildren={({ deep }) => {
            return (
              <WithPackagesInstalled
                packageNames={["@deep-foundation/capacitor-voice-recorder", "@deep-foundation/google-speech", "@deep-foundation/chatgpt"]}
                renderIfError={(error) => <div>{error.message}</div>}
                renderIfNotInstalled={(packageNames) => {
                  return (
                    <div>
                      {`Install these deep packages to proceed: ${packageNames.join(', ')}`},
                      {
                        packageNames
                          .filter((packageName) => !packagesBeingInstalled.includes(packageName))
                          .map((packageName) => {
                            if (packagesInstalled.includes(packageName)) {
                              return null;
                            }
                            return (
                              <Button onClick={() => {
                                installPackage(packageName);
                                setPackagesInstalled([...packagesInstalled, packageName]);
                              }}>
                                Install {packageName}
                              </Button>
                            );
                          })
                      }
                    </div>
                  );
                }}
                renderIfLoading={() => (
                  <Text>Checking if deep packages are installed...</Text>
                )}
                shouldIgnoreResultWhenLoading={true}
              >
                {arePermissionsGranted ? (
                  <WithDeviceLinkId
                    deep={deep}
                    renderChildren={({ deviceLinkId }) =>
                      renderChildren({ deep, deviceLinkId })
                    }
                  />
                ) : (
                  <Button
                    style={{ position: 'relative', zIndex: 1000 }}
                    onClick={async () => {
                      const { value: arePermissionsGranted } = await VoiceRecorder.requestAudioRecordingPermission();
                      setArePermissionsGranted(arePermissionsGranted);
                    }}
                  >
                    GET RECORDING PERMISSION
                  </Button>
                )}
              </WithPackagesInstalled>
            );
          }}
        />
      </ProvidersAndLoginOrContent>
    </StoreProvider>
  );
}
interface WithDeepProps {
  renderChildren: (param: { deep: DeepClient }) => JSX.Element;
}

function WithDeep({ renderChildren }: WithDeepProps) {
  const deep = useDeep();
  return renderChildren({ deep });
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
      containerLinkId={deep.linkId}
      deep={deep}
      deviceLinkId={deviceLinkId as number} // use a type assertion to cast deviceLinkId to number
      setDeviceLinkId={setDeviceLinkId}
      renderIfLoading={() => <Text>Initializing device...</Text>}
      renderIfNotInserted={() => <Text>Initializing device...</Text>}
    >
      {renderChildren({ deviceLinkId })}
    </WithDeviceInsertionIfDoesNotExistAndSavingdata>
  );
}