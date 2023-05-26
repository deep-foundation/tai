import { ChakraProvider } from "@chakra-ui/react";
import { DeepProvider } from "@deep-foundation/deeplinks/imports/client";
import { TokenProvider } from "@deep-foundation/deeplinks/imports/react-token";
import { useLocalStore } from "@deep-foundation/store/local";
import { CapacitorStoreKeys } from "../imports/capacitor-store-keys";
import { LoginOrContent } from "./login-or-content";
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';

export function ProvidersAndLoginOrContent({ children }: { children: JSX.Element }) {
  const [gqlPath, setGqlPath] = useLocalStore<string>(CapacitorStoreKeys[CapacitorStoreKeys.GraphQlPath], '')
  const [apiKey, setApiKey] = useLocalStore<string>("apikey", "");
  const [googleAuth, setGoogleAuth] = useLocalStore<string>("googleAuth", "");
  const [systemMsg, setSystemMsg] = useLocalStore<string>("systemMsg", "");
    
  return (
    <>
      <ChakraProvider>
        <TokenProvider>
        <ApolloClientTokenizedProvider
  options={{
    client: 'deeplinks-app',
    path: gqlPath !== undefined ? gqlPath : '',
    ssl: true,
    ws: !!process?.browser,
  }}
>
            <DeepProvider>
              <LoginOrContent 
                 gqlPath={gqlPath} 
                 setGqlPath={(newGqlPath) => {
                  console.log({ newGqlPath })
                  if (newGqlPath !== undefined) {
                    setGqlPath(newGqlPath)
                  }
                }}
                apiKey={apiKey}
                setApiKey={(newApiKey) => {
                  console.log({ newApiKey })
                  if (newApiKey !== undefined) {
                    setApiKey(newApiKey)
                  }
                }}
                googleAuth={googleAuth}
                setGoogleAuth={(newGoogleAuth) => {
                  console.log({ newGoogleAuth })
                  if (newGoogleAuth !== undefined) {
                    setGoogleAuth(newGoogleAuth)
                  }
                }}
                systemMsg={systemMsg}
                setSystemMsg={(newSystemMsg) => {
                  console.log({ newSystemMsg })
                  if (newSystemMsg !== undefined) {
                    setSystemMsg(newSystemMsg)
                  }
                }}
              >
                {children}
              </LoginOrContent>
            </DeepProvider>
          </ApolloClientTokenizedProvider>
        </TokenProvider>
      </ChakraProvider>
    </>
  );
}
