import React, {PropTypes, Component} from 'react';
import {
    WizardPageReportingTypes,
    WizardPageReportTypes,
    WizardPageDataTypes,
    WizardPagePresentationTypes,
    WizardPageFilter,
} from './wizard';

// Props for this component come directly from the store state. (see main.js).
export class DynamicReportApp extends Component {
  constructor() {
    super();
    this.state = {pageIndex: null, error: null, reportList: []};
  }

  async componentDidMount() {
    await this.refreshReportList();
    await this.reportingTypesPage();
  }

  async reset() {
    const {reportFinder} = this.props;

    const reportingTypes = await reportFinder.getReportingTypes();

    this.setState({
      ...this.state,
      pageIndex: 'reportingTypes',
      reportingTypes: reportingTypes,
    });
  }

  async refreshReportList() {
    const {reportFinder} = this.props;
    const reportList = await reportFinder.getReportList();

    this.setState({
      ...this.state,
      reportList: reportList,
    });
  }

  async reportingTypesPage() {
    const {reportFinder} = this.props;
    const reportingTypes = await reportFinder.getReportingTypes();
    this.setState({
      ...this.state,
      pageIndex: 'reportingTypes',
      reportingTypes: reportingTypes,
    });
  }

  async reportTypesPage(reportingTypeId) {
    const {reportFinder} = this.props;
    const reportTypes =
            await reportFinder.getReportTypes(reportingTypeId);
    this.setState({
      ...this.state,
      pageIndex: 'reportTypes',
      reportTypes: reportTypes,
    });
  }

  async dataTypesPage(reportTypeId) {
    const {reportFinder} = this.props;
    const dataTypes =
            await reportFinder.getDataTypes(reportTypeId);
    this.setState({
      ...this.state,
      reportTypeId: reportTypeId,
      pageIndex: 'dataTypes',
      dataTypes: dataTypes,
    });
  }

  async presentationTypesPage(reportTypeId, dataTypeId) {
    const {reportFinder} = this.props;
    const presentationTypes =
            await reportFinder.getPresentationTypes(
                reportTypeId, dataTypeId);
    this.setState({
      ...this.state,
      pageIndex: 'presentationTypes',
      presentationTypes: presentationTypes,
    });
  }

  async filterPage(rpId) {
    const {reportFinder} = this.props;

    const reportConfig =
          await reportFinder.buildReportConfiguration(
              rpId,
              () => this.refreshReportList());

    this.setState({
      ...this.state,
      lastRpId: rpId,
      pageIndex: 'filter',
      reportConfig: reportConfig,
    });
  }

  render() {
    const {pageIndex, error, reportList} = this.state;
    let page;
    if (error) {
      page = <div><h3>Error!</h3></div>;
    } else {
      switch (pageIndex) {
      case 'reportingTypes':
        const {reportingTypes} = this.state;
        page = (
          <WizardPageReportingTypes
            data={reportingTypes}
            selected={id => this.reportTypesPage(id)}/>
        );
        break;
      case 'reportTypes':
        const {reportTypes} = this.state;
        page = (
          <WizardPageReportTypes
              data={reportTypes}
              selected={id => this.dataTypesPage(id)}/>
        );
        break;
      case 'dataTypes':
        const {reportTypeId, dataTypes} = this.state;
        page = (
          <WizardPageDataTypes
            data={dataTypes}
            selected={dataTypeId =>
              this.presentationTypesPage(
                reportTypeId, dataTypeId)}/>
        );
        break;
      case 'presentationTypes':
        const {presentationTypes} = this.state;
        page = (
          <WizardPagePresentationTypes
            data={presentationTypes}
            selected={id => this.filterPage(id)}/>
        );
        break;
      case 'filter':
        const {reportConfig} = this.state;
        page = (
          <WizardPageFilter
            reportConfig={reportConfig}/>
        );
        break;
      default:
        page = null;
      }
    }

    return (
      <div className="container">
        <div className="row">
          <div className="span8 panel">
            {page}
          </div>
          <div className="span4">
            <ReportList reports={reportList}/>
          </div>
        </div>
      </div>
    );
  }
}

DynamicReportApp.propTypes = {
  reportFinder: PropTypes.object.isRequired,
};


function ReportList(props) {
  const reportData = props.reports.map(report => ({
    id: report.id,
    href: '/reports/view/dynamicdownload?id=' + report.id,
  }));
  const reportLinks = reportData.map(r =>
    <li key={r.id}>
      <a href={r.href}>Report id: {r.id}</a>
    </li>
  );

  return (
    <div>
      <div className="sidebar">
        <h2 className="top">Reports</h2>
        {reportLinks}
      </div>
    </div>
  );
}

ReportList.propTypes = {
  reports: PropTypes.arrayOf(PropTypes.object).isRequired,
};
