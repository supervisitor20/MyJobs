import React from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import {doGetChartData} from '../actions/chart-data-actions';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Brush,
  ReferenceArea, ReferenceLine, ReferenceDot, ResponsiveContainer } from 'recharts';

class AreaChartDisplay extends React.Component {
  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(doGetChartData());
  }
  render() {
        const data = this.props.chartData.JobViewsChartData;

    return (
      <div className="cardWrapper">
        <AreaChart width={800} height={600} data={data}
          margin={{ top: 50, right: 50, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="day" padding={{ left: 50, right: 50 }} />
          <YAxis type="number" domain={[0, 'dataMax + 500']} padding={{ bottom: 50, top: 50 }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area type="monotone" dataKey="hits" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </div>
    );
  }
}

AreaChartDisplay.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  chartData: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  chartData: state.chartRender,
}))(AreaChartDisplay);
