import React, {PropTypes, Component} from 'react';
import Autosuggest from 'react-autosuggest';
import {Button, Glyphicon} from 'react-bootstrap';


class Link extends Component {
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
    linkClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
};


const LinkRow = (props) =>
    <div className="row">
        <div className="span2" style={{textAlign: "right"}}>
            <Link
                linkClick={() => props.linkClick(props.id)}
                label={props.label}/>
        </div>
        <div className="span4">{props.text}</div>
    </div>;

LinkRow.propTypes = {
    linkClick: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};


export const WizardPageReportingTypes = function(props) {
    const data = props.data;
    const rows = Object.keys(data).map(k =>
        <LinkRow key={k} id={k} label={data[k]['name']}
            text={data[k]['description']}
            linkClick={() => props.selected(k)}/>
    );

    return (
        <div>
            <div className="row">
                <div className="span2" style={{textAlign: "right"}}>
                </div>
                <div className="span4">
                    <h4>Reporting Types</h4>
                </div>
            </div>
            {rows}
        </div>
    );
}

WizardPageReportingTypes.propTypes = {
    data: PropTypes.object.isRequired,
    selected: PropTypes.func.isRequired,
};


export const WizardPageReportTypes = function(props) {
    const data = props.data;
    const rows = Object.keys(data).map(k =>
        <LinkRow key={k} id={k} label={data[k]['name']}
            text={data[k]['description']}
            linkClick={() => props.selected(k)}/>
    );

    return (
        <div>
            <div className="row">
                <div className="span2" style={{textAlign: "right"}}>
                </div>
                <div className="span4">
                    <h4>Report Types</h4>
                </div>
            </div>
            {rows}
        </div>
    );
}

WizardPageReportTypes.propTypes = {
    data: PropTypes.object.isRequired,
    selected: PropTypes.func.isRequired,
};


export const WizardPageDataTypes = function(props) {
    const data = props.data;
    const rows = Object.keys(data).map(k =>
        <LinkRow key={k} id={k} label={data[k]['name']}
            text={data[k]['description']}
            linkClick={() => props.selected(k)}/>
    );

    return (
        <div>
            <div className="row">
                <div className="span2" style={{textAlign: "right"}}>
                </div>
                <div className="span4">
                    <h4>Data Types</h4>
                </div>
            </div>
            {rows}
        </div>
    );
}

WizardPageDataTypes.propTypes = {
    data: PropTypes.object.isRequired,
    selected: PropTypes.func.isRequired,
};


export const WizardPagePresentationTypes = function(props) {
    const data = props.data;
    const rows = Object.keys(data).map(k =>
        <div key={k} className="row">
            <div className="span2" style={{textAlign: "right"}}>
            </div>
            <div className="span4">
                <Link id={k} label={data[k]['name']}
                    linkClick={() => props.selected(k)}/>
            </div>
        </div>
    );

    return (
        <div>
            <div className="row">
                <div className="span2" style={{textAlign: "right"}}>
                </div>
                <div className="span4">
                    <h4>Presentation Types</h4>
                </div>
            </div>
            {rows}
        </div>
    );
}

WizardPagePresentationTypes.propTypes = {
    data: PropTypes.object.isRequired,
    selected: PropTypes.func.isRequired,
};

export class WizardPageFilter extends Component {
    componentDidMount() {
        this.updateState();
    }

    updateFilter(filter, value) {
        const {reportConfig} = this.props;
        reportConfig.setFilter(filter, value);
        this.updateState();
    }

    addToMultifilter(filter, value) {
        const {reportConfig} = this.props;
        reportConfig.addToMultifilter(filter, value);
        this.updateState();
    }

    removeFromMultifilter(filter, value) {
        const {reportConfig} = this.props;
        reportConfig.removeFromMultifilter(filter, value);
        this.updateState();
    }

    updateState() {
        const {reportConfig} = this.props;
        this.setState({
            filter: reportConfig.getFilter(),
        });
    }

    async getHints(filter, field, partial) {
        try {
            const {reportConfig} = this.props;
            return await reportConfig.getHints(filter, partial);
        } catch (e) {
            console.error(e.stack);
        }
    }

    renderRow(displayName, key, content) {
        return <div key={key} className="row">
            <div className="span2" style={{textAlign: "right"}}>
                {displayName}
            </div>
            <div className="span5">
                {content}
            </div>
        </div>;
    }


    render() {
        try {
            const {reportConfig} = this.props;

            let rows = []
            reportConfig.filters.forEach(col => {
                let ctrl;
                switch(col.interface_type) {
                    case "search_select": ctrl =
                        rows.push(this.renderRow(col.display, col.filter,
                            <WizardFilterTextInput
                                id={col.filter}
                                updateFilter={v =>
                                    this.updateFilter(col.filter, v)}
                                getHints={v =>
                                    this.getHints(col.filter, col.field, v)}/>
                        ));
                        break;
                    case "search_multiselect": ctrl =
                        rows.push(this.renderRow(col.display, col.filter,
                            <WizardFilterMultiCollect
                                addItem={v =>
                                    this.addToMultifilter(col.filter, v)}
                                getHints={v =>
                                    this.getHints(col.filter, col.field, v)}/>
                        ));
                        rows.push(this.renderRow(
                            "",
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
                }
            });

            return (
                <form>
                    {this.renderRow("", "head", <h2>Set Up Report</h2>)}
                    <hr/>
                    {rows}
                    <hr/>
                    {this.renderRow("", "submit",
                        <Button
                            onClick={(e) => reportConfig.run()}>
                            Run Report
                        </Button>)}

                </form>
            );
        } catch (e) {
            console.error(e.stack);
        }
    }
}

WizardPageFilter.propTypes = {
    reportConfig: PropTypes.object.isRequired,
};


export class WizardFilterTextInput extends Component {
    async loadOptions(input, cb) {
        try {
            const {getHints} = this.props;
            const hints = await getHints(input);
            cb(null, hints);
        } catch (e) {
            console.error(e.stack);
        }
    }

    suggestionRenderer(suggestion, input) {
        return <a href="#">
                {suggestion.display}
            </a>;
    }

    render() {
        try {
            const {id, updateFilter} = this.props;
            const eid = 'filter-autosuggest-' + id;

            return (
                <Autosuggest
                    id={eid}
                    cache={false}
                    suggestions={(input, cb) =>
                        this.loadOptions(input, cb)}
                    suggestionRenderer={(s, i) =>
                        this.suggestionRenderer(s, i)}
                    suggestionValue={s => s.key}
                    theme={{
                        root: "dropdown open",
                        suggestions: "dropdown-menu",
                        }}
                    inputAttributes={{
                        type: "search",
                        onChange: v => updateFilter(v),
                        }}/>
            );
        } catch (e) {
            console.error(e.stack);
        }
    }
}

WizardFilterTextInput.propTypes = {
    id: PropTypes.string.isRequired,
    updateFilter: PropTypes.func.isRequired,
    getHints: PropTypes.func.isRequired,
};


export class WizardFilterMultiCollect extends Component {
    constructor() {
        super();
        this.state = { value: "" };
    }

    componentDidMount() {
        this.updateState("");
    }

    updateState(value) {
        this.setState({value: value});
    }

    async loadOptions(input, cb) {
        try {
            const {getHints} = this.props;
            const hints = await getHints(input);
            cb(null, hints);
        } catch (e) {
            console.error(e.stack);
        }
    }

    selectOption(value, event) {
        const {addItem} = this.props;
        event.preventDefault();
        addItem(value);
        // Shouldn't have to do this delay but for some reason
        // we need it if the user reached here by clicking.
        setTimeout(() => this.updateState(""), 300);
    }

    onInputChange(value) {
        this.updateState(value);
    }

    suggestionRenderer(suggestion, input) {
        return <a href="#">
                {suggestion.display}
            </a>;
    }

    render() {
        const {id} = this.props;
        const {value} = this.state;
        const eid = 'filter-autosuggest-' + id;

        return (
            <Autosuggest
                id={eid}
                cache={false}
                value={value}
                suggestions={(input, cb) =>
                    this.loadOptions(input, cb)}
                suggestionRenderer={(s, i) =>
                    this.suggestionRenderer(s, i)}
                suggestionValue={s => s.key.toString()}
                theme={{
                    root: "dropdown open",
                    suggestions: "dropdown-menu",
                    }}
                onSuggestionSelected={(v, e) =>
                    this.selectOption(v, e)}
                inputAttributes={{
                    type: "search",
                    onChange: this.onInputChange.bind(this),
                    }}/>
        );
    }
}


const WizardFilterCollectedItems = props =>
    <div> {
        props.items.map(item =>
            <Button
                key={item.key}
                bsSize="small"
                onClick={() => props.remove(item)}>
                <Glyphicon glyph="remove"/>
                {item.display}
            </Button>)
    }
    </div>
