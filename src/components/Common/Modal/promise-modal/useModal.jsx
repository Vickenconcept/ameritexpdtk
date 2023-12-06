import { useEffect, useContext, useCallback } from "react";

import useRouter from "./useRouter";

import ModalContext from "./ModalContext";

export const useModal = (entity, { instanceId, ...params }) => {
  const router = useRouter();

  const { hasInstance, resolveInstance, rejectInstance } = useContext(
    ModalContext
  );

  const create = useCallback(
    (props) => entity({ ...params, ...props, instanceId }),
    [entity, params, instanceId]
  );

  const resolve = useCallback(() => resolveInstance(instanceId), [
    resolveInstance,
    instanceId,
  ]);
  const reject = useCallback(() => rejectInstance(instanceId), [
    rejectInstance,
    instanceId,
  ]);

  useEffect(() => {
    if (router.query[instanceId]) {
      console.log ('Creating Modal', params, instanceId)
      !hasInstance(instanceId) && create();
    } else {
      resolve();
    }
  }, [router.query[instanceId]]);

  return {
    create,
    resolve,
    reject
  };
};
