import React from 'react';
import { Component } from 'react';

class DimensionList extends Component {
 render(){
   return(
     <div className="dimension_list">
       <span className="dimension-title">
         <span className="add-dimension">Add Dimension</span>
         <span className="dimension-icon"></span>
         <span className="dimension-icon"></span>
       </span>
       <ul className="list">
       <li><a href="#">Dimension 1</a></li>
         <li><a href="#">Dimension 2</a></li>
         <li><a href="#">Dimension 3</a></li>
         <li><a href="#">Dimension 4</a></li>
        <li><a href="#">Dimension 5</a></li>
       </ul>
     </div>
   );
 }
}

export default DimensionList;
