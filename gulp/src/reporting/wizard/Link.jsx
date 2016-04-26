import React, {PropTypes, Component} from 'react';


export class Link extends Component {
  linkClick(e) {
    e.preventDefault();
    this.props.linkClick();
  }

  render() {
    return (
      <a className="" href="#" onClick={e => this.linkClick(e)}>
        {this.props.label}
      </a>
    );
  }
}

Link.propTypes = {
  linkClick: React.Proptypes.func.isRequired,
  label: React.Proptypes.string.isRequired,
};
