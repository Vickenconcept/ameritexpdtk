import { getTimerLogsOfMachine } from "../../../../actions/timer"
import { useEffect, useRef, useState, useMemo } from "react"
import { formatSeconds, lbsToTons, formatSecondsLetter } from "../../../../helpers/functions"

import { BACKEND } from "../../../../helpers/axiosConfig"
import moment from "moment"
const styles = ({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        fontSize: 12
    },
    image: {
        width: 200,
        marginBottom: 20
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        borderBottomStyle: 'solid',
        padding: '4px 0'
    },
    col1: {
        width: '5%'
    },
    col2: {
        width: '40%'
    },
    col3: {
        width: '10%',
        textAlign: 'center',
    },
    col4: {
        width: '15%'
    },
    col5: {
        width: '10%'
    },
    col6: {
        width: '20%'
    },
    col7: {
        width: '10%',
        textAlign: 'right',
    },
    info: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    }
});

const infoStyles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 30,
        fontSize: 20,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        // justifyContent: 'space-between',
        // marginBottom: 10,
    },
    col1: {
        minWidth: '25%',
        textAlign: 'right',
    },
    col2: {
        minWidth: '35%',
        textAlign: 'left',
    },
    label: {
        fontWeight: 'bold',
    },
}

const titleStyle = {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
}

export default ({
    machine,
    part,
    from,
    to,
    includeCycle,
    machineClass,
    city,
    query,
    isOnline,
    timer,
}) => {

    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState([])
    const [resultCount, setResultCount] = useState(0)
    const [totalTons, setTotalTons] = useState(0)
    const [totalLoss, setTotalLoss] = useState(0)
    const [totalGain, setTotalGain] = useState(0)
    const [totalFloat, setTotalFloat] = useState(0)
    const [resultDateRange, setResultDateRange] = useState([])
    const [forToday, setForToday] = useState(false)

    const getReports = async () => {
        setLoading(true)
        try {
            const res = await getTimerLogsOfMachine(
                machine?._id,
                part,
                from,
                to,
                -1, // page
                includeCycle,
                machineClass,
                city,
                null, // items_per_page
                query,
                isOnline, // isOnline
                timer,
            )
            setResultCount(res.total ? res.total : 0)
            setTotalTons(lbsToTons(res.totalTons ? res.totalTons : 0))
            setTotalGain(res.totalGain ? res.totalGain : 0)
            setTotalLoss(res.totalLoss ? res.totalLoss : 0)
            setTotalFloat(res.totalFloat ? res.totalFloat : 0)
            setResultDateRange([res.from, res.to])
            setForToday(res.forToday)

            setLogs(res.logs || [])
        } catch (e) {
            console.log(e)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    const dateRangeText = useMemo(() => {
        if (!resultDateRange || resultDateRange.length != 2) return ''
        if (forToday) return 'Today'
        return `${moment(resultDateRange[0])?.format('MM/DD/YYYY')} - ${moment(resultDateRange[1])?.format('MM/DD/YYYY')}`
    }, [resultDateRange])

    useEffect(() => {
        getReports()
    }, [])

    return (
        <div>
            {loading ? (
                <div>loading...</div>
            ) : (
                <div className='page'>
                    <div style={{ ...styles.info, marginTop: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <img src={BACKEND + '/logo-dark.png'} style={styles.image} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div>
                                <span style={infoStyles.label}>
                                    City :
                                </span>
                                {city}
                            </div>
                            <div>
                                <span style={infoStyles.label}>
                                    Factory :
                                </span>
                                {machine?.factory}
                            </div>
                            <div>
                                <span style={infoStyles.label}>
                                    Machine Class :
                                </span>
                                {machine?.machineClass}
                            </div>
                            <div>
                                <span style={infoStyles.label}>
                                    Machine :
                                </span>
                                {machine?.name}
                            </div>
                            <div>
                                <span style={infoStyles.label}>
                                    Report :
                                </span>
                                {moment().format('DD/MM/YYYY')}
                            </div>
                        </div>
                    </div>
                    <div style={{ ...titleStyle, marginTop: 80 }}>
                        TOTALS
                    </div>
                    <div style={infoStyles.container}>
                        <div style={{ ...infoStyles.row, justifyContent: 'flex-start' }}>
                            <div style={{ ...infoStyles.col1, ...infoStyles.label }}>
                                Date Range
                            </div>
                            <div style={{ ...infoStyles.col2 }}>
                                {dateRangeText}
                            </div>
                        </div>
                        <div style={infoStyles.row}>
                            <div style={{ ...infoStyles.col1, ...infoStyles.label }}>
                                Total Units
                            </div>
                            <div style={{ ...infoStyles.col2 }}>
                                {resultCount}
                            </div>
                        </div>
                        <div style={infoStyles.row}>
                            <div style={{ ...infoStyles.col1, ...infoStyles.label }}>
                                Total Tons
                            </div>
                            <div style={{ ...infoStyles.col2 }}>
                                {totalTons}
                            </div>
                        </div>
                        <div style={infoStyles.row}>
                            <div style={{ ...infoStyles.col1, ...infoStyles.label }}>
                                Total Time of Gain
                            </div>
                            <div style={{ ...infoStyles.col2 }}>
                                {formatSecondsLetter(totalGain)}
                            </div>
                        </div>
                        <div style={infoStyles.row}>
                            <div style={{ ...infoStyles.col1, ...infoStyles.label }}>
                                Total Time of Loss
                            </div>
                            <div style={{ ...infoStyles.col2 }}>
                                {formatSecondsLetter(totalLoss)}
                            </div>
                        </div>
                        {totalFloat ? (
                            <div style={infoStyles.row}>
                                <div style={{ ...infoStyles.col1, ...infoStyles.label }}>
                                    Total Time of Unused
                                </div>
                                <div style={{ ...infoStyles.col2 }}>
                                    {formatSecondsLetter(totalFloat)}
                                </div>
                            </div>
                        ) : ""}
                    </div>
                    {includeCycle &&
                        <>
                            <div style={titleStyle}>
                                CYCLES
                            </div>
                            <div style={styles.row}>
                                <div style={styles.col1}>No</div>
                                <div style={styles.col2}>Part</div>
                                <div style={styles.col3}>Id</div>
                                <div style={styles.col4}>Operator</div>
                                <div style={styles.col5}>Status</div>
                                <div style={styles.col6}>Start</div>
                                <div style={styles.col7}>Duration</div>
                            </div>
                            {logs?.map((log, index) => (
                                <div key={index} style={styles.row}>
                                    {/* <div>{log.id}</div> */}
                                    <div style={styles.col1}>{logs.length - index}</div>
                                    <div style={styles.col2}>{log.part?.name}</div>
                                    <div style={styles.col3}>{log.id}</div>
                                    <div style={styles.col4}>{log.operator}</div>
                                    <div style={{
                                        ...styles.col5, color: (
                                            log.loss > 0 ? 'red' : log.gain > 0 ? 'green' : 'black'
                                        ),
                                        fontWeight: 'bold',
                                    }}>
                                        {log.loss > 0 ? 'Loss' : log.gain > 0 ? 'Gain' : ''}
                                    </div>
                                    <div style={styles.col6}>
                                        <span style={{ color: 'black' }}>
                                            {moment(log.startTime).format('MM/DD/YYYY')}
                                        </span>
                                        {` `}
                                        <span style={{ color: 'gray' }}>
                                            {moment(log.startTime).format('HH:mm:ss')}
                                        </span>
                                    </div>
                                    <div style={{ ...styles.col7, color: 'yellowgreen' }}>{formatSecondsLetter(log.time)}</div>
                                </div>
                            ))}
                            {logs.length == 0 && (
                                <div style={{ textAlign: 'center', marginTop: 20 }}>No data</div>
                            )}
                            {/* <div style={{
                        fontWeight: 'bold',
                        textAlign: 'right',
                        flexDirection: 'column',
                        }}>
                        <div>
                            TOTAL UNITS: {resultCount}
                        </div>
                        <div>
                            TOTAL TONS: {totalTons}
                        </div>
                        <div>
                            TOTAL GAIN: {formatSeconds(totalGain)}
                        </div>
                        <div>
                            TOTAL LOSS: {formatSeconds(totalLoss)}
                        </div>
                    </div> */}
                        </>
                    }
                </div>
            )}
        </div>
    )
}