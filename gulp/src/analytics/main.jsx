import React from 'react';
import ReactDOM from 'react-dom';
import AreaChart from './components/AreaChart';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import RadialBarChart from './components/RadialBarChart';
import ComposedChart from './components/ComposedChart';

ReactDOM.render(
  <div>
    <AreaChart/>
    <BarChart/>
    <PieChart/>
    <RadialBarChart/>
    <ComposedChart/>
  </div>
  , document.getElementById('content')
);
