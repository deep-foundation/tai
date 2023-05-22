import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useState, useEffect } from "react";
import { Setup } from "./login";

export function LoginOrContent({ gqlPath, setGqlPath, children, apiKey, googleAuth, setApiKey, setGoogleAuth, systemMsg, setSystemMsg }: { gqlPath: string | undefined, setGqlPath: (gqlPath: string | undefined) => void, children: JSX.Element, apiKey: string | undefined, setApiKey: (apiKey: string | undefined) => void, googleAuth: string | undefined, setGoogleAuth: (googleAuth: string | undefined) => void, systemMsg: string | undefined, setSystemMsg: (systemMsg: string | undefined) => void}) {
  const deep = useDeep();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGetPermissionPressed, setIsGetPermissionPressed] = useState(false);

  useEffect(() => {
    self["deep"] = deep
    if (deep.linkId !== 0) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [deep]);

  useEffect(() => {
    const isSubmitted = localStorage.getItem('isSubmitted');
    if (isSubmitted === 'true') {
      setIsSubmitted(true);
    }
  }, []);

  console.log({ isAuthorized, gqlPath })
  return isAuthorized && gqlPath && googleAuth && apiKey && systemMsg && isSubmitted ? children : (
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
        setSystemMsg(arg.systemMsg);
        localStorage.setItem('isSubmitted', 'true');
        setIsSubmitted(true);
      }}
    />
  );
}
