import React from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';


const SimpleLineChart = React.createClass({
	render () {
    const data = [
      {name: '1960 - 1970', amt: 32},
      {name: '1970 - 1980', amt: 14},
      {name: '1980 - 1990', amt: 25},
      {name: '1990 - 2000', amt: 54},
      {name: '2000 - 2010', amt: 40},
      {name: '2010 - 2016', amt: 17},
    ];
    const colors = '#' + Math.floor(Math.random() * 16777215).toString(16);

  	return (
      <div id="pie_chart" style={{width: '100%', maxHeight: '500px', height: '500px'}}>
        <ResponsiveContainer>
          <LineChart width={1200} height={500} data={data}
                margin={{top: 5, right: 30, left: 20, bottom: 5}}>
             <XAxis dataKey="name"/>
             <YAxis/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="amt" stroke={colors} activeDot={{r: 15}}/>
          </LineChart>
      </ResponsiveContainer>
    </div>
    );
  }
})

export default SimpleLineChart;
