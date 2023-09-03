import { ChakraProvider } from '@chakra-ui/react';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { TokenProvider } from '@deep-foundation/deeplinks/imports/react-token';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { WithSetup } from './with-setup';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import themeChakra from './theme/theme';

export function WithProvidersAndSetup({
  renderChildren,
}: WithProvidersAndSetupParam) {
  const [gqlPath, setGqlPath] = useLocalStore<string>(
    CapacitorStoreKeys[CapacitorStoreKeys.GraphQlPath],
    ''
  );
  const [apiKey, setApiKey] = useLocalStore<string>('apikey', '');
  const [googleAuth, setGoogleAuth] = useLocalStore<string>('googleAuth', '');
  const [systemMsg, setSystemMsg] = useLocalStore<string>('systemMsg', '');
  const ThemeProviderCustom = ChakraProvider;
  const themeCustom = themeChakra;

  return (
    <>
      <ChakraProvider theme={themeCustom}>
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
              <WithSetup
                gqlPath={gqlPath}
                setGqlPath={(newGqlPath) => {
                  if (newGqlPath !== undefined) {
                    setGqlPath(newGqlPath);
                  }
                }}
                apiKey={apiKey}
                setApiKey={(newApiKey) => {
                  if (newApiKey !== undefined) {
                    setApiKey(newApiKey);
                  }
                }}
                googleAuth={googleAuth}
                setGoogleAuth={(newGoogleAuth) => {
                  if (newGoogleAuth !== undefined) {
                    setGoogleAuth(newGoogleAuth);
                  }
                }}
                systemMsg={systemMsg}
                setSystemMsg={(newSystemMsg) => {
                  if (newSystemMsg !== undefined) {
                    setSystemMsg(newSystemMsg);
                  }
                }}
                renderChildren={renderChildren}
              />
            </DeepProvider>
          </ApolloClientTokenizedProvider>
        </TokenProvider>
      </ChakraProvider>
    </>
  );
}

export interface WithProvidersAndSetupParam {
  renderChildren: (param: { deep: DeepClient }) => JSX.Element;
}