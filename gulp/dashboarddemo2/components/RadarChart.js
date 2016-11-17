import React from 'react';
import {Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer} from 'recharts';


const SimpleRadarChart = React.createClass({
	render () {
    const data = [
          {name: 'GoodFellas', stars: 5, genre: 'Crime'},
          {name: 'Pretty Woman', stars: 3, genre: 'Comedy'},
          {name: 'Star Trek', stars: 4, genre: 'Science Fiction'},
          {name: 'Boyhood', stars: 5, genre: 'Drama'},
          {name: 'The Dark Knight', stars: 4, genre: 'Action'},
          {name: 'Shindlers List', stars: 5, genre: 'Drama'},
          {name: 'Twilight', stars: 3, genre: 'Science Fiction'},
          {name: 'Inception', stars: 4, genre: 'Science Fiction'},
          {name: 'Titanic', stars: 5, genre: 'Romance'},
          {name: 'Iron Man', stars: 4, genre: 'Action'},
          {name: 'Harry Potter', stars: 4, genre: 'Science Fiction'},
          {name: 'The Revenant', stars: 5, genre: 'Action'},
          {name: 'Fargo', stars: 5, genre: 'Crime'},
    ];
    const colors = '#' + Math.floor(Math.random() * 16777215).toString(16);

  	return (
      <div id="radar_chart" style={{width: '100%', maxHeight: '500px', height: '500px'}}>
      <ResponsiveContainer>
        <RadarChart cx={300} cy={250} outerRadius={150} width={1200} height={500} data={data}>
          <Radar name="Genre" dataKey="stars" stroke={colors} fill={colors} fillOpacity={0.6}/>
          <PolarGrid />
          <PolarAngleAxis dataKey="genre" />
          <PolarRadiusAxis/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
    );
  }
})

export default SimpleRadarChart;
