import d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';

const PiePaths = React.createClass({

    render(){

      const data = [
              {"day":"Mon", "hits": 476},
              {"day":"Tue", "hits": 678},
              {"day":"Wed", "hits": 567},
              {"day":"Thur", "hits": 425},
              {"day":"Fri", "hits": 387},
              {"day":"Sat", "hits": 1025},
              {"day":"Sun", "hits": 978}
            ],
            arc = d3.svg.arc()
                    .outerRadius(0)
                    .innerRadius(300),
            pie = d3.layout.pie()
                    .value((d) =>{
                      return d.hits
                    }),
            color = d3.scale.ordinal()
                    .range([
                        '#' + Math.floor(Math.random() * 16777215).toString(16),
                        '#' + Math.floor(Math.random() * 16777215).toString(16),
                        '#' + Math.floor(Math.random() * 16777215).toString(16),
                        '#' + Math.floor(Math.random() * 16777215).toString(16),
                        '#' + Math.floor(Math.random() * 16777215).toString(16),
                        '#' + Math.floor(Math.random() * 16777215).toString(16)
                      ]),
            transform = 'translate(400, 300)',
            paths = (pie(data)).map((d, i) => {
                                      return (
                                          <path fill={color(i)} d={arc(d)} key={i}/>
                                      )
                                  });

                                    return(
                                        <g transform={transform}>
                                            {paths}
                                        </g>
                                    )
                                }
                            });
                            const PieChart = React.createClass({
                              getDefaultProps(){
                                return {
                                  svgHeight: 700,
                                  svgWidth: 700
                                }
                              },

                              render() {
                                      return(
                                        <svg
                                          height={this.props.svgHeight}
                                          width={this.props.svgWidth}
                                        >
                                        <PiePaths
                                          width={600}
                                          height={400}
                                        />
                                        </svg>
                                      );
                              }
                            });

export default PieChart;
