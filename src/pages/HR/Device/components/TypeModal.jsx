import React, { useMemo } from "react";

import { useState, useEffect } from "react";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { createModal } from "react-modal-promise";

import { useLoading } from "context/loading";
import Toggle from './Toggle.component.jsx'
import './switch.scss'

const MyBootstrapModal = ({
    isOpen,
    onResolve,
    onReject,
    item,
    device_types,
    deviceAction,
    openAlert,
}) => {
    // const submit = () => onResolve("resolved!!");
    // const cancel = () => onReject("rejected!!");
    const { loading, setLoading } = useLoading()

    const [input, setInput] = useState({ ...item })
    const [edit, setEdit] = useState(false)

    const reset = () => setInput({ ...item })

    const onChangeField = (e) => {
        const { name, value } = e.target
        setInput({ ...input, [name]: value })
    }

    useEffect(() => {
        if (!edit) {
            reset()
        } else {
            if (input?.id) {
                const type = device_types.find(item => item._id == input?.id)
                setInput(prev => {
                    return {
                        ...prev,
                        name: type?.name || ''
                    }
                })
            } else {
                reset()
            }
        }
    }, [input?.id])

    const availToSave = useMemo(() => {
        return input?.name && input?.name != ''
    }, [input])

    const submit = async () => {
        try {
            if (availToSave) {
                setLoading(true)
                if (edit) {
                    if (!input?.id) throw new Error('Please select one item to edit')
                    const res = await deviceAction.updateDeviceType(input?.id, input)
                    if (res) {
                        onResolve(res)
                    }
                } else {
                    const res = await deviceAction.createDeviceType(input)
                    if (res) {
                        onResolve(res)
                    }
                }
                onReject('Something went wrong')
            }
        } catch (error) {
            openAlert('Error', error.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    const cancel = () => {
        reset()
        onReject('cancelled')
    }

    return (
        <Modal isOpen={isOpen} toggle={cancel}>
            <ModalHeader toggle={cancel}>{!edit ? 'Create Device' : 'Edit Device'}</ModalHeader>
            <ModalBody>
                <div className='form-group'>
                    <Toggle
                        checked={edit}
                        text="Edit"
                        size={'default'}
                        disabled={false}
                        onChange={() => { setEdit(prev => !prev) }}
                        offstyle="btn-danger"
                        onstyle="btn-success"
                    />
                </div>
                {edit && (
                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select onChange={onChangeField} className="form-control" name="id" value={input?.id || ''}>
                            <option value={''} disabled>Select Type</option>
                            {device_types.map((item, index) => (
                                <option key={`device_edit_type_option_${item._id}`} value={item._id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {(!edit || (edit && input?.id)) && (
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input onChange={onChangeField} type="text" className="form-control" name="name" defaultValue={input?.name || ''} />
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button disabled={!availToSave} style={{ backgroundColor: '#B70000', color: 'white' }} onClick={submit}>
                    {`Save`}
                </Button>{" "}
                <Button color="secondary" onClick={cancel}>
                    {`Cancel`}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default createModal(MyBootstrapModal);
