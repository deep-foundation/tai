import { DeepClient, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useState, useEffect } from 'react';
import { Setup } from './login';

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

    if (!isAuthorized) {
      setGqlPath(process.env.NEXT_PUBLIC_GQL_PATH);
      deep.login({
        token: process.env.NEXT_PUBLIC_TOKEN,
      });
    }
  }, [deep, isAuthorized, gqlPath, apiKey, googleAuth, systemMsg]);

  return isAuthorized ? (
    renderChildren({deep})
  ) : null;
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
