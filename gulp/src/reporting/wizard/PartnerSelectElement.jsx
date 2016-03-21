import React, {Component} from 'react';
import PartnersMultiselect from 'reporting/PartnersMultiselect';

export class SelectElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDropped: false,
      availablePartners: [],
      selectedPartners: [],
    };
    this.popSelectMenu = this.popSelectMenu.bind(this);
  }
  componentDidMount() {
    // get your data from props
  }
  popSelectMenu() {
    this.setState({selectDropped: !this.state.selectDropped});
  }
  selectFromMenu(itemKey) {
    const {onChange} = this.props;
    onChange(itemKey);
    this.popSelectMenu();
  }
  renderPartnerControl(itemKey) {
    if (itemKey && itemKey.key === 1) {
      return (
        <PartnersMultiselect
          availablePartners={this.state.availablePartners}
          selectedPartners={this.state.selectedPartners}
          ref="partners"/>
      );
    }
    return '';
  }
  render() {
    const {items, childSelectName, itemKey} = this.props;
    let item;
    let dropdown;
    const dropdownItems = [];
    if (this.state.selectDropped) {
      for (item of items) {
        if (item) {
          dropdownItems.push(<li key={item.key} onClick={this.selectFromMenu.bind(this, item)}>{item.name}</li>);
        }
      }
      dropdown = (
      <div className="select-element-menu-container">
        <ul>
          {dropdownItems}
        </ul>
      </div>
      );
    } else {
      dropdown = '';
    }
    return (
      <div>
        <div className="select-element-outer">
          <div className="select-element-input">
            <div className="select-element-chosen-container" onClick={this.popSelectMenu}>
              <span className="select-element-chosen">{childSelectName}</span>
              <span className="select-element-arrow">
                <b role="presentation"></b>
              </span>
            </div>
          </div>
          {dropdown}
        </div>
        <div className="partner-control-chosen">
          {this.renderPartnerControl(itemKey)}
        </div>
      </div>
    );
  }
}

SelectElement.propTypes = {
  items: React.PropTypes.array.isRequired,
  childSelectName: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired,
  itemKey: React.PropTypes.object,
};

SelectElement.defaultProps = {
  items: [
    {name: 'No filter', key: 0},
    {name: 'Filter by name', key: 1},
  ],
  childSelectName: 'this is a test',
};
