import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useLocalStore } from "@deep-foundation/store/local";
import { useState } from "react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
export function Setup(arg: {
  onAuthorize: (arg: { gqlPath: string, token: string }) => void,
  onSubmit: (arg: { systemMsg: string  }) => void
}) {
  const [gqlPath, setGqlPath] = useLocalStore<string>("gqlPath", "");
  const [token, setToken] = useLocalStore<string>("token", "");
  const [apiKey, setApiKey] = useState<string>("");
  const [googleAuth, setGoogleAuth] = useState<string>("");
  const [systemMsg, setSystemMsg] = useLocalStore<string>("systemMsg", "");

  const deep = useDeep();
  
  const submitForm = async () => {
      arg.onSubmit({
        systemMsg
      });
      const apiKeyTypeLinkId = await deep.id("@deep-foundation/openai", "ApiKey");
      const googleCloudAuthKeyTypeLink = await deep.id("@deep-foundation/google-speech", "GoogleCloudAuthFile");
      const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");

      const { data: checkApiKeyLink } = await deep.select({
        type_id: apiKeyTypeLinkId,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });

      console.log("checkApiKeyLink", checkApiKeyLink);

      if (!checkApiKeyLink || checkApiKeyLink.length === 0) {
        const { data: [{ id: apiKeyLinkId }] } = await deep.insert({
          type_id: apiKeyTypeLinkId,
          string: { data: { value: apiKey } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            },
          },
        });

        console.log("apiKeyLinkId", apiKeyLinkId);
      }

      const { data: checkGoogleAuthLink } = await deep.select({
        type_id: googleCloudAuthKeyTypeLink,
        in: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      });

      console.log("checkGoogleAuthLink", checkGoogleAuthLink);

      if (!checkGoogleAuthLink || checkGoogleAuthLink.length === 0) {
        const parsedGoogleAuth = JSON.parse(googleAuth);
        const { data: [{ id: googleAuthLinkId }] } = await deep.insert({
          type_id: googleCloudAuthKeyTypeLink,
          object: { data: { value: parsedGoogleAuth } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: deep.linkId,
            },
          },
        });

        console.log("googleAuthLinkId", googleAuthLinkId);
      }
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
            arg.onAuthorize({
              gqlPath,
              token
            });
          }}>
            Autorize
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
