import { useMemo, useState, useEffect } from "react"

import { mc2factory, classifyCategory } from "../../../../helpers/globals"

import Timer from "../../../../pages/Production/components/Timer"
import TimerLogs from "./TimerLogs"
import { useLoading } from "../../../../context/loading"

import { useTimerContext } from "../context"

export default ({
    editTimer,
    updateTimerAction,
    canOperate,

    city,
    productionTime
}) => {

    const { loading, setLoading } = useLoading()
    const {
        selectedFactories,
        classifyTimer, deleteTimer,
        finedParts, partsLoading, partsLoaded,
    } = useTimerContext()

    const [btnColors, setBtnColors] = useState({})
    const [tableSummary, setTableSummary] = useState({})
    const [items_per_page, setItemsPerPage] = useState(8)
    const [refreshLogs, setRefreshLogs] = useState(false)
    const [updateLogForGlobal, setUpdateLogForGlobal] = useState(0)
    const update = () => {
        const global = Math.random()
        setUpdateLogForGlobal(global)
    }

    return (
        <div>
            {classifyTimer && Object.keys(classifyCategory)?.map((c, index) => {
                return (
                    <div key={`ctimer-container-${index}`}>
                        <div className="products-container row mt-0">
                            <h2 className="text-uppercase col-8">
                                {c} - TIMERS
                            </h2>
                            {(
                                classifyTimer[c]?.length > 0 ? (
                                    <>
                                        <div className="col-xl-12 row p-0 m-0 timer-components">
                                            {classifyTimer[c].map((timer, idx) => {
                                                const mc = timer.machine[0].machineClass
                                                return (
                                                    <Timer
                                                        {...timer}
                                                        key={`timer1-${timer._id}`}
                                                        idx={idx}
                                                        editTimer={editTimer}
                                                        parts={mc ? finedParts[mc] : []}
                                                        partsLoading={mc ? (partsLoading[mc] || !partsLoaded[mc]) : true}
                                                        updateTimerAction={updateTimerAction}
                                                        setLoading={setLoading}
                                                        btnColors={btnColors}
                                                        canOperate={canOperate}
                                                    />
                                                )
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                fontSize: "20px",
                                            }}
                                        >
                                            {" "}
                                            {loading
                                                ? "Loading the timers..."
                                                : "No timer with " +
                                                (c) +
                                                (c == "Not Assigned" ? "" : ". Please add the timer.")}{" "}
                                        </div>
                                    </>
                                )
                            )
                            }
                        </div>
                        {classifyTimer[c]?.length > 0 ? (
                            <div className="timerlog-table-container mt-4">
                                <TimerLogs
                                    city={city}
                                    machineClass={null}
                                    filteredParts={[]}
                                    refreshLogs={refreshLogs}
                                    timers={classifyTimer[c]}
                                    afterRefresh={() => setRefreshLogs(false)}
                                    classify={c}
                                    productionTime={productionTime}
                                    index={index}
                                    setItemsPerPage={setItemsPerPage}
                                    items_per_page={items_per_page}
                                    setLoading={setLoading}
                                    tableSummary={tableSummary}
                                    setTableSummary={setTableSummary}
                                    setBtnColors={setBtnColors}
                                    btnColors={btnColors}
                                    setUpdateLogForGlobal={setUpdateLogForGlobal}
                                    updateLogForGlobal={updateLogForGlobal}
                                    update={update}
                                />
                            </div>
                        ) : ""}
                    </div>
                )
            })}
        </div>
    )
}