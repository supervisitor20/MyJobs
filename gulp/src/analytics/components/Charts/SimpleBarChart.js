import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';


const SimpleBarChart = React.createClass({
	render () {
		const {chartData} = this.props;
		const axisData = chartData.PageLoadData.rows;
		const newAxis = [];
		axisData.map((obj) =>{
			obj['job_views'] = parseInt(obj['job_views']);
		});
		const data = [
				{country: "USA", population: 4587652},
				{country: "China", population: 8415624},
				{country: "Japan", population: 845692},
				{country: "Mexico", population: 2562356},
				{country: "Germany", population: 4852653},
				{country: "Fiji", population: 1254652},
			];
    const colors = '#' + Math.floor(Math.random() * 16777215).toString(16);

  	return (
      <div id="bar_chart" style={{width: '100%', maxHeight: '400px', height: '400px'}}>
      <ResponsiveContainer>
        <BarChart width={1200} height={400} data={axisData}>
         <XAxis dataKey="browser"/>
         <YAxis/>
         <CartesianGrid strokeDasharray="3 3"/>
         <Tooltip/>
         <Legend />
         <Bar dataKey="job_views" fill={colors} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    );
  }
})

export default SimpleBarChart;
