import { connect } from "react-redux"
import {Modal, ModalHeader, ModalBody, ModalFooter, Button} from "reactstrap"

const TimerModal = ({
    editModal, toggleEditModal,
    editingTimer, setEditingTimer,
    setPartsModal,
    saveTimer,
    user,
}) => {

    return (
        <Modal isOpen={editModal} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal}>
            {!editingTimer.machine ? "" : editingTimer.machine.name} Timer Details
            <small style={{ position: "absolute", right: "3em" }}>
            Created by{" "}
            <code style={{ fontSize: "initial" }}>
                {editingTimer.created_by && editingTimer.created_by.length
                ? editingTimer.created_by[0].firstName +
                    editingTimer.created_by[0].lastName
                : ""}
            </code>
            </small>
        </ModalHeader>
        <ModalBody>
            <form id="timer-form">
            <div className="row mt-3 d-flex align-items-center">
                <div className="col-4" style={{ textAlign: "right" }}>
                Part/Product Name:
                </div>
                <div className="col-8">
                {/* <input value={part && part.pounds} type="number" className="form-control" /> */}
                {!editingTimer.part ? (
                    <a href={"/production/list/"}>EDIT PART</a>
                ) : (
                    editingTimer.part[0].name
                )}
                </div>
            </div>
            <div className="row mt-3 d-flex align-items-center">
                <div className="col-4" style={{ textAlign: "right" }}>
                Weight(lbs):
                </div>
                <div className="col-8">
                {/* <input value={part && part.pounds} type="number" className="form-control" /> */}
                {!editingTimer.part ? "" : editingTimer.part[0].pounds}
                </div>
            </div>

            <div className="row mt-3 d-flex align-items-center">
                <div className="col-4" style={{ textAlign: "right" }}>
                Production Time:
                </div>
                <div className="col-8">
                {/* <input value={part && part.avgTime} type="number" className="form-control" /> */}
                {!editingTimer.part ? "" : editingTimer.part[0].avgTime} s
                </div>
            </div>

            <div className="row mt-3 d-flex align-items-center">
                <div className="col-4" style={{ textAlign: "right" }}>
                Operator Name:
                </div>
                <div className="col-8">
                <input
                    value={editingTimer.operator || ""}
                    className="form-control"
                    onChange={v => {
                    v = v.target.value
                    setEditingTimer(editingTimer => ({ ...editingTimer, operator: v }))
                    }}
                />
                </div>
            </div>
            </form>
        </ModalBody>
        <ModalFooter style={{ justifyContent: "space-around" }}>
            {user.role == "Personnel" || user.role == "Accounting" ? (
            ""
            ) : (
            <Button
                color="warning"
                onClick={() => {
                    setPartsModal(true)
                    toggleEditModal()
                }}
            >
                Edit
            </Button>
            )}{" "}
            <Button color="primary" onClick={saveTimer}>
            Save
            </Button>{" "}
            <Button color="secondary" onClick={toggleEditModal}>
            Cancel
            </Button>
        </ModalFooter>
        </Modal>
    )
}

export default connect(state => {
    return {
        user: state.Login.user,
    }
}, {})(TimerModal)
