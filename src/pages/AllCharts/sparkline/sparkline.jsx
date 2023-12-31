import { Component } from 'react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

class SparkLine extends Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    }
    render() {
        return (
            <React.Fragment>
                {/* <Sparklines data={[5, 10, 5, 20, 8, 15]} limit={5} width={100} height={20} margin={5}>
                </Sparklines> */}
                <Sparklines data={[6, 2, 8, 4, 3, 8, 1, 3, 6, 5, 9, 2, 8, 1, 4, 8, 9, 8, 2, 1]} width={100} height={40} >
                    <SparklinesLine style={{ stroke: "rgba(5, 139, 99,0.8)", fill: "rgba(5, 139, 99,0.8)" }} />
                    <SparklinesSpots style={{ fill: "rgba(5, 139, 99,0.3)" }} />
                </Sparklines>
            </React.Fragment>
        );
    }
}

export default SparkLine;