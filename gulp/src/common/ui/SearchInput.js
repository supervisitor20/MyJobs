import React, {PropTypes, Component} from 'react';
import classnames from 'classnames';


/**
 * Dropdown search box which empties itself after selecting an item.
 */
export class SearchInput extends Component {
  constructor() {
    super();
    this.state = this.getDefaultState('');
  }

  onInputChange(event) {
    const value = event.target.value;
    this.setState({value});
    if (value) {
      this.search(value);
    }
  }

  onInputBlur() {
    const {value, mouseInMenu} = this.state;
    // When the user clicks a menu item, this blur event fires before the click
    // event in the dropdown menu. Our usual handling of blur makes handling the
    // click impossible. Avoid our usual blur handling if the pointer is in the
    // dropdown menu.
    if (mouseInMenu) {
      this.focus();
    } else {
      const {onBlur, callSelectWhenEmpty, onSelect: selectCb} = this.props;
      if (callSelectWhenEmpty && value === '') {
        selectCb('');
      }
      onBlur();
      this.clear(value);
    }
  }

  onMouseInMenu(value) {
    this.setState({mouseInMenu: value});
  }

  onSelect(e, index) {
    e.preventDefault();
    const {onSelect: selectCb} = this.props;
    const {items} = this.state;
    const selected = items[index];
    selectCb(selected);
    const {emptyOnSelect} = this.props;
    if (emptyOnSelect) {
      this.clear('');
    } else {
      this.clear(selected.display);
    }
  }

  onInputKeyDown(event) {
    const {items, keySelectedIndex} = this.state;
    if (items.length) {
      let newIndex = keySelectedIndex;
      let killEvent = false;
      const lastIndex = items.length - 1;
      if (event.key === 'ArrowDown') {
        killEvent = true;
        if (keySelectedIndex < 0 || keySelectedIndex >= lastIndex) {
          newIndex = 0;
        } else {
          newIndex += 1;
        }
      } else if (event.key === 'ArrowUp') {
        killEvent = true;
        if (keySelectedIndex <= 0 || keySelectedIndex > lastIndex) {
          newIndex = lastIndex;
        } else {
          newIndex -= 1;
        }
      } else if (event.key === 'Enter') {
        killEvent = true;
        if (keySelectedIndex >= 0 && keySelectedIndex <= lastIndex) {
          this.onSelect(keySelectedIndex);
          return;
        }
      } else if (event.key === 'Escape') {
        killEvent = true;
        this.clear('');
      }
      if (killEvent) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.setState({keySelectedIndex: newIndex});
    }
  }

  getDefaultState(value) {
    return {
      value,
      mouseInMenu: false,
      keySelectedIndex: -1,
      items: [],
    };
  }

  async search(value) {
    const {getHints} = this.props;
    const items = await getHints(value);
    this.setState({items});
  }

  focus() {
    const {input} = this.refs;
    input.focus();
  }

  clear(newValue) {
    this.setState(this.getDefaultState(newValue));
  }

  suggestId() {
    const {id} = this.props;
    return id + '-suggestions';
  }

  itemId(index) {
    const id = this.suggestId();
    if (index <= 0) {
      return null;
    }
    return this.suggestId(id) + '-' + index.toString();
  }

  render() {
    const {id, theme, placeholder} = this.props;
    const {value, items, keySelectedIndex} = this.state;
    const suggestId = id + '-suggestions';

    const showItems = Boolean(items.length);
    const activeId = this.itemId(keySelectedIndex);

    return (
      <div
        className={classnames(
          theme.root,
          {[theme.rootOpen]: items})}>
        <input
          className={theme.input}
          ref="input"
          placeholder={placeholder}
          onChange={e => this.onInputChange(e)}
          onBlur={e => this.onInputBlur(e)}
          onKeyDown={e => this.onInputKeyDown(e)}
          value={value}
          type="search"
          aria-autocomplete="list"
          aria-owns={suggestId}
          aria-expanded={showItems}
          aria-activedescendant={activeId}/>
        {showItems ?
          <ul
            id={this.suggestId()}
            className={theme.suggestions}
            onMouseEnter={() => this.onMouseInMenu(true)}
            onMouseLeave={() => this.onMouseInMenu(false)}>
            {items.map((item, index) =>
              <li
                id={this.itemId(index)}
                key={item.key}
                className={classnames(
                  theme.item,
                  {
                    [theme.itemActive]: index === keySelectedIndex,
                  })}>
                <a
                  href="#"
                  onClick={e => this.onSelect(e, index)}>
                  {item.display}
                </a>
              </li>
            )}
          </ul>
        : null}
      </div>
    );
  }
}

SearchInput.defaultProps = {
  onBlur: () => {},
  emptyOnSelect: false,
  callSelectWhenEmpty: false,
  theme: {
    root: 'dropdown',
    rootOpen: 'open',
    input: '',
    suggestions: 'dropdown-menu',
    item: '',
    itemActive: 'active',
  },
};

SearchInput.propTypes = {
  /**
   * Id for the input control. Must be unique within the page.
   *
   * Intended to support wai-aria.
   */
  id: PropTypes.string.isRequired,

  /**
   * Callback: the user has selected an item.
   *
   * obj: the object selected by the user.
   */
  onSelect: PropTypes.func.isRequired,

  /**
   * Empty input contents after selecting an item.
   */
  emptyOnSelect: PropTypes.bool,

  /**
   * If the select field is empty, call onSelect anyway.
   */
  callSelectWhenEmpty: PropTypes.bool,

  /**
   * Placeholder text for the input control
   */
  placeholder: PropTypes.string,

  /**
   * Callback: the user has changed the input. Need hints.
   *
   * input: string with user input so far
   *
   * Return a promise of hints in this form:
   * [ {key: "key", display: "Display Value"} ]
   */
  getHints: PropTypes.func.isRequired,

  /**
   * Callback: the user has left the search input.
   */
  onBlur: PropTypes.func,

  /**
   * classes for various components
   *
   * root: Applied to the div containing the input and suggestions.
   * rootOpen: Applied to the root when open in addition to classes on root.
   * input: Applied to the input.
   * suggestions: Applied to the ul containing the suggestions.
   * item: Applied to the li containing a single suggestions.
   * itemActive: Applied to li selected via keyboard. (hover is used for mouse)
   */
  theme: PropTypes.object,
};
