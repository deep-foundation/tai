import { DeepClient, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect } from 'react';
import { Setup } from '../pages/login';

export function WithSetup({
  renderChildren,
  gqlPath,
  setGqlPath,
  apiKey,
  googleAuth,
  setApiKey,
  setGoogleAuth,
  systemMsg,
  setSystemMsg,
}: LoginOrContentParam) {
  const deep = useDeep();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    self['deep'] = deep;
    if (deep.linkId !== 0) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [deep]);

  console.log({ isAuthorized, gqlPath });
  return isAuthorized ? (
    renderChildren({deep})
  ) : (
    <Setup
      onSubmit={(arg) => {
        console.log({ arg });
        setGqlPath("gqlPath");
        deep.login({
          token: "token",
        });
        setApiKey(arg.apiKey);
        setGoogleAuth(arg.googleAuth);
        setSystemMsg(arg.systemMsg);
      }}
    />
  );
}

export interface LoginOrContentParam {
  gqlPath: string | undefined;
  setGqlPath: (gqlPath: string | undefined) => void;
  apiKey: string | undefined;
  setApiKey: (apiKey: string | undefined) => void;
  googleAuth: string | undefined;
  setGoogleAuth: (googleAuth: string | undefined) => void;
  systemMsg: string | undefined;
  setSystemMsg: (systemMsg: string | undefined) => void;
  renderChildren: (param: { deep: DeepClient }) => JSX.Element;
}
