import React from 'react';
import {Component} from 'react';

class TableSearch extends Component {
  searchTableResults(){
  var input, filter, table, tr, td, i;
  input = document.getElementById("search_table");
  filter = input.value.toUpperCase();
  table = document.getElementById("data_table");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
  render() {
    return (
      <input onKeyUp={this.searchTableResults.bind(this)} type="text" id="search_table" placeholder="Search..." title="Type Search" />
    );
  }
}

export default TableSearch;
