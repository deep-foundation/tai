import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useState, useEffect } from "react";
import { Setup } from "./login";

export function LoginOrContent({ gqlPath, setGqlPath, children, apiKey, googleAuth, setApiKey, setGoogleAuth, systemMsg, setSystemMsg }: { gqlPath: string | undefined, setGqlPath: (gqlPath: string | undefined) => void, children: JSX.Element, apiKey: string | undefined, setApiKey: (apiKey: string | undefined) => void, googleAuth: string | undefined, setGoogleAuth: (googleAuth: string | undefined) => void, systemMsg: string | undefined, setSystemMsg: (systemMsg: string | undefined) => void }) {
  const deep = useDeep();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    self["deep"] = deep
    if (deep.linkId !== 0) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [deep]);

  console.log({ isAuthorized, gqlPath })
  return isAuthorized && gqlPath && googleAuth && apiKey && systemMsg ? children : (
    <Setup
      onSubmit={(arg) => {
        console.log({ arg })
        setGqlPath(arg.gqlPath);
        deep.login({
          token: arg.token
        })
        setApiKey(arg.apiKey);
        setGoogleAuth(arg.googleAuth);
        setSystemMsg(arg.systemMsg);
      }}
    />
  );
}
