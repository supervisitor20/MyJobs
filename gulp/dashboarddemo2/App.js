import React from 'react';
import Header from './components/Header/Header';
import SideBar from './components/SideBar';
// import SideBar from './components/SideBar/SideBar';

class App extends React.Component {
  render(){
    return(
      <div>
        <nav className="fixed-nav-bar"></nav>
        <div id="page_wrapper">
          <SideBar/>
        </div>
      </div>
    );
  }
}

export default App;
