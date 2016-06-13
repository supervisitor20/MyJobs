import React, {PropTypes, Children} from 'react';
import warning from 'warning';
import {getDisplayForValue} from 'common/array';
import {indexBy} from 'lodash-compat/collection';
import Select from 'common/ui/Select';


/**
 * Generic select dropdown which shows different vdom based on which item
 * is currently selected.
 *
 * example:
 *
 *  <SelectControls
 *    choices={[
 *      {value: 'a', display: 'Choose A content'},
 *      {value: 'b', display: 'Choose B content'},
 *    ]}
 *    value={'a'}
 *    onSelect={value => ...}>
 *    <div value="a">A content here.</div>
 *    <div value="b">B content here.</div>
 *  </SelectControls>
 */
export default function SelectControls(props) {
  const {choices, children, value, onSelect, loading, decoration} = props;

  const display = getDisplayForValue(choices, value);

  const childIndex = indexBy(
    Children.toArray(children),
    c => c.props.value);

  const child = childIndex[value];
  warning(child, 'SelectControls cannot render ' + value + ': ' + child);


  let contents;
  if (loading) {
    contents = (
      <span>
        <span className="counter">
          <span className="report-loader"></span>
        </span>
        {display}
      </span>
    );
  } else if (decoration) {
    contents = (
      <span>
        <span className="counter">
          {decoration}
        </span>
        {display}
      </span>
    );
  } else {
    contents = display;
  }

  return (
    <div>
      <Select
        name=""
        onChange={v => onSelect(v.target.value)}
        value={contents}
        choices={choices}
        disable={loading}
      />
      <div className="select-control-chosen">
        {child || ''}
      </div>
    </div>
  );
}

SelectControls.propTypes = {
  /**
   * Choices to display [{value: ..., display: 'some string'}]
   */
  choices: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,

  /**
   * Currently selected choice, must correspond to a value in choices.
   */
  value: PropTypes.any.isRequired,

  /**
   * Content to show. Selection is made at the root level of this child based
   * on the value prop of the child.
   *
   * example:
   *  <div value="a">
   *  <div value="b">
   *
   * The above example renders only the div with the value 'a' if the value of
   * this control is 'a'.
   */
  children: PropTypes.node.isRequired,

  /**
   * Function to call if the user makes a new selection.
   */
  onSelect: PropTypes.func.isRequired,

  /**
   * disable this control while we load?
   */
  loading: PropTypes.bool,

  /**
   * text to show along with the displayed value in the main select
   */
  decoration: PropTypes.string,
};
