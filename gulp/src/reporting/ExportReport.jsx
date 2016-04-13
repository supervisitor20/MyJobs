import React, {Component, PropTypes} from 'react';
import {Loading} from 'common/ui/Loading';
import {map} from 'lodash-compat/collection';

export default class ExportReport extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      options: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const {reportFinder} = this.props;
    const {reportId} = this.props.routeParams;
    const options = await reportFinder.getExportOptions(reportId);
    this.setState({options, loading: false});
  }

  render() {
    const {loading, options} = this.state;
    if (loading) {
      return <Loading/>;
    }
    const baseUri = '/reports/view/dynamicdownload';
    const formatLinks = map(options.formats, o => ({
      display: o.display,
      value: o.value,
      href: `${baseUri}?id=${options.id}&report_presentation_id=${o.value}`,
    }));
    return (
      <div>
       {map(formatLinks, o =>
          <div key={o.value}><a href={o.href}>{o.display}</a></div>
        )}
      </div>
    );
  }
}

ExportReport.propTypes = {
  routeParams: PropTypes.shape({
    reportId: PropTypes.string.isRequired,
  }).isRequired,
  reportFinder: PropTypes.object.isRequired,
};
