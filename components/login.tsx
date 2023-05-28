import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useLocalStore } from "@deep-foundation/store/local";
export function Setup(arg: {
  onAuthorize: (arg: { gqlPath: string, token: string }) => void,
  onSubmit: (arg: { apiKey: string, googleAuth: string, systemMsg: string }) => void
}) {
  const deep = useDeep();
  
  const [gqlPath, setGqlPath] = useLocalStore<string>("gqlPath", "");
  const [token, setToken] = useLocalStore<string>("token", "");
  const [apiKey, setApiKey] = useLocalStore<string>("apikey", "");
  const [googleAuth, setGoogleAuth] = useLocalStore<string>("googleAuth", "");
  const [systemMsg, setSystemMsg] = useLocalStore<string>("systemMsg", "");

  return (
    <>
      <Card>
        <CardHeader>
          <Heading>
            Setup
          </Heading>
        </CardHeader>
        <CardBody>

          <FormControl id="gql-path">
            <FormLabel>GraphQL Path</FormLabel>
            <Input type="text" onChange={(newGqlPath) => {
              setGqlPath(newGqlPath.target.value)
            }} />
          </FormControl>

          <FormControl id="token" >
            <FormLabel>Token</FormLabel>
            <Input type="text" onChange={(newToken) => {
              setToken(newToken.target.value)
            }} />
          </FormControl>

          <FormControl id="OpenAI API key">
            <FormLabel>Api key</FormLabel>
            <Input type="text" onChange={(newApiKey) => {
              setApiKey(newApiKey.target.value)
            }} />
          </FormControl>

          <FormControl id="Google Auth">
            <FormLabel>Google Auth</FormLabel>
            <Input type="text" onChange={(newGoogleAuth) => {
              setGoogleAuth(newGoogleAuth.target.value)
            }} />
          </FormControl>

          <FormControl id="System Message">
            <FormLabel>System Message</FormLabel>
            <Input type="text" onChange={(newSystemMsg) => {
              setSystemMsg(newSystemMsg.target.value)
            }} />
          </FormControl>

          <Button onClick={() => {
            arg.onAuthorize({
              gqlPath,
              token,
            })
          }}>
            Send Data
          </Button>

          <Button onClick={() => {
             arg.onSubmit({
              apiKey,
              googleAuth,
              systemMsg
            });
          }}>
            Submit
          </Button>
          
        </CardBody>
      </Card>
    </>
  );
}
