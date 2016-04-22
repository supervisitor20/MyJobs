import React from 'react';

/* globals document */
export default class PopMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      isMenuActive: false,
    };
  }

  menuContents() {
    const {isMenuActive} = this.state;
    const {options} = this.props;
    const dropdownItems = options.map((item, index)=> {
      return (
        <li key={index}>
          <a href="#">
            {item.display}
          </a>
        </li>
      );
    });
    if (isMenuActive === true) {
      return (
        <div ref="menu" data-context="true" className="pop-menu">
          <ul>
            {dropdownItems}
          </ul>
        </div>
      );
    }
  }

  toggleMenu() {
    const {isMenuActive} = this.state;
    if (isMenuActive === true) {
      this.setState({isMenuActive: false});
    } else {
      this.setState({isMenuActive: true});
    }
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <span onClick={(e) => this.toggleMenu(e)} className="menuEllipses">&hellip;</span>
        {this.menuContents()}
      </div>
    );
  }
}

PopMenu.propTypes = {
  options: React.PropTypes.any,
};
