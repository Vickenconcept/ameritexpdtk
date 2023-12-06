import { useCallback, useMemo } from "react";

const getTime = (t = 0) => {
    let temp = t;
    const hour = parseInt(temp/3600)
    temp -= 3600*hour;
    const minute = parseInt(temp/60);
    temp -= 60*minute;
    const second = temp;
    return {hour, minute, second}
}

export const TimeText = ({time = 0}) => {
    
    const {hour, minute, second} = useMemo (() => getTime(time), [time])

    const normalizeDigit = useCallback((digit) => {
        return (<>
        { digit < 10 && <span>0</span> }
        { digit > 0 && <span className='text-second'>{digit}</span>}
        { digit == 0 && <span>0</span>}
        </>)
    },[])

    const hElem = useMemo(()=> normalizeDigit(hour), [hour]);
    const mElem = useMemo(()=> normalizeDigit(minute), [minute]);
    const sElem = useMemo(()=> normalizeDigit(second), [second]);

    return (
        <>
        {hElem}
        {hElem && <span>:</span>}
        {mElem}
        {mElem && <span>:</span>}
        {sElem}
        </>
    )
}

export const DateText = ({date = 0}) => {
    const normalizeDigit = useCallback((digit) => {
        return (<>
            { digit < 1000 && <span className="text-gray">0</span> }
            { digit < 100 && <span className="text-gray">0</span> }
            { digit < 10 && <span className="text-gray">0</span> }
            { digit > 0 && <span>{digit}</span> }
            { digit == 0 && <span className="text-gray">0</span>}
        </>)
    },[])

    const dateElem = useMemo(()=>normalizeDigit(date),[date])

    return (
        <>
            <span className='text-bold me-2'>{dateElem}</span>
            <span className='me-3'>D</span>
        </>
    )
}

export const DateTimeText = ({date = 0, time = 0}) => {
    return (
        <>
            <DateText date={date} />
            <TimeText time={time} />
        </>
    )
}

export const TimeDiffText = ({now, entry}) => {
    const original = useMemo(()=>{
        if (!entry) return 0
        try {
            const date = new Date(entry);
            if (isNaN(date.getTime())) return 0;
            return date.getTime();
        } catch {
            return 0
        }
    },[entry])
    const diff = useMemo(() => now - original, [now, original])
    const date = useMemo(() => diff>0?parseInt(diff/(1000*60*60*24)):0, [diff])
    const time = useMemo(() => diff>0?parseInt((diff - date*1000*60*60*24)/1000):0, [diff, date])
    return (
        <DateTimeText date={date} time={time} />
    )
}
