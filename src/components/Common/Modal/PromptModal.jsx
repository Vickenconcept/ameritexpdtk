import React from "react";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from "reactstrap";
import { createModal } from "react-modal-promise";

const MyBootstrapModal = ({ isOpen, onResolve, onReject, text, title, confirmText, cancelText, value }) => {
  
    const [input, setInput] = React.useState(value||"");

    const onChangeInput = (e) => {
        setInput(e.target.value);
    }

    const submit = React.useCallback(() => onResolve(input), [input]);
    const cancel = () => onReject(null);

    return (
        <Modal isOpen={isOpen} toggle={cancel}>
            <ModalHeader toggle={cancel}>{title}</ModalHeader>
            <ModalBody>
                {text}
                <Input type='text' onChange={onChangeInput} value={input || ""} name='input' />
            </ModalBody>
            <ModalFooter>
                <Button style={{backgroundColor:'#B70000', color:'white'}} onClick={submit}>
                {confirmText||`Confirm`}
                </Button>{" "}
                <Button color="secondary" onClick={cancel}>
                {cancelText||`Cancel`}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export const PromptModal = createModal(MyBootstrapModal);
