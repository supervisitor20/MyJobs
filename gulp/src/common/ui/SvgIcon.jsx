import React, {PropTypes} from 'react';
import {isIE8} from 'common/browserSpecific.js';

function SvgIcon(props) {
  const {png, svg, svgID, iconClass} = props;
  if (isIE8) {
    return (
      <img src={png} />
    );
  }
  return (
    <svg className={iconClass}>
      <use xlinkHref={svg + '#' + svgID}/>
    </svg>
  );
}

export default SvgIcon;

SvgIcon.propTypes = {
  /**
   * File name of the png file to send IE8
   */
  png: PropTypes.string.isRequired,
  /**
   * File name of the svg file for all modern browsers
   */
  svg: PropTypes.string.isRequired,
  /**
   * ID of the vector icon within the SVG source
   */
  svgID: PropTypes.string.isRequired,
  /**
   * Optional classname to apply to the SVG data for style/DOM manipulation
   */
  iconClass: PropTypes.string,
};
