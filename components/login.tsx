import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useState } from "react";
import { StoreProvider } from './store-provider';
import { useLocalStore } from "@deep-foundation/store/local";

export function Setup(arg: { onSubmit: (arg: { gqlPath: string, token: string , apiKey: string, googleAuth:string }) => void }) {
  // const defaultGqlPath = "3006-deepfoundation-dev-mst16p4n7jz.ws-eu96b.gitpod.io/gql";
  // const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4iLCJ4LWhhc3VyYS11c2VyLWlkIjoiMzc4In0sImlhdCI6MTY4MzQ4MDUyMH0.rp9HzhnRMEA-hKf_2aReoJvBI6aSlItNSQ-cop58w5U";

  const [gqlPath, setGqlPath] = useLocalStore("gqlPath", undefined);
  const [token, setToken] = useLocalStore("token", undefined);
  const [apiKey, setApiKey] = useLocalStore("apikey", undefined);
  const [googleAuth, setGoogleAuth] = useLocalStore("googleAuth", undefined);
  return <Card>
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
      <Button onClick={() => {
        arg.onSubmit({
          gqlPath,
          token,
          apiKey,
          googleAuth
        })
      }}>
        Submit
      </Button>
    </CardBody>
  </Card>
}