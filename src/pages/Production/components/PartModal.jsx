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
} from "reactstrap";
import { useState } from "react";

import "../../../components/modal.scss";
import MediaPreview from "./MediaPreview";

import { useNetStatus } from "../../../context/net"

const PartModal = (props) => {
  const { item, createItem, updateItem, toggle, isOpen, id, reload, idx } = props;
  const { isOnline } = useNetStatus()

  const [canSave, setCanSave] = useState(false);

  const onChange = (e) => {
    if (e.target.value.includes("$")) {
      e.target.value = e.target.value.replace("$", "");
    }
    if (e.target.value != "") {
      setCanSave(true);
    }
    updateItem(e.target.name, e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    createItem((res) => { });
    console.log("done");
  };

  const onEdit = async (e) => {
    e.preventDefault();
    toggle()
    props.onEdit(idx)
  }

  return (
    <Modal
      className="spec-modal part-view-modal"
      isOpen={isOpen}
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        <div className="modal-title-caption">DETAILS</div>
        <div className="modal-title-city">{item.city}</div>
      </ModalHeader>
      <ModalBody>
        <h3 className="name">{item.name}</h3>
        <form id="part-form" className="row" onSubmit={onSubmit}>
          <input type="hidden" name="city" value={item.city} />
          <input type="hidden" name="preview" value={item.preview} />
          <div className={"col-md-6 col-sm-12"}>
            <div className="flex info-rows">
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle" style={{ paddingBottom: "5px" }}>
                  FACTORY
                </h5>
                <h5 className="col-5 content" style={{ paddingBottom: "5px" }}>
                  {item.factory}
                </h5>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle">MACHINE/PROCESS</h5>
                <h5 className="col-5 content">{item.machineClass}</h5>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle">AVERAGE TIME PER CYCLE</h5>
                <h5 className="col-5 content">{item.avgTime}</h5>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle">WEIGHT IN POUND</h5>
                <h5 className="col-5 content">{item.pounds}</h5>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle">Finish Good Weight</h5>
                <h5 className="col-5 content">{item.finishGoodWeight}</h5>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle">Cage Weight Scrap</h5>
                <h5 className="col-5 content">{item.cageWeightScrap}</h5>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle">Cage Weight Actual</h5>
                <h5 className="col-5 content">{item.cageWeightActuals}</h5>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle" style={{ color: "#b56c0b" }}>
                  In Inventory
                </h5>
                <div className="col-5 content">
                  <input
                    type="number"
                    value={item.inventory || 0}
                    name="inventory"
                    onChange={onChange}
                    disabled={!isOnline}
                  />
                </div>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle" style={{ paddingTop: "2px" }}>
                  Cost to Manufacture
                </h5>
                <div className="col-5 content money-input-container" style={{ paddingTop: "2px" }}>
                  <input
                    type="number"
                    value={item.costToManufacture || 0}
                    name="costToManufacture"
                    onChange={onChange}
                    disabled={!isOnline}
                  />
                  <span className="suffix">$</span>
                </div>
              </div>
              <div className="row" style={{ display: "flex" }}>
                <h5 className="col-7 subtitle" style={{ paddingTop: "5px" }}>
                  Top Sell Price
                </h5>
                <div className="col-5 content money-input-container" style={{ paddingTop: "5px" }}>
                  <input
                    type="number"
                    value={item.topSellPrice || 0}
                    name="topSellPrice"
                    onChange={onChange}
                    disabled={!isOnline}
                  />
                  <span className="suffix">$</span>
                </div>
              </div>
            </div>
          </div>
          {/* {getMediaType(item.preview) != null &&  */}
          <div
            className="col-md-6 col-sm-12 d-flex flex-column"
            style={{ minHeight: "100%" }}
          >
            <MediaPreview updateItem={updateItem} reload={reload} preview={item.preview} media={item.media} id={id} city={item.city} type="Part" toggle={toggle} />
          </div>
          {/* =} */}
        </form>
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-primary text-white" onClick={onSubmit} disabled={!isOnline || !canSave}>
          Save
        </button>
        <button className="btn btn-info text-white" onClick={onEdit} disabled={!isOnline}>Edit</button>
        <button className="btn btn-secondary text-white" onClick={props.toggle}>
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PartModal;
