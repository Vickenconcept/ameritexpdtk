import { Triangle  } from  'react-loader-spinner'

const Indicator = (props) => {
    return (
        <div style={{
            position:'fixed', 
            zIndex:1100, 
            // transform:"translate(50%,50%)", 
            width:'100vw', 
            height:'100vh', 
            backgroundColor:'rgba(255,255,255,.01)' ,
            display: 'flex',
            // placeContent: 'center',
            alignItems: 'flex-end',
            backdropFilter: 'blur(0.5px)',
            color:"red",
            paddingLeft:"4%",
            paddingBottom:"10px",
        }}>
            <Triangle 
                height = "80"
                width = "80"
                radius = "9"
                color = 'white'
                ariaLabel = 'three-dots-loading'
                wrapperStyle = {{
                    // boxShadow: "0px 0px 12px #FF0000",
                }}
            /><code style={{marginLeft:"-80px", marginBottom:"25px", fontSize:"18px", zIndex:"1001", fontWeight:"bold", color:"white"}}>Ameritex</code>
        </div>
    )
}

export default Indicator
