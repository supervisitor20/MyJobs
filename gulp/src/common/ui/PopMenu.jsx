import React, {Component, PropTypes} from 'react';
import ClickOutCompat from 'common/ui/ClickOutCompat';

export default class PopMenu extends Component {
  handleItemClick(item, e) {
    e.preventDefault();
    item.onSelect();
  }

  menuContents() {
    const {options, isMenuActive, closeAllPopups, isMenuPending} = this.props;
    const dropdownItems = options.map((item, index)=> {
      return (
        <li key={index} onClick={e => this.handleItemClick(item, e)}>
          {item.display}
        </li>
      );
    });
    if (isMenuActive === true & !isMenuPending) {
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
    const {toggleMenu, isMenuPending} = this.props;
    if (isMenuPending){
      return (
        <div style={{position: 'relative'}}>
          <span className="report-loader list-loader">
          </span>
          {this.menuContents()}
        </div>
      );
    }
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
  isMenuPending: PropTypes.bool,
  toggleMenu: PropTypes.func.isRequired,
  closeAllPopups: PropTypes.func,
};
