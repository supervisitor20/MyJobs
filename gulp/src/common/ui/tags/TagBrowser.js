import React, {Component, PropTypes} from 'react';
import {Tag} from './Tag';


/**
 * Box of collected items with a search box for adding more.
 */
export class TagBrowser extends Component {
  constructor() {
    super();
    this.state = {
      tags: [],
      searchValue: '',
    };
  }

  componentDidMount() {
    this.search('');
  }

  async onChangeSearch(event) {
    this.search(event.target.value);
  }

  async search(value) {
    const {getHints} = this.props;
    this.setState({'searchValue': value});
    const hints = await getHints(value);
    this.setState({'tags': hints});
  }

  render() {
    const {highlights, highlightTag} = this.props;
    const {tags, searchValue} = this.state;
    return (
      <div>
        <div className="search">
          <span className="search-label">Search</span>
          <input
            className="search-input"
            type="search"
            value={searchValue}
            placeholder="Type item and hit Enter"
            onChange={e => this.onChangeSearch(e)}/>
          <span className="search-icon">
            <i className="fa fa-search"></i>
            <div></div>
          </span>
        </div>
        <div className="item-container"> {
          tags.map(i =>
            <Tag
              key={i.key}
              display={i.display}
              hexColor={i.hexColor}
              onClick={() => highlightTag(i)}
              highlight={Boolean(highlights[i.key])}/>
          )
        }
        </div>
      </div>
    );
  }
}

TagBrowser.propTypes = {
  /**
   * Callback: The user wants hints for a given partial string.
   */
  getHints: PropTypes.func.isRequired,

  /**
   * Object containing currently highlighted tag keys.
   * { tagkey: true }
   */
  highlights: PropTypes.object.isRequired,

  /**
   * Callback: the user highlighted a tag
   */
  highlightTag: PropTypes.func.isRequired,
};
