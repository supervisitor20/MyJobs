import React, {Component, PropTypes} from 'react';
import {map} from 'lodash-compat/collection';
import {connect} from 'react-redux';
import {typingDebounce} from 'common/debounce';
import classnames from 'classnames';

import {
  doSearch,
  searchUpdateAction,
} from 'nonuseroutreach/actions/search-or-add-actions';

export default class SearchDrop extends Component {
  constructor(props) {
    super();

    const {dispatch, instance} = props;
    this.debouncedOnSearch = typingDebounce(() =>
        dispatch(doSearch(instance)));
  }

  handleSearchChange(e) {
    const {dispatch, instance} = this.props;
    const value = e.target.value;

    dispatch(searchUpdateAction(instance, value));
    this.debouncedOnSearch();
  }

  renderResults() {
    const {results, searchString} = this.props;

    if (results.length) {
      return (
        <ul>
          {map(results, r => (
            <li>{r.display}</li>
          ))}
        </ul>
      );
    }

    return `No results found for "${searchString}".`;
  }

  renderDropWrap(inner) {
    return (
      <div className="select-element-menu-container">
        {inner}
      </div>
    );
  }

  renderDrop() {
    const {state} = this.props;
    if (state === 'PRELOADING' || state === 'LOADING') {
      return this.renderDropWrap('Loading...');
    } else if (state === 'RECEIVED') {
      return this.renderDropWrap(this.renderResults());
    }
    return '';
  }

  render() {
    const {searchString, state} = this.props;

    return (
      <div className={classnames(
          'dropdown',
        )}>
        <input
          className={classnames({
            'search-or-add-create-icon': state === 'RECEIVED',
          })}
          type="search"
          value={searchString}
          onChange={e => this.handleSearchChange(e)}
          />
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
  onAdd: PropTypes.func,
};

export default connect((state, ownProps) => ({
  state: state.search[ownProps.instance].state,
  searchString: state.search[ownProps.instance].searchString,
  results: state.search[ownProps.instance].results,
  selected: state.search[ownProps.instance].selected,
}))(SearchDrop);
