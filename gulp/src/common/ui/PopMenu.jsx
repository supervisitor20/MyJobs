import React, {Component, PropTypes} from 'react';
import ClickOutCompat from 'common/ui/ClickOutCompat';


export default class PopMenu extends Component {
  constructor() {
    super();
    this.state = {
      isMenuActive: false,
    };
  }

  handleItemClick(item, e) {
    e.preventDefault();
    item.onSelect();
  }

  menuContents() {
    const {isMenuActive} = this.state;
    const {options} = this.props;
    const dropdownItems = options.map((item, index)=> {
      return (
        <li key={index}>
          <a href="#" onClick={e => this.handleItemClick(item, e)}>
            {item.display}
          </a>
        </li>
      );
    });
    if (isMenuActive === true) {
      return (
        <ClickOutCompat onClickOut={() => this.setState({isMenuActive: false})}>
          <div ref="menu" data-context="true" className="pop-menu">
            <ul>
              {dropdownItems}
            </ul>
          </div>
        </ClickOutCompat>
      );
    }
  }

  toggleMenu() {
    const {isMenuActive} = this.state;
    console.log('toggleMenu', isMenuActive);
    this.setState({isMenuActive: !isMenuActive});
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <span
          onClick={() => this.toggleMenu()}
          className="menuEllipses">
          &hellip;
        </span>
        {this.menuContents()}
      </div>
    );
  }
}

PopMenu.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      display: PropTypes.string.isRequired,
      onSelect: PropTypes.func.isRequired,
    })
  ),
};
