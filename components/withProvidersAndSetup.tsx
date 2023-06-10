import { ChakraProvider } from '@chakra-ui/react';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { TokenProvider } from '@deep-foundation/deeplinks/imports/react-token';
import { useLocalStore } from '@deep-foundation/store/local';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import { WithSetup } from './with-setup';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';

export function WithProvidersAndSetup({
  renderChildren,
}: WithProvidersAndSetupParam) {
  const [gqlPath, setGqlPath] = useLocalStore<string>(
    CapacitorStoreKeys[CapacitorStoreKeys.GraphQlPath],
    ''
  );
  const [systemMsg, setSystemMsg] = useLocalStore<string>('systemMsg', '');

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
              <WithSetup
                gqlPath={gqlPath}
                setGqlPath={(newGqlPath) => {
                  console.log({ newGqlPath });
                  if (newGqlPath !== undefined) {
                    setGqlPath(newGqlPath);
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
