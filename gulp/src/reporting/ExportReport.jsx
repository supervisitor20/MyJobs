import React, {Component, PropTypes} from 'react';
import {Loading} from 'common/ui/Loading';
import SortableField from './SortableField';
import Select from 'common/ui/Select';
import Reorder from 'react-reorder';
import {map, filter, forEach, find} from 'lodash-compat/collection';
import {get} from 'lodash-compat/object';
import {getDisplayForValue} from 'common/array';
import {isIE8} from 'common/browserSpecific';

export default class ExportReport extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      sortDirection: 'ascending',
      sortBy: '',
      selectAll: true,
      fieldsSelected: [],
      options: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  onReorder(event, item, index, newIndex) {
    const {fieldsSelected} = this.state;
    const newFieldsSelected = [...fieldsSelected];
    const removed = newFieldsSelected.splice(index, 1);
    newFieldsSelected.splice(newIndex, 0, ...removed);
    this.setState({fieldsSelected: newFieldsSelected});
  }

  onCheck(e) {
    const checked = e.target.checked;
    const {fieldsSelected, sortBy: oldSortBy} = this.state;
    const newFieldsSelected = [...fieldsSelected];

    // If unchecking, set select all to false.
    if (!checked) {
      this.setState({selectAll: false});
    }

    // Find field, set checked status.
    const field = find(newFieldsSelected, item => item.value === e.target.id);
    if (field) {
      field.checked = checked;
    }

    const newSortBy = this.findBestSortByValue(newFieldsSelected, oldSortBy);

    this.setState({
      fieldsSelected: newFieldsSelected,
      sortBy: newSortBy,
    });
  }

  onCheckAll(e) {
    const checked = e.target.checked;
    const {fieldsSelected, sortBy: oldSortBy} = this.state;
    const newFieldsSelected = [...fieldsSelected];
    forEach(newFieldsSelected, (item)=> {item.checked = checked;});
    const newSortBy = this.findBestSortByValue(newFieldsSelected, oldSortBy);
    this.setState({
      selectAll: checked,
      fieldsSelected: newFieldsSelected,
      sortBy: newSortBy,
    });
  }

  findBestSortByValue(fieldsSelected, sortBy) {
    const field = find(fieldsSelected, item => item.value === sortBy);
    if (field && field.checked) {
      // We're fine. Sort by field is still valid.
      return sortBy;
    }

    // We're sorting by an unchecked or otherwise invalid field.
    // Sort by the first checked field.
    const firstSelected = find(fieldsSelected, item => item.checked);
    if (firstSelected) {
      return firstSelected.value;
    }

    // Nothing is checked or we're in some bad state.
    return '';
  }

  async loadData() {
    const {reportFinder} = this.props;
    const {reportId} = this.props.routeParams;
    const options = await reportFinder.getExportOptions(reportId);

    const fields = options.report_options.values;
    const sortBy = get(fields, '[0].value');
    const fieldsSelected = map(fields, o =>
      ({...o, checked: true}));

    const formats = options.report_options.formats;
    const formatId = get(formats, '[0].value', null);

    this.setState({
      loading: false,
      recordCount: options.count,
      reportId: options.report_options.id,
      fieldsSelected,
      formatId,
      formats,
      sortBy,
    });
  }

  buildExportHref() {
    const {
      reportId,
      formatId,
      sortBy,
      sortDirection,
      fieldsSelected,
    } = this.state;
    const baseUri = '/reports/view/dynamicdownload';

    const values = map(
        filter(fieldsSelected, f => f.checked),
        f => `&values=${f.value}`).join('');

    return (
      baseUri
      + `?id=${reportId}`
      + `&report_presentation_id=${formatId}`
      + `&order_by=${sortBy}`
      + `&direction=${sortDirection}`
      + values);
  }

  render() {
    const {
      recordCount,
      loading,
      formats,
      formatId,
      sortBy,
      sortDirection,
      fieldsSelected,
      selectAll,
    } = this.state;

    const sortDirectionChoices = [
      {value: 'ascending', display: 'Ascending'},
      {value: 'descending', display: 'Descending'},
    ];
    const sortableFields = filter(fieldsSelected, f => f.checked === true);

    if (loading) {
      return <Loading/>;
    }

    // Note that we pass in a copy of fieldsSelected to protect ourselves
    // from some side effects of mutation done by Reorder on the array
    // passed through its list property.
    return (
      <div id="export-page">
        <div className="row">
          <div className="col-md-4 col-xs-12">
            <label>Sort By:</label>
          </div>
          <div className="col-md-8 col-xs-12">
            <div className="row">
              <div className="col-md-6 col-xs-12">
                <Select
                  name=""
                  choices={sortableFields}
                  onChange={e => {this.setState({sortBy: e.target.value});}}
                  value={getDisplayForValue(sortableFields, sortBy)}/>
              </div>
              <div className="col-md-6 col-xs-12">
                <Select
                  name=""
                  choices={sortDirectionChoices}
                  onChange={e => {this.setState({sortDirection: e.target.value});}}
                  value={getDisplayForValue(sortDirectionChoices, sortDirection)}/>
              </div>
            </div>
          </div>
        </div>
        { (!isIE8) ?
          <div className="row">
            <div className="col-md-4">
                <label>Fields to include:</label>
              </div>
              <div className="col-md-8">
                <div className="list-item">
                  <SortableField
                    item={{display: 'Select All', value: 'selectAll', checked: selectAll}}
                    sharedProps={{onChange: e => this.onCheckAll(e)}}/>
                </div>
                <Reorder
                  itemKey="value"
                  selectedKey="value"
                  lock="horizontal"
                  holdTime=""
                  list={[...fieldsSelected]}
                  template={SortableField}
                  listClass="my-list"
                  itemClass="list-item"
                  callback={(...args) => this.onReorder(...args)}
                  selected={this.state.selected}
                  disableReorder={false}
                  sharedProps={{onChange: e => this.onCheck(e, this)}}
                />
              </div>
          </div>
          : ''}
        <div className="row">
          <div className="col-md-4 col-xs-12">
            <label htmlFor="outputFormat">Output Format</label>
          </div>
          <div className="col-md-8 col-xs-12">
            <Select
              name=""
              onChange={v => {this.setState({formatId: v.target.value});}}
              value={getDisplayForValue(formats, formatId)}
              choices = {formats}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-offset-4 col-md-8 col-xs-12">
            <p id="record-count">({recordCount} records will be included in this report)</p>
          </div>
        </div>
        <div className="row actions text-center">
          <div className="col-md-offset-4 col-md-8 col-xs-12">
            <a
              className="button primary"
              href={this.buildExportHref()}>Export</a>
          </div>
        </div>
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
