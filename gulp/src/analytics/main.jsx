import React from 'react';
import ReactDOM from 'react-dom';
import Bar from './components/Bar';
import Line from './components/Line';
import PieChart from './components/PieChart';

ReactDOM.render(
  <div>
      <Bar/>
      <Line/>
      <PieChart/>
  </div>
  , document.getElementById('content')
);
