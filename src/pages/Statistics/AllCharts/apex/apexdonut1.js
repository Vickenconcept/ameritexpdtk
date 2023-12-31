import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

class Apexdonut extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                plotOptions: {
                    radialBar: {
                        hollow: {
                            size: '45%',
                        },
                        dataLabels: {
                            value: {
                                show: false
                            }
                        }
                    },
                },
                colors: ['rgb(5, 139, 99)'],
                labels: ['']
            },
            series: [60],
        }
    }

    render() {
        return (
            <React.Fragment>
                <ReactApexChart options={this.state.options} series={this.state.series} type="radialBar" height="140px" />
            </React.Fragment>
        );
    }
}

export default Apexdonut;