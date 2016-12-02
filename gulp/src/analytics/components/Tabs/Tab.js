import React from 'react';
import {Component} from 'react';
// import {Link} from 'react-router';

class Tab extends Component {
  render() {
    const {id} = this.props;
    // const links = this.props.data.map((link) => {
    //   return(
    //     <Link to={"/" + link.name}>{link.name}</Link>
    //   );
    // });
    return (
      <div>
          <input className="tab-input" name="tabbed" id={'tabbed' + id} type="radio" defaultChecked/>
          <label className="tab" htmlFor={'tabbed' + id}><span className="tab-label">{'Lorem ' + id}</span><span className="close-tab">X</span></label>
          {this.props.children}
      </div>
      );
  }
}

Tab.propTypes = {
  id: React.PropTypes.number.isRequired,
  children: React.PropTypes.element.isRequired,
};

export default Tab;
