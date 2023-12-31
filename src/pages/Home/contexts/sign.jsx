// import * as React from "react"
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import Lock from '../components/Lock'

export const SignupContext = React.createContext({ signup: false })

export const SignupProvider = (props) => {
    const sign = props.sign || false;
    const [up, setUp] = React.useState(props.up || false);
    return (
        <SignupContext.Provider value={{ up, setUp }}>
            {!sign && (up ? <SignUp /> : <SignIn />)}
            {sign && (<Lock up={props.up} />)}
        </SignupContext.Provider>
    )
}