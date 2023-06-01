import { WithProvidersAndSetup } from './withProvidersAndSetup';
import { StoreProvider } from './store-provider';
import { Button, Text } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { DeepClient, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect, useRef } from 'react';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { WithDeviceInsertionIfDoesNotExistAndSavingdata } from '@deep-foundation/capacitor-device';
import { LocalStorage } from 'node-localstorage';
import { PackageInstallationStatuses } from '@deep-foundation/react-use-are-packages-installed';
export interface PageParam {
  renderChildren: (param: {
    deep: DeepClient;
    deviceLinkId: number;
  }) => JSX.Element;
}

export function Page({ renderChildren }: PageParam) {
  const packagesBeingInstalled = useRef<Array<string>>([]);
  const installPackage = async (packageName, deep) => {
    if (!packagesBeingInstalled.current[packageName]) {
      console.log('if condition');
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/npm-packager', 'Install'),
          from_id: deep.linkId,
          to: {
            data: {
              type_id: await deep.id('@deep-foundation/core', 'PackageQuery'),
              string: { data: { value: packageName } },
            },
          },
        },
      ]);
      let packageLinkId;
      while (!packageLinkId) {
        try {
          packageLinkId = await deep.id(packageName);
        } catch (error) {
          console.log(
            `Package ${packageName} not installed yet, retrying in 1 second...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      await deep.insert([
        {
          type_id: await deep.id('@deep-foundation/core', 'Join'),
          from_id: packageLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
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
      if (packageName == '@deep-foundation/chatgpt') {
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
    }
  };

  return (
    <StoreProvider>
      <WithProvidersAndSetup
        renderChildren={({ deep }) => {
          console.log(deep.linkId);

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
                  <div>
                    {`Install these deep packages to proceed: ${packageNames.join(
                      ', '
                    )}`}
                    ,
                    {packageNames
                      .filter(
                        (packageName) =>
                          !packagesBeingInstalled.current.includes(packageName)
                      )
                      .map((packageName) => {
                        return (
                          <Button
                            key={packageName}
                            onClick={() => {
                              installPackage(packageName, deep);
                            }}
                          >
                            Install {packageName}
                          </Button>
                        );
                      })}
                  </div>
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
