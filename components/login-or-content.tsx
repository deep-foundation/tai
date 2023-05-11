import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useState, useEffect } from "react";
import { Setup } from "./login";

export function LoginOrContent({ gqlPath, setGqlPath, children,apiKey,googleAuth,setApiKey,setGoogleAuth }: { gqlPath: string | undefined, setGqlPath: (gqlPath: string | undefined) => void, children: JSX.Element, apiKey: string|undefined,setApiKey: (apiKey: string | undefined)=>void, googleAuth:string|undefined,setGoogleAuth: (googleAuth: string | undefined)=>void }) {
  const deep = useDeep();
  const [isAuthorized, setIsAuthorized] = useState(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);


  useEffect(() => {
    self["deep"] = deep
    if (deep.linkId !== 0) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [deep]);

  console.log({ isAuthorized, gqlPath })
  return isAuthorized && gqlPath && isSubmitted ? children : (
    <Setup
      onAuthorize={(arg) => {
        console.log({ arg })
        setGqlPath(arg.gqlPath);
        deep.login({
          token: arg.token
        })
      }}
      
      onSubmit={(arg) => {
        setApiKey(arg.apiKey);
        setGoogleAuth(arg.googleAuth);
        setIsSubmitted(true);
      }}
    />
  );
}