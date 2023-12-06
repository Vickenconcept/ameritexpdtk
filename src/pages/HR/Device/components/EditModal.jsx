import React, { useContext, useMemo } from "react";

import { useState, useEffect } from "react";
import moment from "moment";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { createModal } from "react-modal-promise";

import { useLoading } from "context/loading";
import "components/modal.scss"
import { connect } from "react-redux"

import { cities } from "helpers/globals";
import ImageUploader from "./ImageUploader";

const MyBootstrapModal = ({ isOpen, onResolve, onReject, edit, item, device_types, deviceAction, openAlert, user }) => {
    const [input, setInput] = useState({...item, type: item?.type?._id || item?.type || ''})
    const reset = () => setInput({...item})

    const {loading, setLoading} = useLoading()

    const onChangeField = (e) => {
        const { name, value } = e.target
        setInput({ ...input, [name]: value })
    }

    const availToSave = useMemo(() => {
        return input?.type
        // && input?.city 
        && input?.sn 
        && input?.name
    },[input])

    const [image, setImage] = useState()

    const submit = async () => {
        try {
        if (availToSave) {
            setLoading (true)
            const formData = new FormData()
            formData.append('type', input.type?._id || input.type)
            // formData.append('city', input.city)
            formData.append('sn', input.sn)
            formData.append('name', input.name)
            formData.append('note', input.note)

            if (image) {
                formData.append('photo', image)
            }

            if (edit) {
                const res = await deviceAction.updateDevice(item?._id,formData)
                setLoading (false)
                return onResolve(res)
            } else {
                const res = await deviceAction.createDevice(formData)
                setLoading (false)
                return onResolve(res)
            }
        }
        } catch (error) {
            setLoading (false)
            openAlert ('Error', error.response?.data?.error || error.message)
        }
    }

    const cancel = () => {
        reset()
        onReject('canceled')
    }

    return (
        <Modal isOpen={isOpen} toggle={cancel} className="spec-modal device-modal">
            <ModalHeader toggle={cancel}>
                <div className="modal-title-caption">
                    {!edit?'Add':'Edit'}
                </div>
                <div className="modal-title-city">
                    {'Device'}
                </div>
            </ModalHeader>
            <ModalBody >
                <div className="input-form">
                    <div className="row general">
                        <label className="col-label" htmlFor="type">Device Type</label>
                        <select onChange={onChangeField} className="col-input" name="type" value={input?.type || input?.type?._id || ''}>
                            <option value={''} disabled>Select Type</option>
                            {device_types?.map((item, index) => (
                                <option key={`device_edit_type_option_${item._id}`} value={item._id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* <div className="form-group">
                        <label htmlFor="city">Location</label>
                        <select onChange={onChangeField} className="col-input" name="city" value={input?.city || ''}>
                            <option value={''} disabled>Select city</option>
                            {cities.map((item, index) => (
                                <option key={`device_edit_city_option_${item}`} value={item}>{item}</option>
                            ))}
                        </select>
                    </div> */}
                    <div className="row general">
                        <label htmlFor="name" className="col-label">Device Name</label>
                        <input maxLength={12} onChange={onChangeField} type="text" className="col-input" name="name" value={input?.name || ''} />
                    </div>
                    <div className="row general">
                        <label className="col-label" htmlFor="sn">Serial</label>
                        <input maxLength={12} onChange={onChangeField} type="text" className="col-input" name="sn" value={input?.sn || ''} />
                    </div>
                    <div className="row general">
                        <label className="col-label" htmlFor="sn">Last Updated</label>
                        <input type={'datetime-local'} onChange={onChangeField} className="col-input" name="lastUpdate" value={input?.lastUpdate ? moment(input.lastUpdate).format('YYYY-MM-DDTHH:mm:ss') : ''} />
                    </div>
                    <div className="row general">
                        <label className="col-label" htmlFor="note">Description</label>
                        <textarea multiple={true} maxLength={150} onChange={onChangeField} type="text" className="col-input multiline" name="note" >{input?.note || ''}</textarea>
                    </div>
                    <div className="row general">
                        <label className="col-label" htmlFor="note">Added By</label>
                        {/* <input type="text" className="col-input" name="created_by" value={} disabled={true} /> */}
                        <div className="col-input fake">
                            {item?.created_by ? `${item.created_by.firstName} ${item.created_by.lastName}` :  `${user.firstName} ${user.lastName}`}
                        </div>
                    </div>
                    {/* <div className="row general">
                        <label htmlFor="image">Image</label>
                        <ImageUploader url={item?.image} onChange={(obj)=>{setImage (obj)}} name="image" defaultValue={input?.image || ''} />
                    </div> */}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button style={{backgroundColor:'#B70000', color:'white'}} className="btn-primary" onClick={() => submit()} disabled={!availToSave} >
                {`Save`}
                </Button>{" "}
                <Button color="secondary" onClick={()=>cancel()}>
                {`Cancel`}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const mapStatetoProps = state => {
    const user = state.Login.user
    return { user }
}

export const EditModal = createModal(connect(mapStatetoProps, {})(MyBootstrapModal));
