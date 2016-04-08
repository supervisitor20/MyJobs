import React, {Component, PropTypes} from 'react';
import {Tag} from 'common/ui/tags/Tag';
import TextField from 'common/ui/TextField';
import {map, filter, find} from 'lodash-compat/collection';

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

  handleAdd(tag) {
    const {onChooseTag} = this.props;
    this.setState({partial: ''});
    this.setHighlight(tag.value, false);
    onChooseTag(tag);
  }

  handleRemove(tag) {
    const {onRemoveTag} = this.props;
    onRemoveTag(tag);
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

  renderTag(tag, handleClick, removeTag) {
    const highlight = this.getHighlight(tag.value);
    return (
      <Tag
        key={tag.value}
        display={tag.display}
        hexColor={tag.hexColor}
        onClick={() => handleClick(tag)}
        onMouseEnter={() => this.setHighlight(tag.value, true)}
        onMouseLeave={() => this.setHighlight(tag.value, false)}
        onRemoveTag={removeTag ? () => removeTag(tag) : undefined}
        highlight={highlight}/>
    );
  }

  render() {
    const {availableTags, selectedTags, first} = this.props;
    const {selectDropped, partial} = this.state;
    const filteredAvailableTags =
      filter(availableTags, at =>
        (!partial ||
         at.display.toUpperCase().indexOf(partial.toUpperCase()) !== -1) &&
        !find(selectedTags, st => st.value === at.value));

    return (
      <div
        tabIndex="0"
        onBlur={e => this.handleBlur(e)}
        onMouseEnter={() => this.handleMouseState(true)}
        onMouseLeave={() => this.handleMouseState(false)}>
        <div className="tag-select-first-input">
          {first
            ? <label>Include any of these tags</label>
            : <label><b>AND</b> any of these tags</label>}
          <div className="tag-select-input-element">
            <div
              className="tag-select-chosen-tags"
              onClick={() => this.toggleSelectMenu()}>
              {selectedTags
                ? ''
                : (
                  <span className="tag-select-placeholder">
                    Select tags
                  </span>
                  )}
              {map(selectedTags, t => this.renderTag(
                  t,
                  () => {},
                  () => this.handleRemove(t)))}
            </div>
            {selectDropped ? (
              <div className="tag-select-menu-container">
                <div className="tag-select-menu">
                  <TextField
                    name="name"
                    value={partial}
                    onChange={e => this.handleFilterChange(e.target.value)}
                    placeholder="Type to filter tags"/>
                  {map(filteredAvailableTags, t => this.renderTag(
                      t,
                      () => this.handleAdd(t),
                      null))}
                </div>
              </div>
            ) : '' }
          </div>
        </div>
      </div>
    );
  }
}

TagSelect.propTypes = {
  first: PropTypes.bool,
  selectedTags: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
      hexColor: PropTypes.string.isRequired,
    })
  ).isRequired,
  availableTags: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
      hexColor: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChooseTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};

TagSelect.defaultProps = {
  first: true,
};
