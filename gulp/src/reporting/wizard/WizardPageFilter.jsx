import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {Loading} from 'common/ui/Loading';

import classnames from 'classnames';
import {WizardFilterDateRange} from './WizardFilterDateRange';
import {WizardFilterSearchDropdown} from './WizardFilterSearchDropdown';
import {WizardFilterTags} from './WizardFilterTags';
import {WizardFilterCollectedItems} from './WizardFilterCollectedItems';
import {WizardFilterCityState} from './WizardFilterCityState';
import {SearchInput} from 'common/ui/SearchInput';
import TextField from 'common/ui/TextField';
import NewTag from 'common/ui/tags/NewTag';

export class WizardPageFilter extends Component {
  constructor() {
    super();
    this.state = {
      reportName: 'Report Name',
      loading: true,
      highlights: {},
      chosenTags: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  async getHints(filter, partial) {
    const {reportConfig} = this.state;
    return await reportConfig.getHints(filter, partial);
  }

  async loadData() {
    await this.buildReportConfig();
    this.updateState();
    this.setState({loading: false});
  }

  async buildReportConfig() {
    const {reportFinder} = this.props;
    const {presentationType} = this.props.routeParams;
    const reportConfig = await reportFinder.buildReportConfiguration(
      presentationType);
    this.setState({reportConfig});
  }

  updateFilter(filter, value) {
    const {reportConfig} = this.state;
    reportConfig.setFilter(filter, value);
    this.updateState();
  }

  addToMultifilter(filter, value) {
    const {reportConfig} = this.state;
    reportConfig.addToMultifilter(filter, value);
    this.updateState();
  }

  removeFromMultifilter(filter, value) {
    const {reportConfig} = this.state;
    reportConfig.removeFromMultifilter(filter, value);
    this.updateState();
  }

  addToAndOrFilter(filter, index, value) {
    const {reportConfig} = this.state;
    reportConfig.addToAndOrFilter(filter, index, value);
    this.updateState();
  }

  removeFromAndOrFilter(filter, index, value) {
    const {reportConfig} = this.state;
    reportConfig.removeFromAndOrFilter(filter, index, value);
    this.updateState();
  }

  updateState() {
    const {reportConfig} = this.state;
    this.setState({
      filter: reportConfig.getFilter(),
    });
  }

  chooseTag(tagID) {
    const {chosenTags} = this.state;
    chosenTags.push({tag: tagID});
    this.updateState();
    console.log(chosenTags);
  }

  removeTag(tag) {
    console.log('remove tag: ', tag);
  }

  activeTags() {
    const {highlights} = this.state;
    const {chosenTags} = this.state;

    return (
      chosenTags.map((item) =>
        [<NewTag
          key="0"
          display="Farmers Only"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid01')}
          onMouseEnter={() => this.turnOnHighlight('the tag')}
          onMouseLeave={() => this.turnOffHighlight('the tag')}
          removeTag={(i) => this.removeTag(i)}
          highlight={Boolean(highlights['the tag'])}/>,
        <NewTag
          key="5"
          display="Farmers Only"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid01')}
          onMouseEnter={() => this.turnOnHighlight('the tag')}
          onMouseLeave={() => this.turnOffHighlight('the tag')}
          removeTag={(i) => this.removeTag(i)}
          highlight={Boolean(highlights['the tag'])}/>,
        <NewTag
          key="6"
          display="Farmers Only"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid01')}
          onMouseEnter={() => this.turnOnHighlight('the tag')}
          onMouseLeave={() => this.turnOffHighlight('the tag')}
          removeTag={(i) => this.removeTag(i)}
          highlight={Boolean(highlights['the tag'])}/>,
        <NewTag
          key="7"
          display="Farmers Only"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid01')}
          onMouseEnter={() => this.turnOnHighlight('the tag')}
          onMouseLeave={() => this.turnOffHighlight('the tag')}
          removeTag={(i) => this.removeTag(i)}
          highlight={Boolean(highlights['the tag'])}/>,
          <NewTag
          key="20"
          display="Farmers Only"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid01')}
          onMouseEnter={() => this.turnOnHighlight('the tag')}
          onMouseLeave={() => this.turnOffHighlight('the tag')}
          removeTag={(i) => this.removeTag(i)}
          highlight={Boolean(highlights['the tag'])}/>,
          <NewTag
          key="21"
          display="Farmers Only"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid01')}
          onMouseEnter={() => this.turnOnHighlight('the tag')}
          onMouseLeave={() => this.turnOffHighlight('the tag')}
          removeTag={(i) => this.removeTag(i)}
          highlight={Boolean(highlights['the tag'])}/>]
      )
    );
  }

  turnOnHighlight(key) {
    const {highlights} = this.state;
    highlights[key] = true;
    this.setState({highlights});
  }

  turnOffHighlight(key) {
    const {highlights} = this.state;
    delete highlights[key];
    this.setState({highlights});
  }

  pulseHighlight(key) {
    console.log('highlight');
    this.turnOnHighlight(key);
    setTimeout(() => {
      this.turnOffHighlight(key);
    }, 200);
  }

  tagMenu() {
    const {highlights} = this.state;

    return (
      <div className="tag-select-menu">
        <TextField
          name="name"
          onChange={e => this.addToMultifilter('newEntryJS', e)}
          placeholder="Type to filter tags"/>
        <NewTag
          key="1"
          display="Farmers Only"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid01')}
          onMouseOver={() => this.pulseHighlight('the tag')}
          highlight={Boolean(highlights['the tag'])}/>
        <NewTag
          key="2"
          display="Horsin Around"
          hexColor="ff842f"
          onClick={() => this.chooseTag('fakeid02')}
          onMouseOver={() => this.pulseHighlight('the tag')}
          highlight={Boolean(highlights['other tag'])}/>
        <NewTag
          key="3"
          display="Wilbur"
          hexColor="33bb33"
          onClick={() => this.chooseTag('fakeid03')}
          onMouseOver={() => this.pulseHighlight('the tag')}
          highlight={Boolean(highlights['the tag'])}/>
      </div>
    );
  }

// The tag component.
  tagSelect() {
    return (
      <div className="tag-select-outer">
        <div className="tag-select-first-input">
          <label>Include any of these tags</label>
          <div className="tag-select-input-element">
            <div
              className="tag-select-chosen-tags">
              <span className="tag-select-placeholder">Select tags</span>
              {this.activeTags()}
            </div>
            <div className="tag-select-menu-container">
              {this.tagMenu()}
            </div>
          </div>
        </div>
      </div>
    );
  }
  // SAMPLE FOR SUBSEQUENT INPUT DIFFRENCES
        // <div className="tag-select-subsequent-input">
        //   <label><strong>and</strong> any of these tags</label>
        // </div>

  renderRow(displayName, key, content, buttonRow, textCenter) {
    return (
      <div key={key} className={
        classnames(
        {'row': true},
        {'actions': buttonRow},
        {'text-center': textCenter})}>
        <div className="col-xs-12 col-md-4">
          <label>
            {displayName}
          </label>
        </div>
        <div className="col-xs-12 col-md-8">
          {content}
        </div>
      </div>
    );
  }

  render() {
    const {loading, reportConfig, reportName} = this.state;

    if (loading) {
      return <Loading/>;
    }

    const rows = [];
    reportConfig.filters.forEach(col => {
      switch (col.interface_type) {
      case 'date_range':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterDateRange
            id={col.filter}
            updateFilter={v =>
              this.updateFilter(col.filter, v)}/>
        ));
        break;
      case 'search_select':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterSearchDropdown
            id={col.filter}
            updateFilter={v =>
              this.updateFilter(col.filter, v)}
            getHints={v =>
              this.getHints(col.filter, v)}/>
        ));
        break;
      case 'city_state':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterCityState
            id={col.filter}
            updateFilter={v =>
              this.updateFilter(col.filter, v)}
            getHints={(f, v) =>
              this.getHints(f, v)}/>
        ));
        break;
      case 'tags':
        rows.push(this.renderRow(col.display, col.filter,
          <WizardFilterTags
            tags={reportConfig.getAndOrFilter(col.filter)}
            addTag={(i, t) =>
              this.addToAndOrFilter(col.filter, i, t)}
            removeTag={(i, t) =>
              this.removeFromAndOrFilter(col.filter, i, t)}
            getHints={v => this.getHints(col.filter, v)}/>
        ));
        break;
      case 'search_multiselect':
        rows.push(this.renderRow(col.display, col.filter,
          <SearchInput
            id={col.filter}
            emptyOnSelect
            onSelect={v =>
              this.addToMultifilter(col.filter, v)}
            getHints={v =>
              this.getHints(col.filter, v)}/>
        ));
        rows.push(this.renderRow(
          '',
          col.filter + '-selected',
          <WizardFilterCollectedItems
            items={
              reportConfig.getMultiFilter(col.filter)
                || []
            }
            remove={v =>
              this.removeFromMultifilter(
                col.filter,
                v)}/>));
        break;
      default:
        warning(true, 'Unknown interface type: ' + col.interface_type);
      }
    });

    return (
      <form>
        {this.renderRow('', 'head', <h2>Set Up Report</h2>)}
        {this.renderRow('Tag Select', 'tagSelect', this.tagSelect())}
        {rows}
        {this.renderRow('', 'submit',
          <button
            className="button"
            onClick={() => reportConfig.run(reportName)}>
            Run Report
          </button>, true, true)}
      </form>
    );
  }
}

WizardPageFilter.propTypes = {
  routeParams: PropTypes.shape({
    presentationType: PropTypes.string.isRequired,
  }).isRequired,
  reportFinder: PropTypes.object.isRequired,
};
