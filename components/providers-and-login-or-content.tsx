import { ChakraProvider } from "@chakra-ui/react";
import { DeepProvider } from "@deep-foundation/deeplinks/imports/client";
import { TokenProvider } from "@deep-foundation/deeplinks/imports/react-token";
import { useLocalStore } from "@deep-foundation/store/local";
import { CapacitorStoreKeys } from "../imports/capacitor-store-keys";
import { LoginOrContent } from "./login-or-content";
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';

export function ProvidersAndLoginOrContent({ children }: { children: JSX.Element }) {
  const [gqlPath, setGqlPath] = useLocalStore(CapacitorStoreKeys[CapacitorStoreKeys.GraphQlPath], undefined)
  const [apiKey, setApiKey] = useLocalStore("apikey", undefined);
  const [googleAuth, setGoogleAuth] = useLocalStore("googleAuth", undefined);
  const [systemMgs, setSystemMsg] = useLocalStore("systemMsg", undefined);

  return (
    <>
      <ChakraProvider>
        <TokenProvider>
          <ApolloClientTokenizedProvider
            options={{
              client: 'deeplinks-app',
              path: gqlPath,
              ssl: true,
              ws: !!process?.browser,
            }}
          >
            <DeepProvider>
              <LoginOrContent 
                gqlPath={gqlPath} setGqlPath={(newGqlPath) => {
                  console.log({ newGqlPath })
                  setGqlPath(newGqlPath)
                }}
                apiKey={apiKey}
                setApiKey={(newApiKey) => {
                  console.log({ newApiKey })
                  setApiKey(newApiKey)
                }}
                googleAuth={googleAuth}
                setGoogleAuth={(newGoogleAuth) => {
                  console.log({ newGoogleAuth })
                  setGoogleAuth(newGoogleAuth)
                }}
                systemMsg={systemMgs}
                setSystemMsg={(newSystemMsg) => {
                  console.log({ newSystemMsg })
                  setSystemMsg(newSystemMsg)
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
