import {
    Container,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Row,
    Col,
    Card,
    Label,
} from "reactstrap"
import { useEffect } from "react";

import "components//modal.scss"
import MediaPreview from "./MediaPreview";

import {useNetStatus} from "../../../context/net"

const PartModal = (props) => {
    const {item, id, reload, toggle, updateItem, createItem, idx } = props;
    const {isOnline} = useNetStatus()

    const onSubmit = async (e) => {
        e.preventDefault();
        createItem((res) => {});
        console.log("done");
    };

    const onEdit = async (e) => {
        e.preventDefault();
        toggle()
        props.onEdit(idx)
    }

    return (
        <Modal className="spec-modal machine-view-modal" 
            isOpen={props.isOpen} 
            toggle={props.toggle}
        >
            <ModalHeader toggle={props.toggle}>
                <div className="modal-title-caption">
                DETAILS
                </div>
                <div className="modal-title-city">
                {item.city}
                </div>
            </ModalHeader>
            <ModalBody>
            <div className="row">
                <h3 className="name">{item.name}</h3>
                <form id="machine-form">
                    <input type="hidden" name="city" value={item.city} />
                    <input type="hidden" name="preview" value={item.preview} />
                </form>
                <div className={"col-md-6 col-sm-12"}>
                    <div className="flex info-rows">
                        <div className="row align-items-center" style={{display:"flex"}}>
                            <h5 className="col-7 subtitle">FACTORY</h5>
                            <h5 className="col-5 content">{item.factory}</h5>
                        </div>
                        <div className="row align-items-center" style={{display:"flex"}}>
                            <h5 className="col-7 subtitle">MACHINE/PROCESS</h5>
                            <h5 className="col-5 content">{item.machineClass}</h5>
                        </div>
                        {/* <div className="row align-items-center" style={{display:"flex"}}>
                            <h5 className="col-4 text-success">WEIGHT</h5>
                            <h4 className="col-8">{item.weight}</h4>
                        </div>
                        <hr style={{margin:"3px 0"}}/>
                        <div className="row align-items-center" style={{display:"flex"}}>
                            <h5 className="col-4 text-success">PRODUCTION TIME</h5>
                            <h4 className="col-8">{item.productionTime}</h4>
                        </div> */}
                        <hr style={{margin:"3px 0"}}/>
                        <div className="row align-items-center" style={{display:"flex"}}>
                            <h4>Description</h4>
                            <h6 className="col-12">{item.details}</h6>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-sm-12 d-flex flex-column" style={{minHeight:'100%'}}>
                    <MediaPreview updateItem={updateItem} reload={reload} preview={item.preview} media={item.media} id={id} city={item.city} type="Machine" toggle={toggle} />
                </div>
            </div>
            </ModalBody>
            <ModalFooter>
            <button className="btn btn-primary text-white" onClick={onSubmit} disabled={!isOnline}>Save</button>
            <button className="btn btn-info text-white" onClick={onEdit} disabled={!isOnline}>Edit</button>
            <button className="btn btn-secondary text-white" onClick={props.toggle}>Close</button>
            </ModalFooter>
        </Modal>
    )
}

export default PartModal;
