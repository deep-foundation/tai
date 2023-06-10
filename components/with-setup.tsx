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
  }, [deep]);

  console.log({ isAuthorized, gqlPath });
  return isAuthorized && gqlPath && googleAuth && apiKey && systemMsg ? (
    renderChildren({deep})
  ) : (
    <Setup
    onAuthorize={(arg)=>{
      console.log({ arg });
      setGqlPath(arg.gqlPath);
      deep.login({
        token: arg.token,
      });
    }}
      onSubmit={(arg) => {
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
  systemMsg: string | undefined;
  setSystemMsg: (systemMsg: string | undefined) => void;
  renderChildren: (param: { deep: DeepClient }) => JSX.Element;
}
