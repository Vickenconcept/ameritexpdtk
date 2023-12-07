import { useEffect, useRef } from "react"
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";

import { setLockStatues } from "../../store/actions";

import { lockingTime } from "../../helpers/globals"

const Tracker = (props) => {
    const bodyRef = useRef(document.body);
    const history = useHistory();

    const timeForLock = lockingTime.lock;

    const logout = () => {
        console.log('LOG OUT')
        history.push('/logout')
    }

    const lock = () => {
        console.log('LOCK')
        props.setLockStatues(true)
    }

    useEffect(() => {
        let timerId = null;
        function resetTimer(t1) {
            clearTimeout(timerId);
            timerId = setTimeout(lock,
                // 2 * 60 * 60 * 1000
                t1
            );
        }
        function handleMouseMoveOrClick() {
            resetTimer(timeForLock * 1000);
        }
        if (!props.locked) {
            resetTimer(timeForLock * 1000);
            bodyRef.current.addEventListener('mousemove', handleMouseMoveOrClick);
            bodyRef.current.addEventListener('click', handleMouseMoveOrClick);
        } else {
            clearTimeout(timerId);
            bodyRef.current.removeEventListener('mousemove', handleMouseMoveOrClick);
            bodyRef.current.removeEventListener('click', handleMouseMoveOrClick);
        }
        return () => {
            clearTimeout(timerId);
            bodyRef.current.removeEventListener('mousemove', handleMouseMoveOrClick);
            bodyRef.current.removeEventListener('click', handleMouseMoveOrClick);
        };
    }, [props.locked])

    return (
        <>

        </>
    )
}

const mapStatetoProps = state => {
    return {
        locked: state.Login.locked
    }
}

export default connect(
    mapStatetoProps,
    {
        setLockStatues
    }
)(Tracker)
