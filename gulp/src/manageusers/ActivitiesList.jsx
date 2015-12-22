import React from 'react';

class ActivitiesList extends React.Component {
  render() {
    return (
      <div>
        <table className="table table-striped">

          {this.props.tablesOfActivitiesByApp}

        </table>
      </div>
    );
  }
}

ActivitiesList.propTypes = {
  tablesOfActivitiesByApp: React.PropTypes.array.isRequired,
};

export default ActivitiesList;
