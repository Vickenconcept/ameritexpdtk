import { useEffect, useRef, useState, useMemo } from "react"

import ReportMachinePage from "./ReportMachinePage"

const barStyles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        fontSize: 15,
        backgroundColor: '#121212',
        color: 'white',
        padding: '10px 20px',
    },
    title : {
        fontWeight: 'bold',
        color: '888888',
        flex:1,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 10,
        fontSize: 20,
        // opacity: 0.5,
        cursor: 'pointer',
        color: 'white',
        // '&:hover': {
        //     opacity: 1,
        // }
    },
    iconDiabled: {
        width: 20,
        height: 20,
        marginRight: 10,
        fontSize: 20,
        color: 'gray',
    }
}

export default ({
    machines,
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

    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    const containerRef = useRef()

    const ratio = 1.414

    const setSize = (window) => {
        const w = window.innerWidth
        const h = window.innerHeight
        const r = h/w
        // console.log({w, h, r})
        if (r < ratio) {
            setWidth(h / ratio)
            setHeight(h)
        } else {
            setWidth(w)
            setHeight(w * ratio)
        }
    }

    const onPrintAction = () => {
        const container = containerRef?.current
        if (container) {
            // container?.print()
            // console.log (container)
            const window = container.ownerDocument.defaultView
            window.print()
        }
    }

    useEffect (()=>{
        if (containerRef?.current) {
            const container = containerRef.current
            const window = container.ownerDocument.defaultView
            setSize(window)
            window.addEventListener('resize', () => {
                setSize(window)
            })
            return () => {
                window.removeEventListener('resize', () => {})
            }
        }
    },[containerRef])

    return (
        <div>
            <div className='no-print' style={barStyles.container}>
                <style>
                    {`
                    .print-container {
                        margin: auto;
                        padding: 20px 40px;
                        fontFamily: 'Arial';
                        fontSize: 12px;
                    }
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        .print-container {
                            margin: auto;
                            padding: 0;
                        }
                        body {
                            pading: 0;
                        }
                    }
                    `}
                </style>
                <div style={barStyles.title}>
                    Powered by Iekomedia
                </div>
                <a style={barStyles.iconDiabled}>
                    <i className="fas fa-download" />
                </a>
                <a style={barStyles.icon} onClick={onPrintAction}>
                    <i className="fas fa-print" />
                </a>
            </div>
            {(
                <div
                className='print-container'
                ref = {containerRef}
                >
                    <style>
                        {`
                        hr {
                            margin-top: 10px;
                            margin-bottom: 40px;
                        }
                        .page {
                            page-break-before: always;
                        }
                        @media print {
                            hr {
                                display: none;
                                margin: 0;
                            }
                        }
                        `}
                    </style>
                    {machines.map((machine, index) => (
                        <>
                        <ReportMachinePage
                            key={index}
                            machine={machine}
                            part={part}
                            from={from}
                            to={to}
                            includeCycle={includeCycle}
                            machineClass={machineClass}
                            city={city}
                            query={query}
                            isOnline={isOnline}
                            timer={timer}
                        />
                        <hr/>
                        </>
                    ))}
                </div>
            )}
        </div>
    )
}