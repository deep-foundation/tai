import { ProvidersAndLoginOrContent } from "./providers-and-login-or-content";  
import { StoreProvider } from "./store-provider";
import { Button, Text } from '@chakra-ui/react'; 
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useState } from "react";
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
import { VoiceRecorder } from 'capacitor-voice-recorder';
export interface PageParam {  
  children: JSX.Element;  
}  

export function Page({ children }: PageParam) {  
  const deep = useDeep();
  const [arePermissionsGranted, setArePermissionsGranted] = useState(false);
  const [packagesBeingInstalled, setPackagesBeingInstalled] = useState<Array<string>>([]);
  const [packagesInstalled, setPackagesInstalled] = useState<Array<string>>([]);
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
      let packageLinkId;
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

      if(packageName==="@deep-foundation/chatgpt"){
        await deep.insert([
          {
            type_id: await deep.id("@deep-foundation/core", "Join"),
            from_id: await deep.id("@deep-foundation/chatgpt-tokens-gpt-3-encoder"),
            to_id: await deep.id('deep', 'users', 'packages'),
          },
          {
            type_id: await deep.id("@deep-foundation/core", "Join"),
            from_id: await deep.id("@deep-foundation/chatgpt-tokens-gpt-3-encoder"),
            to_id: await deep.id('deep', 'admin'),
          },
        ]);
      }
    }
  };
  return (  
    <StoreProvider>  
      <ProvidersAndLoginOrContent>  
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
              {!arePermissionsGranted ? (
                <>
                  <Button
                    style={{ position: 'relative', zIndex: 1000 }}
                    onClick={async () => {
                      const { value: arePermissionsGranted } = await VoiceRecorder.requestAudioRecordingPermission();
                      setArePermissionsGranted(arePermissionsGranted);
                    }}
                  >
                    GET RECORDING PERMISSION
                  </Button>
                </>
              ) : <></>}
            </WithPackagesInstalled>
      </ProvidersAndLoginOrContent>  
    </StoreProvider>  
  );  
}
