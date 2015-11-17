export class ReportFinder {
    constructor(api, configBuilder) {
        this.api = api;
        this.configBuilder = configBuilder;
    }

    getReportingTypes() {
        return this.api.getReportingTypes();
    }

    getReportTypes(reportingTypeId) {
        return this.api.getReportTypes(reportingTypeId);
    }

    getDataTypes(reportTypeId) {
        return this.api.getDataTypes(reportTypeId);
    }

    getPresentationTypes(reportTypeId, dataTypeId) {
        return this.api.getPresentationTypes(reportTypeId, dataTypeId);
    }

    async buildReportConfiguration(rpId, newReportNotifier) {
        const filters = await this.api.getFilters(rpId);
        return this.configBuilder.build(
            rpId, filters['filters'], newReportNotifier);
    }

    async getReportList() {
        return await this.api.listReports();
    }
}

export class ReportConfigurationBuilder {
    constructor(api) {
        this.api = api;
    }

    async build(rpId, filters, cb) {
        return new ReportConfiguration(rpId, filters, this.api, cb);
    }
}

export class ReportConfiguration {
    constructor(rpId, filters, api, newReportNote) {
        this.rpId = rpId;
        this.filters = filters;
        this.simpleFilter = {};
        this.multiFilter = {};
        this.api = api;
        this.newReportNote = newReportNote;
    }

    async getHints(field, partial) {
        return await this.api.getHelp(
            this.rpId, this.getFilter(), field, partial);
    }

    setFilter(field, value) {
        if (value == null || value == "") {
            delete this.simpleFilter[field];
        } else {
            this.simpleFilter[field] = value;
        }
    }

    addToMultifilter(field, obj) {
        if (!(field in this.multiFilter)) {
            this.multiFilter[field] = [];
        }
        if (this.multiFilter[field].findIndex(i => i.key == obj.key) == -1) {
            this.multiFilter[field].push(obj);
        }
    }

    removeFromMultifilter(field, obj) {
        const index = this.multiFilter[field].findIndex(i => i.key == obj.key);
        if (index != -1) {
            this.multiFilter[field].splice(index, 1);
        }
    }

    getFilter() {
        let filter = {...this.simpleFilter};
        for (const key in this.multiFilter) {
            filter[key] = this.multiFilter[key].map(o => o.key);
        }
        return filter;
    }

    getMultiFilter(key) {
        return this.multiFilter[key];
    }

    async run(name) {
        const reportId = await this.api.runReport(this.rpId, name, this.getFilter());
        this.newReportNote(reportId);
        return reportId;
    }
}

