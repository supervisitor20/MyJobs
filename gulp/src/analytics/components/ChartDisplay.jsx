import React from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import {doGetChartData} from '../actions/chart-data-actions';
import {BarChart, Bar, Brush, Cell, CartesianGrid, ReferenceLine, ReferenceDot,
  XAxis, YAxis, Tooltip, Legend } from 'recharts';

import LineChartDisplay from './LineChartDisplay';
import AreaChartDisplay from './AreaChartDisplay';

class ChartDisplay extends React.Component {
  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(doGetChartData());
  }
  render() {
        const data = this.props.chartData.JobViewsChartData;
//     const data = [
//   { name: 'food', uv: 2400, pv: 2013, amt: 4500 },
//   { name: 'cosmetic', uv: 3300, pv: 2000, amt: 6500 },
//   { name: 'storage', uv: 3200, pv: 1398, amt: 5000 },
//   { name: 'digital', uv: 2800, pv: 2800, amt: 4000 },
// ];
    return (
      <div className="cardWrapper">
        <BarChart width={800} height={600} data={data}>
            <XAxis dataKey="day" interval='1' padding={{ left: 50, right: 50 }} />
            <YAxis yAxisId="a" type="number" domain={[0, 'dataMax + 500']} />
            <Legend />
            <Tooltip />
            <CartesianGrid vertical={false}/>
            <Bar yAxisId="a" dataKey="hits">
              {
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))
              }
            </Bar>

          </BarChart>
          <LineChartDisplay />
          <AreaChartDisplay />
      </div>
    );
  }
}

ChartDisplay.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  chartData: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  chartData: state.chartRender,
}))(ChartDisplay);
