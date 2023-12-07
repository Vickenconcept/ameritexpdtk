// import React from "react";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { createModal } from "react-modal-promise";

const MyBootstrapModal = ({ isOpen, onResolve, onReject, text, title, confirmText, cancelText }) => {
  const submit = () => onResolve("resolved!!");
  const cancel = () => onReject("rejected!!");

  return (
    <Modal isOpen={isOpen} toggle={cancel}>
      <ModalHeader toggle={cancel}>{title}</ModalHeader>
      <ModalBody>{text}</ModalBody>
      <ModalFooter>
        <Button style={{ backgroundColor: '#B70000', color: 'white' }} onClick={submit}>
          {confirmText || `Confirm`}
        </Button>{" "}
        <Button color="secondary" onClick={cancel}>
          {cancelText || `Cancel`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export const ConfirmModal = createModal(MyBootstrapModal);
