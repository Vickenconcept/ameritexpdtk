import "./report.scss"

export default (props) => {
    const { 
      formatSeconds, 
      filters, 
      sortTable, 
      logs, 
      resultCount, 
      page, 
      setPage,
      items_per_page,
      reportBtnColor, 
      totalGain, 
      totalLoss, 
      totalFloat,
      totalTons,
      machine,
      forToday,
      onClickReport,
    } = props

    return (
      <div className="timer-log-table">
      <div className="time-tracker-table">
        <table className="w-100 table table-nowrap mb-0" id="jobstable">
            <thead className="">
              <tr>
                <th
                  style={{ paddingLeft: "16px", width: 88 }}
                  onClick={() => sortTable("name", jobs)}
                >
                  CYCLE
                </th>
                <th>DATE</th>
                <th className="">PART/PRODUCT</th>
                <th>OPERATOR</th>
                <th>ID</th>
                <th style={{ width: "50px" }}>STATUS</th>
                <th style={{ width: "100" }}>TIME</th>
                <th style={{ width: "50px" }}>STOP REASON</th>
              </tr>
            </thead>

            <tbody style={{ minHeight: "200px" }}>
              {filters.includeCycle
                ? logs.map((trackTimer, index) => (
                    <tr key={index} style={{ height: "63px" }}>
                      <td style={{ paddingLeft: "24px" }}>
                        <div className="d-flex align-items-center">
                          <b className="name">
                            {resultCount -
                              (page - 1) * items_per_page -
                              index >
                            0
                              ? resultCount -
                                (page - 1) * items_per_page -
                                index
                              : ""}
                          </b>
                        </div>
                      </td>
                      <td className="">
                        <div>
                          <div>
                            <b className="name">
                              {trackTimer.startTime
                                ? new Date(
                                    new Date(trackTimer.startTime) -
                                      1000 * 5 * 3600
                                  )
                                    .toISOString()
                                    .substring(0, 10)
                                : ""}
                            </b>
                          </div>
                          <div className="text-secondary">
                            {trackTimer.startTime
                              ? new Date(
                                  new Date(trackTimer.startTime) -
                                    1000 * 5 * 3600
                                )
                                  .toISOString()
                                  .substring(11, 19)
                              : ""}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="name" style={{ width: "288px" }}>
                          <b>{trackTimer.part ? trackTimer.part[0] ? trackTimer.part[0].name : trackTimer.part.name : ""}</b>
                        </div>
                      </td>
                      <td className="name">
                        <div>
                          <b>{trackTimer.operator}</b>
                        </div>
                      </td>
                      <td>{trackTimer.id}</td>
                      <td>
                        <div>
                          {resultCount -
                            (page - 1) * items_per_page -
                            index >
                            0 && (
                            <b
                              className={`${
                                trackTimer.time > trackTimer.productionTime
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {trackTimer.time > trackTimer.productionTime
                                ? "LOSS"
                                : "GAIN"}
                            </b>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          {resultCount -
                            (page - 1) * items_per_page -
                            index >
                            0 && (
                            <b
                              className={`${
                                trackTimer.time > trackTimer.productionTime
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {formatSeconds(
                                (new Date(trackTimer.endTime) -
                                  new Date(trackTimer.startTime)) /
                                  1000
                              )}
                            </b>
                          )}
                        </div>
                      </td>
                      <td>{trackTimer.stoppingReason}</td>
                      <td className="position-relative">
                        <b className="position-absolute three-dot-icon-end">
                          <i
                            className="mdi mdi-dots-vertical cursor-pointer"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            id={"expEdit" + index}
                          ></i>
                          {/* <div
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby={"expEdit" + index}
                          >
                            <div className="dropdown-item p-4 py-2 cursor-pointer">
                              Stop
                            </div>
                            <div className="dropdown-item p-4 py-2 cursor-pointer">
                              Start
                            </div>
                          </div> */}
                        </b>
                      </td>
                    </tr>
                  ))
                : ""}
            </tbody>
        </table>
      </div>
      <div
        className="border-0 pagination py-2 d-flex align-items-center"
        style={{ borderRadius: "10px" }}
      >
        {filters.includeCycle &&
        // Math.ceil(resultCount / items_per_page) ? 
        (
          <>
            <div
              className="pe-0 cursor-pointer"
              style={{ paddingLeft: "24px" }}
            >
              <div
                className="d-flex align-items-center border-end pe-2"
                onClick={() => {
                  if (page > 1) {
                    setPage(page - 1)
                  }
                }}
              >
                <span className="mdi mdi-chevron-left"></span>
                <span>PREV</span>
              </div>
            </div>

            <div className="px-0 cursor-pointer">
              <div className="d-flex align-items-center border-end px-2 position-relative">
                {page}
                <i
                  className="mdi mdi-menu-down"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  id="setpage"
                ></i>
                <span>
                  {" "}
                  of {Math.ceil(resultCount / items_per_page)}
                </span>
                <div
                  className="dropdown-menu dropdown-menu-end border-0 p-0"
                  aria-labelledby="setpage"
                >
                  <input
                    className="form-control"
                    type="number"
                    onChange={e => {
                      if (e.target.value > 0) setPage(e.target.value)
                    }}
                    style={{ width: "64px" }}
                  />
                </div>
              </div>
            </div>

            <div className="px-2 cursor-pointer">
              <div
                className="d-flex align-items-center"
                onClick={() => {
                  if (page < Math.ceil(resultCount / items_per_page))
                    setPage(page + 1)
                }}
              >
                <span>NEXT</span>
                <span className="mdi mdi-chevron-right"></span>
              </div>
            </div>
          </>
        )}
        <div className="flex-1 d-flex flex-wrap justify-content-center align-items-center total-analytics ms-0 me-4">
            <a
              className="btn btn-success m-2"
              // target="_blank"
              // href={`/report/${city}/${classify}/${activeMachine}/${filters.from}/${filters.to}`}
              style={{
                backgroundColor: `${reportBtnColor}`,
                borderColor: `${reportBtnColor}`,
              }}
              // disabled
              onClick={onClickReport}
            >
              View Report
            </a>
            <div className="flex-grow-1 flex-shrink-0 d-flex">
              <div
                className="d-inline-flex flex-column"
                style={{ marginLeft: "10px" }}
              >
                <div className="text-end">
                  <b>{machine && machine.name} TOTAL UNITS:</b>
                </div>
                <div className="text-end">
                  <b>{machine && machine.name} TOTAL TONS:</b>
                </div>
              </div>
              <div className="d-inline-flex flex-column ms-3 justify-content-around me-2">
                <div className="text-end">
                  <b>{resultCount}</b>
                </div>
                <div className="text-end">
                  <b>{totalTons}</b>
                </div>
              </div>
            </div>
            <div className="divide-vertical"></div>
            <div className="flex-grow-0  flex-shrink-0 d-flex">
              <div className="ps-2">
                <div className="d-inline-flex flex-column">
                  <div className="text-end ">
                    <b>TOTAL GAIN:</b>
                  </div>
                  <div className="text-end ">
                    <b>TOTAL LOSS:</b>
                  </div>
                  {forToday &&
                  <div className="text-end ">
                    <b>TOTAL FLOAT:</b>
                  </div>}
                </div>
              </div>
              <div className="d-inline-flex flex-column ms-3">
                <div className="text-end text-success">
                  <b>{formatSeconds(totalGain)}</b>
                </div>
                <div className="text-end text-danger">
                  <b>{formatSeconds(totalLoss)}</b>
                </div>
                {forToday &&
                <div className="text-end text-warning">
                  <b>{formatSeconds(Math.max(totalFloat, 0))}</b>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}