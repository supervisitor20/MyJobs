import React from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import {doGetChartData} from '../actions/chart-data-actions';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine,
  ReferenceDot, Tooltip, CartesianGrid, Legend, Brush } from 'recharts';

class LineChartDisplay extends React.Component {
  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(doGetChartData());
  }
  render() {
        const data = this.props.chartData.JobViewsChartData;

    return (
      <div className="cardWrapper">
        <LineChart width={800} height={600} data={data}
          margin={{ top: 50, right: 40, left: 20, bottom: 5 }}>
          <XAxis dataKey="day" padding={{ left: 50, right: 50 }}/>
          <YAxis type="number" domain={[0, 'dataMax + 500']} padding={{ bottom: 50, top: 50 }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="hits" stroke="#8884d8" />
        </LineChart>
      </div>
    );
  }
}

LineChartDisplay.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  chartData: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  chartData: state.chartRender,
}))(LineChartDisplay);
