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

  handleAdd(tag) {
    const {onChooseTag} = this.props;
    onChooseTag(tag);
  }

  handleRemove(tag) {
    const {onRemoveTag} = this.props;
    onRemoveTag(tag);
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
    const {selectDropped} = this.state;
    const filteredAvailableTags =
      filter(availableTags, at =>
        !find(selectedTags, st => st.value === at.value));

    return (
      <div tabIndex="0" onBlur={() => this.closeSelectMenu()}>
        <div className="tag-select-first-input">
          {first
            ? <label>Include any of these tags</label>
            : <label><b>AND</b> any of these tags</label>}
          <div className="tag-select-input-element"
            onClick={() => this.toggleSelectMenu()}>
            <div
              className="tag-select-chosen-tags">
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
                    onChange={e => this.addToMultifilter('newEntryJS', e)}
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
