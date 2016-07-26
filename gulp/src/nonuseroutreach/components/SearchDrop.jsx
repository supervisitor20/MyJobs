import React, {Component, PropTypes} from 'react';
import {map} from 'lodash-compat/collection';
import {connect} from 'react-redux';
import {typingDebounce} from 'common/debounce';
import classnames from 'classnames';
import {SmoothScroller} from 'common/dom';

import {
  doSearch,
  searchUpdateAction,
  resetSearchOrAddAction,
  addToActiveIndexAction,
  setActiveIndexAction,
  searchResultSelectedAction,
} from 'nonuseroutreach/actions/search-or-add-actions';

export default class SearchDrop extends Component {
  constructor(props) {
    super();

    const {dispatch, instance} = props;
    this.debouncedOnSearch = typingDebounce(() =>
        dispatch(doSearch(instance)));
    this.liRefs = {};
    this.movedByKeyboard = false;
    this.mouseInDrop = false;
  }

  componentDidMount() {
    this.scroller = new SmoothScroller(v => this.scrollTo(v));
  }

  componentWillUnmount() {
    this.scroller.destroy()
  }

  componentDidUpdate(prevProps) {
    const {activeIndex: prevActiveIndex} = prevProps;
    const {activeIndex} = this.props;

    if (prevActiveIndex !== activeIndex) {
      if (this.movedByKeyboard) {
        this.movedByKeyboard = false;
        this.springToActiveLi();
      } else {
        if (this.container) {
          this.spring.setCurrentValue(this.container.scrollTop);
        }
      }
    }
  }

  handleBlur() {
    if (!this.mouseInDrop) {
      const {dispatch, instance} = this.props;
      dispatch(resetSearchOrAddAction(instance));
    }
  }

  handleSearchChange(e) {
    const {dispatch, instance} = this.props;
    const value = e.target.value;

    dispatch(searchUpdateAction(instance, value));
    this.debouncedOnSearch();
  }

  handleMouseOver(i) {
    const {dispatch, instance} = this.props;
    dispatch(setActiveIndexAction(instance, i));
  }

  handleSelect() {
    const {
      dispatch,
      instance,
      results,
      activeIndex,
      searchString,
      onSelect,
      onAdd,
    } = this.props;
    if(results && results.length) {
      const result = results[activeIndex]
      onSelect(result);
      dispatch(searchResultSelectedAction(instance, result));
    } else {
      const result = {value: null, display: searchString};
      onAdd(result);
      dispatch(searchResultSelectedAction(instance, result));
    }
  }

  handleLiRef(ref, i) {
    if (ref) {
      this.liRefs[i] = ref;
    } else {
      delete this.liRefs[i];
    }
  }

  springToActiveLi() {
    const {activeIndex} = this.props;
    if (!activeIndex && activeIndex !== 0) {
      return;
    }

    const ref = this.liRefs[activeIndex];
    this.scroller.springToShow(ref, this.container);
  }

  scrollTo(offset) {
    if (this.container) {
      this.container.scrollTop = offset;
    }
  }

  filterKeys(e) {
    const {dispatch, instance} = this.props;

    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleSelect();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      dispatch(resetSearchOrAddAction(instance));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.movedByKeyboard = true;
      dispatch(addToActiveIndexAction(instance, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.movedByKeyboard = true;
      dispatch(addToActiveIndexAction(instance, -1));
    }
  }

  renderResults() {
    const {results, searchString, activeIndex} = this.props;

    if (results.length) {
      return (
        <ul>
          {map(results, (result, i) => (
            <li
              key={i}
              ref={ref => this.handleLiRef(ref, i)}
              onMouseEnter={() => this.handleMouseOver(i)}
              onClick={() => this.handleSelect()}
              className={classnames(
                  {'active': i === activeIndex})}>
              {result.display}
            </li>
          ))}
        </ul>
      );
    }

    return `No results found for "${searchString}".`;
  }

  renderDropWrap(inner) {
    return (
      <div
        className="select-element-menu-container"
        ref={r => {this.container = r;}}
        onMouseEnter={() => {this.mouseInDrop = true;}}
        onMouseLeave={() => {this.mouseInDrop = false;}}
        >
        {inner}
      </div>
    );
  }

  renderDrop() {
    const {dispatch, instance, state, searchString, results} = this.props;
    if (state === 'PRELOADING' || state === 'LOADING') {
      return this.renderDropWrap('Loading...');
    } else if (state === 'RECEIVED' && results.length) {
      return this.renderDropWrap(this.renderResults());
    } else if (state === 'RECEIVED') {
      return this.renderDropWrap(
        <div>
          <div>{searchString}</div>
          <div>was not found in our database</div>
          <div>
            <button
              onClick={() => dispatch(resetSearchOrAddAction(instance))}
              className="button wide">
              Cancel
            </button>
            <button
              onClick={() => this.handleSelect()}
              className="button wide primary">
              Create
            </button>
          </div>
        </div>
      );
    }
    return '';
  }

  renderInput() {
    const {searchString, state, selected} = this.props;

    if (state === 'SELECTED') {
      return (
        <input
          className="search-or-add-loading-icon"
          value={selected.display}/>
      );
    }

    return (
      <input
        className={classnames({
          'search-or-add-create-icon': state === 'RECEIVED',
        })}
        onBlur={() => this.handleBlur()}
        onKeyDown={e => this.filterKeys(e)}
        type="search"
        value={searchString}
        onChange={e => this.handleSearchChange(e)}
        />
    );
  }

  render() {
    return (
      <div className="dropdown">
        {this.renderInput()}
        {this.renderDrop()}
      </div>
    );
  }
}

SearchDrop.defaultProps = {
  searchString: '',
};

SearchDrop.propTypes = {
  dispatch: PropTypes.func.isRequired,
  instance: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  searchString: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
    })),
  selected: PropTypes.shape({
    value: PropTypes.any.isRequired,
    display: PropTypes.string.isRequired,
  }),
  activeIndex: PropTypes.number,
  onAdd: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
};

export default connect((state, ownProps) => ({
  state: state.search[ownProps.instance].state,
  searchString: state.search[ownProps.instance].searchString,
  results: state.search[ownProps.instance].results,
  selected: state.search[ownProps.instance].selected,
  activeIndex: state.search[ownProps.instance].activeIndex,
}))(SearchDrop);
