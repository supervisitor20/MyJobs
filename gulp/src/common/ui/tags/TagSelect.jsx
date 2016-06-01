import React, {Component, PropTypes} from 'react';
import {Tag} from 'common/ui/tags/Tag';
import TextField from 'common/ui/TextField';
import {map, filter, find} from 'lodash-compat/collection';

/**
 * Selection control for tags.
 */
export default class TagSelect extends Component {
  constructor() {
    super();
    this.state = {
      selectDropped: false,
      keySelectedIndex: null,
      mouseInMenu: false,
      partial: null,
    };
  }

  setHighlight(tagValue, highlight) {
    const key = 'highlight-' + tagValue;
    const newState = {};
    newState[key] = highlight;
    this.setState(newState);
  }

  getHighlight(tagValue) {
    const key = 'highlight-' + tagValue;
    return this.state[key];
  }

  openSelectMenu() {
    this.setState({selectDropped: true});
  }

  closeSelectMenu() {
    this.setState({selectDropped: false});
  }

  toggleSelectMenu() {
    this.setState({selectDropped: !this.state.selectDropped});
  }

  handleFilterChange(value) {
    if (value) {
      this.setState({partial: value});
    } else {
      this.setState({partial: null});
    }
  }

  selectAll() {
    this.props.available.forEach((v) => {
      this.handleAdd(v);
    });
    this.closeSelectMenu();
  }

  handleAdd(tag) {
    const {onChoose} = this.props;
    this.setState({partial: ''});
    this.setHighlight(tag.value, false);
    onChoose(tag);
  }

  handleRemove(tag) {
    const {onRemove} = this.props;
    this.setHighlight(tag.value, false);
    onRemove(tag);
  }

  handleBlur() {
    const {mouseInMenu} = this.state;
    if (!mouseInMenu) {
      this.closeSelectMenu();
    }
  }

  handleMouseState(value) {
    this.setState({mouseInMenu: value});
  }

  renderTag(tag, handleClick, remove) {
    const highlight = this.getHighlight(tag.value);
    return (
      <Tag
        key={tag.value}
        display={tag.display}
        hexColor={tag.hexColor}
        onClick={() => handleClick(tag)}
        onMouseEnter={() => this.setHighlight(tag.value, true)}
        onMouseLeave={() => this.setHighlight(tag.value, false)}
        onRemoveTag={remove ? () => remove(tag) : undefined}
        highlight={highlight}/>
    );
  }

  render() {
    const {available, selected, placeholder, searchPlaceholder} = this.props;
    const {selectDropped, partial} = this.state;
    const filteredAvailable =
      filter(available, at =>
        (!partial ||
         at.display.toUpperCase().indexOf(partial.toUpperCase()) !== -1) &&
        !find(selected, st => st.value === at.value));

    return (
      <div className="tag-select-input-element"
        tabIndex="0"
        onBlur={e => this.handleBlur(e)}
        onMouseEnter={() => this.handleMouseState(true)}
        onMouseLeave={() => this.handleMouseState(false)}>
        <div
          className="tag-select-chosen-tags"
          onClick={() => this.toggleSelectMenu()}>
          {(selected.length !== 0)
            ? ''
            : (
              <span className="tag-select-placeholder">
                {placeholder}
              </span>
              )}
          {map(selected, t => this.renderTag(
              t,
              () => {},
              () => this.handleRemove(t)))}
        </div>
        {selectDropped ? (
          <div className="tag-select-menu-container">
            <div className="tag-select-menu">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-xs-12 col-md-8">
                    <TextField
                      name="name"
                      value={partial}
                      onChange={e => this.handleFilterChange(e.target.value)}
                      placeholder={searchPlaceholder} />
                  </div>
                  <div className="col-xs-12 col-md-4">
                    <div className="button" onClick={() => this.selectAll()}>Select All</div>
                  </div>
                </div>
                <div className="row">
                  {map(filteredAvailable, t => this.renderTag(
                      t,
                      () => this.handleAdd(t),
                      null))}
                </div>
              </div>
            </div>
          </div>
        ) : '' }
      </div>
    );
  }
}

TagSelect.defaultProps = {
  available: [{value: '', display: '', hexColor: ''}],
  searchPlaceholder: 'Type to filter',
  placeholder: 'Not specified',
};

TagSelect.propTypes = {
  /**
   * List of selected tags.
   */
  selected: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
      hexColor: PropTypes.string,
    })
  ).isRequired,
  /**
   * List of available tags.
   */
  available: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
      hexColor: PropTypes.string,
    })
  ).isRequired,
  /**
   * Function called when an available tag is selected.
   */
  onChoose: PropTypes.func.isRequired,
  /**
   * Function called when a selected tag is removed.
   */
  onRemove: PropTypes.func.isRequired,
  /**
   * placeholder text for tag search bar
   */
  searchPlaceholder: PropTypes.string,
  /**
   * placeholder text for select input
   */
  placeholder: PropTypes.any,
};
