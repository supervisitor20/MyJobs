import React from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';


const SimpleBarChart = React.createClass({
	render () {
    const data = [
          {name: 'GoodFellas', stars: 5},
          {name: 'Pretty Woman', stars: 3},
          {name: 'Star Trek', stars: 4},
          {name: 'Boyhood', stars: 5},
          {name: 'The Dark Knight', stars: 4},
          {name: 'Shindlers List', stars: 5},
          {name: 'Twilight', stars: 3},
          {name: 'Inception', stars: 4},
          {name: 'Titanic', stars: 5},
          {name: 'Iron Man', stars: 4},
          {name: 'Harry Potter', stars: 4},
          {name: 'The Revenant', stars: 5},
          {name: 'Fargo', stars: 5},
    ];
    const colors = '#' + Math.floor(Math.random() * 16777215).toString(16);

  	return (
      <div id="bar_chart" style={{width: '100%', maxHeight: '400px', height: '400px'}}>
      <ResponsiveContainer>
        <BarChart width={1200} height={400} data={data}>
         <XAxis dataKey="name"/>
         <YAxis/>
         <CartesianGrid strokeDasharray="3 3"/>
         <Tooltip/>
         <Legend />
         <Bar dataKey="stars" fill={colors} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    );
  }
})

export default SimpleBarChart;
