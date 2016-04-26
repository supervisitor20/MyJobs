import React, {PropTypes, Component} from 'react';
import OldPreviewEmbed from './OldPreviewEmbed';
import {Loading} from 'common/ui/Loading';


/**
 * Page handling React components pertaining to the old report preview.
 *
 * Handle simple React components and loading state here.
 */
export default class OldPreviewEmbedPage extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }

  onLoading(loading) {
    this.setState({loading});
  }

  render() {
    const {reportId} = this.props.params;
    const {reportName, reportType} = this.props.location.query;
    const {loading} = this.state;
    return (
      <div>
        {loading ? <Loading/> : ''}
        <OldPreviewEmbed
          reportId={reportId}
          reportName={reportName}
          reportType={reportType}
          onLoading={(l) => this.onLoading(l)}
          />
      </div>
    );
  }
}

OldPreviewEmbedPage.propTypes = {
  location: React.Proptypes.shape({
    query: React.Proptypes.shape({
      /**
       * Name of the report being previewed
       */
      reportName: React.Proptypes.string.isRequired,
      /**
       * Report type being previewed.
       */
      reportType: React.Proptypes.string.isRequired,
    }),
  }),
  params: React.Proptypes.shape({
    /**
     * Id of report being previewed.
     */
    reportId: React.Proptypes.string.isRequired,
  }).isRequired,
};
