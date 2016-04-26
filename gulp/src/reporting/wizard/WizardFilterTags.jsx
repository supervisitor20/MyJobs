import React, {PropTypes, Component} from 'react';
import {AndOrContainer} from 'common/ui/tags/AndOrContainer';

export class WizardFilterTags extends Component {
  render() {
    const {tags, addTag, removeTag, getHints} = this.props;
    return (
      <AndOrContainer
        allItems={[]}
        andGroup={tags}
        addTag={addTag}
        removeTag={removeTag}
        getHints={getHints}/>
    );
  }
}

WizardFilterTags.propTypes = {
  tags: React.Proptypes.array.isRequired,
  addTag: React.Proptypes.func.isRequired,
  removeTag: React.Proptypes.func.isRequired,
  getHints: React.Proptypes.func.isRequired,
};
