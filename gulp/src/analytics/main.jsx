import React from 'react';
import ReactDOM from 'react-dom';
import AreaChart from './components/AreaChart';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

ReactDOM.render(
  <div>
    <AreaChart/>
    <BarChart/>
    <PieChart/>
  </div>
  , document.getElementById('content')
);
