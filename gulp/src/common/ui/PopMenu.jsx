import React, {Component, PropTypes} from 'react';
import ClickOutCompat from 'common/ui/ClickOutCompat';

export default class PopMenu extends Component {
  handleItemClick(item, e) {
    e.preventDefault();
    item.onSelect();
  }

  menuContents() {
    const {options, isMenuActive, closeAllPopups} = this.props;
    const dropdownItems = options.map((item, index)=> {
      return (
        <li key={index} onClick={e => this.handleItemClick(item, e)}>
          {item.display}
        </li>
      );
    });
    if (isMenuActive === true) {
      return (
        <ClickOutCompat onClickOut={() => closeAllPopups()}>
          <div ref="menu" data-context="true" className="pop-menu">
            <ul>
              {dropdownItems}
            </ul>
          </div>
        </ClickOutCompat>
      );
    }
  }

  render() {
    const {toggleMenu} = this.props;
    return (
      <div style={{position: 'relative'}}>
        <span
          onClick={(e) => toggleMenu(e)}
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
  isMenuActive: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  closeAllPopups: PropTypes.func,
};
