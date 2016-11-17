import React from 'react';
import { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import TitleCharts from './TitleCharts';
import GenreCharts from './GenreCharts';
import MPAACharts from './MPAACharts';
import ReleaseCharts from './ReleaseCharts';
import DashBoardHeader from './Header/DashBoardHeader';

class SideBar extends Component {
  constructor(props, context){
    super(props, context);
    this.state = {
      activeTab: 0,
    }
  }
  render() {
    return(
      <div>
          <div id='menu' className={this.state.menuShow ? "is-checked" : ""} >
            <div className="side-bar-mobile-header">

                  <span className="dimension-filter-clear">Clear All</span>

                  <span className="dimension-filter">Dimensions</span>

                  <span id="close" onClick={this.closeMenu}><i className="fa fa-times" aria-hidden="true"></i></span>

            </div>
            <div className="clearfix"></div>
            <ul className="accordion-container">
                <li className="side-accordion side-accordion-header">
                    <p className="filter-header">Dimensions</p>
                    <p className="filter-clear-all">Clear All</p>
                </li>
                <li id="genre" className="side-accordion">
                  <label htmlFor="ac-1">
                    Genres
                  </label>
                </li>
                <li id="mpaa" className="side-accordion">
                  <label htmlFor="ac-1">
                    MPAA Rating
                  </label>
                </li>
                <li id="release" className="side-accordion">
                  <label htmlFor="ac-1">
                    Release Date
                  </label>
                </li>
            </ul>
          </div>
          <div className="tabs-header">
            <span id="toggle_menu" className="toggle-menu fa fa-bars"></span>
              <ul className="nav navbar-nav navbar-right right-options">
                <li><a href="#"><span className="fa fa-envelope-o"></span></a></li>
                <li><a href="#"><span className="fa fa-print"></span></a></li>
                <li><a href="#"><span className="fa fa-file-excel-o"></span></a></li>
              </ul>
          </div>
          <div id="page_content">
              <input className="tab-input" id="tab1" type="radio" name="tabs" defaultChecked/>
              <label className="tab-label" htmlFor="tab1">Title</label>

              <input className="tab-input" id="tab2" type="radio" name="tabs" />
              <label className="tab-label" htmlFor="tab2">Genres</label>

              <input className="tab-input" id="tab3" type="radio" name="tabs" />
              <label className="tab-label" htmlFor="tab3">MPAA</label>

              <input className="tab-input" id="tab4" type="radio" name="tabs" />
              <label className="tab-label" htmlFor="tab4">Release</label>

            <section id="content1">
              <div className="tabs-content">
                          <div className="active">
                            <DashBoardHeader/>
                            <TitleCharts/>
                            <Row>
                            <div id="table_data">
                              <div id="table_search">
                                <div className="dimension_list">
                                  <span className="dimension-title">
                                    Dimensions
                                    <span></span>
                                    <span></span>
                                  </span>
                                  <ul className="list">
                                  <li><a href="#">Dimension 1</a></li>
                                    <li><a href="#">Dimension 2</a></li>
                                    <li><a href="#">Dimension 3</a></li>
                                    <li><a href="#">Dimension 4</a></li>
                                   <li><a href="#">Dimension 5</a></li>
                                  </ul>
                                </div>
                                <input type="text" id="search_table" placeholder="Search..." title="Type Search" />
                              </div>
                              <div className="clearfix"></div>
                            <table id="data_table" className="title-data rwd-table">
                              <thead>
                              <tr>
                                <th>Title</th>
                                <th>Stars</th>
                               </tr>
                               </thead>
                               <tbody>
                                 <tr>
                                   <td>GoodFellas</td>
                                   <td>5</td>
                                 </tr>
                                 <tr>
                                   <td>Pretty Woman</td>
                                   <td>3</td>
                                 </tr>
                                 <tr>
                                   <td>Star Trek</td>
                                   <td>4</td>
                                 </tr>
                                 <tr>
                                   <td>Boyhood</td>
                                   <td>5</td>
                                 </tr>
                                 <tr>
                                   <td>The Dark Knight</td>
                                   <td>4</td>
                                 </tr>
                                 <tr>
                                   <td>Shindler's List</td>
                                   <td>5</td>
                                 </tr>
                                 <tr>
                                   <td>Twilight</td>
                                   <td>3</td>
                                 </tr>
                                 <tr>
                                   <td>Inception</td>
                                   <td>4</td>
                                 </tr>
                                 <tr>
                                   <td>Titanic</td>
                                   <td>5</td>
                                 </tr>
                                 <tr>
                                   <td>Iron Man</td>
                                   <td>4</td>
                                 </tr>
                                 <tr>
                                   <td>Harry Potter</td>
                                   <td>4</td>
                                 </tr>
                                 <tr>
                                   <td>The Revenant</td>
                                   <td>5</td>
                                 </tr>
                                 <tr>
                                   <td>Fargo</td>
                                   <td>5</td>
                                 </tr>
                              </tbody>
                            </table>
                          </div>
                        </Row>
                            <div>

                            </div>
                          </div>
                    </div>
            </section>
            <section id="content2">
                  <div className="tabs-content">
                        <div className="active">
                          <GenreCharts/>
                          <Row>
                          <div id="table_data">
                            <div id="table_search">
                              <input type="text" id="search_table" placeholder="Search..." title="Type Search" />
                            </div>
                            <div className="clearfix"></div>
                          <table id="data_table" className="title-data rwd-table">
                            <thead>
                            <tr>
                              <th>Title</th>
                              <th>Stars</th>
                              <th>Genres</th>
                             </tr>
                             </thead>
                             <tbody>
                               <tr>
                                 <td>GoodFellas</td>
                                 <td>5</td>
                                 <td>Crime</td>
                               </tr>
                               <tr>
                                 <td>Pretty Woman</td>
                                 <td>3</td>
                                 <td>Comedy</td>
                               </tr>
                               <tr>
                                 <td>Star Trek</td>
                                 <td>4</td>
                                 <td>Science Fiction</td>
                               </tr>
                               <tr>
                                 <td>Boyhood</td>
                                 <td>5</td>
                                 <td>Drama</td>
                               </tr>
                               <tr>
                                 <td>The Dark Knight</td>
                                 <td>4</td>
                                 <td>Action</td>
                               </tr>
                               <tr>
                                 <td>Shindler's List</td>
                                 <td>5</td>
                                 <td>Drama</td>
                               </tr>
                               <tr>
                                 <td>Twilight</td>
                                 <td>3</td>
                                 <td>Science Fiction</td>
                               </tr>
                               <tr>
                                 <td>Inception</td>
                                 <td>4</td>
                                 <td>Science Fiction</td>
                               </tr>
                               <tr>
                                 <td>Titanic</td>
                                 <td>5</td>
                                 <td>Romance</td>
                               </tr>
                               <tr>
                                 <td>Iron Man</td>
                                 <td>4</td>
                                 <td>Action</td>
                               </tr>
                               <tr>
                                 <td>Harry Potter</td>
                                 <td>4</td>
                                 <td>Science Fiction</td>
                               </tr>
                               <tr>
                                 <td>The Revenant</td>
                                 <td>5</td>
                                 <td>Action</td>
                               </tr>
                               <tr>
                                 <td>Fargo</td>
                                 <td>5</td>
                                 <td>Crime</td>
                               </tr>
                            </tbody>
                          </table>
                        </div>
                      </Row>
                          <div>

                          </div>
                        </div>
                  </div>

            </section>

            <section id="content3">
              <div className="tabs-content">
                    <div className="active">
                      <MPAACharts/>
                      <Row>
                      <div id="table_data">
                        <div id="table_search">
                          <input type="text" id="search_table" placeholder="Search..." title="Type Search" />
                        </div>
                        <div className="clearfix"></div>
                      <table id="data_table" className="title-data rwd-table">
                        <thead>
                        <tr>
                          <th>Title</th>
                          <th>Stars</th>
                          <th>Genres</th>
                          <th>MPAA Rating</th>
                         </tr>
                         </thead>
                         <tbody>
                           <tr>
                             <td>GoodFellas</td>
                             <td>5</td>
                             <td>Crime</td>
                             <td>R</td>
                           </tr>
                           <tr>
                             <td>Pretty Woman</td>
                             <td>3</td>
                             <td>Comedy</td>
                              <td>PG-13</td>
                           </tr>
                           <tr>
                             <td>Star Trek</td>
                             <td>4</td>
                             <td>Science Fiction</td>
                              <td>PG-13</td>
                           </tr>
                           <tr>
                             <td>Boyhood</td>
                             <td>5</td>
                             <td>Drama</td>
                              <td>G</td>
                           </tr>
                           <tr>
                             <td>The Dark Knight</td>
                             <td>4</td>
                             <td>Action</td>
                              <td>PG-13</td>
                           </tr>
                           <tr>
                             <td>Shindler's List</td>
                             <td>5</td>
                             <td>Drama</td>
                              <td>R</td>
                           </tr>
                           <tr>
                             <td>Twilight</td>
                             <td>3</td>
                             <td>Science Fiction</td>
                              <td>PG-13</td>
                           </tr>
                           <tr>
                             <td>Inception</td>
                             <td>4</td>
                             <td>Science Fiction</td>
                              <td>R</td>
                           </tr>
                           <tr>
                             <td>Titanic</td>
                             <td>5</td>
                             <td>Romance</td>
                              <td>PG-13</td>
                           </tr>
                           <tr>
                             <td>Iron Man</td>
                             <td>4</td>
                             <td>Action</td>
                              <td>PG-13</td>
                           </tr>
                           <tr>
                             <td>Harry Potter</td>
                             <td>4</td>
                             <td>Science Fiction</td>
                              <td>G</td>
                           </tr>
                           <tr>
                             <td>The Revenant</td>
                             <td>5</td>
                             <td>Action</td>
                              <td>R</td>
                           </tr>
                           <tr>
                             <td>Fargo</td>
                             <td>5</td>
                             <td>Crime</td>
                              <td>R</td>
                           </tr>
                        </tbody>
                      </table>
                    </div>
                  </Row>
                      <div>

                      </div>
                    </div>
              </div>
            </section>

            <section id="content4">
              <div className="tabs-content">
                    <div className="active">
                      <ReleaseCharts/>
                      <Row>
                      <div id="table_data">
                        <div id="table_search">
                          <input type="text" id="search_table" placeholder="Search..." title="Type Search" />
                        </div>
                        <div className="clearfix"></div>
                      <table id="data_table" className="title-data rwd-table">
                        <thead>
                        <tr>
                          <th>Title</th>
                          <th>Stars</th>
                          <th>Genres</th>
                          <th>MPAA Rating</th>
                          <th>Release Year</th>
                         </tr>
                         </thead>
                         <tbody>
                           <tr>
                             <td>GoodFellas</td>
                             <td>5</td>
                             <td>Crime</td>
                             <td>R</td>
                             <td>1995</td>
                           </tr>
                           <tr>
                             <td>Pretty Woman</td>
                             <td>3</td>
                             <td>Comedy</td>
                              <td>PG-13</td>
                              <td>1998</td>
                           </tr>
                           <tr>
                             <td>Star Trek</td>
                             <td>4</td>
                             <td>Science Fiction</td>
                              <td>PG-13</td>
                              <td>1975</td>
                           </tr>
                           <tr>
                             <td>Boyhood</td>
                             <td>5</td>
                             <td>Drama</td>
                              <td>G</td>
                              <td>1985</td>
                           </tr>
                           <tr>
                             <td>The Dark Knight</td>
                             <td>4</td>
                             <td>Action</td>
                              <td>PG-13</td>
                              <td>2006</td>
                           </tr>
                           <tr>
                             <td>Shindler's List</td>
                             <td>5</td>
                             <td>Drama</td>
                              <td>R</td>
                              <td>1960</td>
                           </tr>
                           <tr>
                             <td>Twilight</td>
                             <td>3</td>
                             <td>Science Fiction</td>
                              <td>PG-13</td>
                              <td>2008</td>
                           </tr>
                           <tr>
                             <td>Inception</td>
                             <td>4</td>
                             <td>Science Fiction</td>
                              <td>R</td>
                              <td>2012</td>
                           </tr>
                           <tr>
                             <td>Titanic</td>
                             <td>5</td>
                             <td>Romance</td>
                              <td>PG-13</td>
                              <td>1996</td>
                           </tr>
                           <tr>
                             <td>Iron Man</td>
                             <td>4</td>
                             <td>Action</td>
                              <td>PG-13</td>
                              <td>2003</td>
                           </tr>
                           <tr>
                             <td>Harry Potter</td>
                             <td>4</td>
                             <td>Science Fiction</td>
                              <td>G</td>
                              <td>2005</td>
                           </tr>
                           <tr>
                             <td>The Revenant</td>
                             <td>5</td>
                             <td>Action</td>
                              <td>R</td>
                              <td>2016</td>
                           </tr>
                           <tr>
                             <td>Fargo</td>
                             <td>5</td>
                             <td>Crime</td>
                              <td>R</td>
                              <td>2012</td>
                           </tr>
                        </tbody>
                      </table>
                    </div>
                  </Row>
                      <div>

                      </div>
                    </div>
              </div>
            </section>
          </div>
       </div>
    );
  }
}

export default SideBar;
