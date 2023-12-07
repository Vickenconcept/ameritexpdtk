import { useState, useMemo, useCallback, useEffect, useRef, forwardRef } from "react"
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, Label } from 'reactstrap'
import {
    FactoryList,
    MachineClassSelect,
} from "../../../components/Common/Select"
import AutoCompleteSelect from "../../../components/Common/AutoCompleteSelect"
import Select from "react-select"
import { useTimerContext } from "../context"

export default forwardRef(({
    open,
    toggleModal,
    city,
    // part,
    // newTimer,
    // timerPart,
    // updateNewTimer,
    // parts : globalParts = {},
    // partsLoaded : globalPartsLoaded = {},
    // partsLoading : globalPartsLoading = {},
    edit = false,
    activeFactories,
    canAllFactories,
    createTimer,
    // onCancel
}, ref)=> {

    const {
        machines,
        machinesLoading,
        parts: globalParts, 
        partsLoaded: globalPartsLoaded, 
        partsLoading: globalPartsLoading 
    } = useTimerContext()

    const initItem = {
        factory: "",
        machineClass: "",
        part: "",
        machine: "",
        weight: "",
        productionTime: "",
    }

    const selectRef = useRef(null)
    const [item, setItem] = useState(initItem)
    const [part, setPart] = useState(null)

    useEffect (()=>{
        setPart(null)
        setItem(initItem)
    },[open])

    const updateItem = (f, e) => {
        setItem({
            ...item,
            [f]: e.target ? e.target.value : e,
            part: "",
        })
    }

    useEffect(() => {
        console.log ('factory and machineclass is changed')
        setPart(null)
        if (!item.factory || item.factory == "") {
            return setItem({
                factory: "",
                machineClass: "",
                part: "",
                machine: "",
                weight: "",
                productionTime: "",
            })
        }
        if (!item.machineClass || item.machineClass == "") {
            return setItem({
                ...item,
                machineClass: "",
                part: "",
                machine: "",
                weight: "",
                productionTime: "",
            })
        }
        else {
            return setItem({
                ...item,
                part: "",
                machine: "",
                weight: "",
                productionTime: "",
            })
        }
    }, [
        item.factory,
        item.machineClass,
        // item.part,
        // item.machine,
    ])

    const parts = useMemo(() => {
        console.log("PARTS", globalParts, item.factory, item.machineClass, globalPartsLoaded)
        if (!globalParts || !item.factory || !item.machineClass || !globalPartsLoaded) return []
        if (!globalParts[item.machineClass]) return []
        return globalParts[item.machineClass].filter(
            p =>
                p.factory == item.factory &&
                p.machineClass == item.machineClass
        )
    }, [globalParts, item.factory, item.machineClass])

    const partsLoading = useMemo(() => {
        if (!globalPartsLoading) return false
        if (!item.factory || !item.machineClass) return false
        return globalPartsLoading[item.machineClass] ? true : false
    }, [globalPartsLoading, item.machineClass])

    useEffect (()=>{
        console.log ('part changed', item.part, part)
        
        if (selectRef.current) {
            console.log(selectRef.current)
            // selectRef.current.select.clearValue()
        }

        if (!part || !part._id || part._id == "") {
            if (selectRef.current) {
                selectRef.current.clearAll()
            }
            setItem (prev=>({...prev, part: ""}))
        } else {
            setItem (prev=>({...prev, part: part._id}))
        }
        // if (!item.part || item.part == "") setPart (null)
        // else if (parts && parts.length > 0) setPart(parts.find(p => p._id == item.part))
        // else setPart (null)
    },[item.part, part])

    const partChanged = (e) => {
        console.log('part changed to', e)
        setPart(e)
        setItem(prev=>{
            return ({
                ...prev,
                part: e ? e._id : "",
                weight: e?.pounds,
                productionTime: e?.avgTime,
            })
        })
    }

    const onSave = useCallback(() => {
        createTimer(item)
    }, [item])

    const onCancel = useCallback(() => {
        toggleModal()
    }, [])

    const filteredMachines = useMemo(() => {
        if (!item.factory || !item.machineClass || !machines || machinesLoading) return []
        return machines.filter(
            m =>
                m.factory == item.factory &&
                m.machineClass == item.machineClass
        )
    }, [item.factory, item.machineClass, machines, machinesLoading])

    const enabled = useMemo(() => {
        const tmp = (
            item.factory != null &&
            item.machineClass != null &&
            item.part != null &&
            item.machine != null &&
            item.factory != "" &&
            item.machineClass != "" &&
            item.part != "" &&
            item.machine != ""
        )
        if (!tmp) console.log (tmp, item)
        return tmp
    }, [item])

    useEffect (()=>{console.log (selectRef)},[selectRef])

    return (
        <Modal
            isOpen={open}
            toggle={toggleModal}
            className="spec-modal timer-modal"
            ref={ref}
        >
            <ModalHeader toggle={toggleModal}>
                <div className="modal-title-caption">
                    {edit ? "EDIT TIMER/PROCESS" : "NEW TIMER/PROCESS"}
                </div>
                <div className="modal-title-city">{city}</div>
            </ModalHeader>
            <ModalBody>
                <Form id="timer-form" className="input-form">
                    <input type="hidden" name="city" value={city} />

                    <div className="row general">
                        <Label className="col-label">Factory</Label>
                        <div className="col-input">
                            <FactoryList
                                onChange={e => updateItem("factory", e)}
                                value={item.factory}
                                placeholder="Factory"
                                activeFactories={activeFactories}
                                allowAll={canAllFactories}
                            />
                        </div>
                    </div>

                    <div className="row general">
                        <Label className="col-label">Machine Class</Label>
                        <div className="col-input">
                            <MachineClassSelect
                                onChange={e => updateItem("machineClass", e)}
                                value={item.machineClass}
                                placeholder="Machine Class"
                                factory={item.factory}
                                disabled={(item.factory && item.factory != "") ? false : true}
                            />
                        </div>
                    </div>

                    <div className="row general">
                        <Label className="col-label">Machine/Process</Label>
                        <div className="col-input">
                            <select
                                className="form-select"
                                name="machine"
                                onChange={e => updateItem("machine", e)}
                                value={item.machine}
                                disabled={(machinesLoading || !(filteredMachines?.length > 0)) ? true : false}
                            >
                                <option value="" disabled>
                                    Machine
                                </option>
                                {filteredMachines.map(m => (
                                    <option value={m._id} key={"machine1-" + m._id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row general">
                        <Label className="col-label">Part</Label>
                        <div className="col-input">
                            <AutoCompleteSelect
                                ref={selectRef}
                                disabled={(item.factory && item.factory != "" && item.machineClass && item.machineClass != "") ? false : true}
                                timerChangePart="true"
                                option={null}
                                placeholder={part && part[0] && part[0].name}
                                options={parts}
                                onChange={v => {
                                    partChanged(v)
                                }}
                                loading={partsLoading}
                            />
                        </div>
                    </div>

                    <div className="d-flex flex-row divider-part">
                        <Label>Timer/Auto Details</Label>
                        <div className="divider">
                            <hr />
                        </div>
                    </div>

                    <div className="small-part-container">
                        <div className="d-flex justify-content-between">
                            <div className="small-part">
                                <div className="d-flex flex-column justify-content-center">
                                    <Label className="text-center small">
                                        Average Time Per Cycle
                                    </Label>
                                    <input
                                        className="form-control"
                                        readOnly
                                        name="productionTime"
                                        type="number"
                                        value={(part && part.avgTime) || ""}
                                        style={{ width: "190px" }}
                                    />
                                </div>
                            </div>
                            <div className="small-part">
                                <div className="d-flex flex-column justify-content-center">
                                    <Label className="text-center small">Weight In Tons</Label>
                                    <input
                                        className="form-control"
                                        readOnly
                                        type="number"
                                        name="weight"
                                        value={(part && part.pounds) || ""}
                                        style={{ width: "130px" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={onSave} disabled={!enabled}>
                    Add
                </Button>{" "}
                <Button color="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    )
})