import React from 'react';
import {PieChart, Pie, Legend, ResponsiveContainer} from 'recharts';


const SimplePieChart = React.createClass({
	render () {
    const data = [
          {name: 'G', value: 1},
          {name: 'PG-13', value: 8},
          {name: 'R', value: 5},
    ];
    const colors = '#' + Math.floor(Math.random() * 16777215).toString(16);

  	return (
      <div id="pie_chart" style={{width: '100%', maxHeight: '500px', height: '500px'}}>
        <ResponsiveContainer>
        <PieChart width={1200} height={400}>
          <Pie data={data} cx={200} cy={200} fill={colors} label/>
        </PieChart>
      </ResponsiveContainer>
    </div>
    );
  }
})

export default SimplePieChart;
