import {useContext, createContext, useState, useEffect} from "react";

const initialState = {
    loading: true
}

export const LoadingContext = createContext()
export const useLoading = () => useContext(LoadingContext)

export const LoadingProvider = ({children, indicator}) => {
    const [loading, setLoading] = useState(true);
    let timerId = null;

    useEffect(()=>{
        // console.log('loading', loading)
        if (loading)
            timerId = setTimeout (()=>{
                setLoading (false)
            }, 10000)
        else clearTimeout (timerId)
        return clearTimeout (timerId)
    },[loading])

    useEffect(()=>{
        setLoading(false)
    },[])

    return (
        <LoadingContext.Provider value={{loading, setLoading}}>
            {loading && indicator}
            {children}
        </LoadingContext.Provider>
    )
}
