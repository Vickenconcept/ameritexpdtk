import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';

export default () => {
    const factories = [{
        _id: '1',
        name: 'Factory 1',
    },{
        _id: '2',
        name: 'Factory 2',
    },{
        _id: '3',
        name: 'Factory 3',
    },{
        _id: '4',
        name: 'Factory 4',
    }]

    const machines = [{
        _id: '1',
        name: 'Machine 1',
    },{
        _id: '2',
        name: 'Machine 2',
    },{
        _id: '3',
        name: 'Machine 3',
    },{
        _id: '4',
        name: 'Machine 4',
    }]

    const [data, setData] = React.useState({
        '1': {
            totalTime: 100,
            totalGain: 50,
            totalLoss: 50,
        },
        '2': {
            totalTime: 100,
            totalGain: 50,
            totalLoss: 50,
        },
        '3': {
            totalTime: 100,
            totalGain: 50,
            totalLoss: 50,
        },
        '4': {
            totalTime: 100,
            totalGain: 50,
            totalLoss: 50,
        },
    })

    const series = React.useMemo(() => {
        return [{
            data: [44, 55, 41, 64, 22, 43, 21]
          }, {
            data: [53, 32, 33, 52, 13, 44, 32]
          }]
    },[data])

    const optionMemo = React.useMemo(() => {
        return (
            {
                chart: {
                  type: 'bar',
                  height: 430
                },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    dataLabels: {
                      position: 'top',
                    },
                  }
                },
                dataLabels: {
                  enabled: true,
                  offsetX: -6,
                  style: {
                    fontSize: '12px',
                    colors: ['#fff']
                  }
                },
                stroke: {
                  show: true,
                  width: 1,
                  colors: ['#fff']
                },
                tooltip: {
                  shared: true,
                  intersect: false
                },
                xaxis: {
                  categories: ['Pipe And Box', 'Precast', 'Steel', 'Exterior'],
                },
            }
        )
    }, [factories])
    
    return (
        <React.Fragment>
            <ReactApexChart 
                options={optionMemo} 
                series={series}
                type="bar" 
                height="290" 
            />
        </React.Fragment>
    );
}