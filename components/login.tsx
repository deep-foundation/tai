import { Card, CardHeader, Heading, CardBody, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";
import { useLocalStore } from "@deep-foundation/store/local";
import { useState } from "react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
export function Setup(arg: {
  onAuthorize: (arg: { gqlPath: string, token: string }) => void,
}) {
  const [gqlPath, setGqlPath] = useLocalStore<string>("gqlPath", "");
  const [token, setToken] = useLocalStore<string>("token", "");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  const deep = useDeep();
  

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
       )
       <Button onClick={() => {
        arg.onAuthorize({
         gqlPath,
         token
        });
       }}>
        Autorize
       </Button>
      </CardBody>
     </Card>
    </>
   );
  }