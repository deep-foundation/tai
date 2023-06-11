import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useLocalStore } from "@deep-foundation/store/local";
export function Setup(arg: { onSubmit: (arg: { gqlPath: string, token: string, apiKey: string, googleAuth: string, systemMsg: string }) => void }) {
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

          <FormControl id="openai-api-key">
            <FormLabel>OpenAI API key</FormLabel>
            <Input type="text" onChange={(newApiKey) => {
              setApiKey(newApiKey.target.value)
            }} />
          </FormControl>

          <FormControl id="google-service-account">
            <FormLabel>Google service account</FormLabel>
            <Input type="text" onChange={(newGoogleAuth) => {
              setGoogleAuth(newGoogleAuth.target.value)
            }} />
          </FormControl>

          <FormControl id="system-message">
            <FormLabel>System Message</FormLabel>
            <Input type="text" onChange={(newSystemMsg) => {
              setSystemMsg(newSystemMsg.target.value)
            }} />
          </FormControl>

          <Button onClick={() => {
            arg.onSubmit({
              gqlPath,
              token,
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