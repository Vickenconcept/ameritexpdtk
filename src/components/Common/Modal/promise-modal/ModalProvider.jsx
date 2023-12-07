import React, { useRef } from "react";
// import qs from "query-string";

import ModalContainer from "react-modal-promise";

import ModalContext from "./ModalContext";
import useRouter from "./useRouter";

const ModalProvider = ({ children }) => {
  const router = useRouter();
  const ref = useRef(null);

  const hasInstance = (id) => ref.current.hasInstance(id);
  const resolveInstance = (id) => ref.current.resolve(id);
  const rejectInstance = (id) => ref.current.reject(id);

  const onOpen = (id, instance) => {
    if (instance.props.controlled || instance.props.instanceId) {
      router.push({
        pathname: router.location.pathname,
        search: qs.stringify({
          ...router.query,
          [id]: "open"
        })
      });
    }
  };

  const onRemove = (id) => {
    const { [id]: _, ...query } = router.query;

    console.log ('onRemove modal', id)

    router.push({
      pathname: router.location.pathname,
      search: qs.stringify(query)
    });
  };

  return (
    <ModalContext.Provider
      value={{ hasInstance, resolveInstance, rejectInstance }}
    >
      <ModalContainer
        onOpen={onOpen}
        onRemove={onRemove}
        ref={ref}
        isAppendIntances
      />
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
