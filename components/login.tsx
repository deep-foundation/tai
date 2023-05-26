import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button, Text} from "@chakra-ui/react";
import { useState } from "react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useLocalStore } from "@deep-foundation/store/local";
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { WithPackagesInstalled } from '@deep-foundation/react-with-packages-installed';
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

  const submitForm = async () => {
    arg.onSubmit({
      apiKey,
      googleAuth,
      systemMsg
    });
    const parsedGoogleAuth = JSON.parse(googleAuth);
    await deep.insert({
      type_id: await deep.id("@deep-foundation/google-speech", "GoogleCloudAuthFile"),
      object: { data: { value: parsedGoogleAuth } },
      in: {
        data: [
          {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: deep.linkId,
          }
        ]
      }
    });
    await deep.insert({
      type_id: await deep.id("@deep-foundation/openai", "ApiKey"),
      string: { data: { value: apiKey } },
      in: {
        data: [
          {
            type_id: await deep.id('@deep-foundation/core', "Contain"),
            from_id: deep.linkId,
          }]
      }
    });
  }

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
            submitForm();
          }}>
            Submit
          </Button>
        </CardBody>
      </Card>
    </>
  );
}
