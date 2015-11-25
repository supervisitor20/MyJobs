// Abstract the details of building urls and serializing requests for the
// reporting api.
//
// This uses the fetch api. Fetch works somewhat differently from jQuery.ajax.
// This module encasulates all of that. Errors are translated to JS exceptions.

// Future: Factor out the non-reporting-specific ajax details so they can be
// used by other apps.


// This is needed for IE8. The fetch-polyfill module doesn't quite do enough.
// based on:
// http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs
function ancientSerialize(obj) {
    var str = [];
    for(var p in obj) {
        const type = typeof obj[p];

        if (type === "object" || type === "array" || type === "function") {
            throw new Error(
                "Tried to serialize non primitive object. key: " + p);
        }
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
    return str.join("&");
}

const hasFormData = !(window.FormData === undefined);

class Api {
    constructor(csrf) {
        this.csrf = csrf;
    }

    withCsrf(formData) {
        return {...formData, csrfmiddlewaretoken: this.csrf};
    }

    checkStatus(response) {
        if (response.status == 200) {
            return response
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }

    parseJSON(response) {
        return response.json();
    }

    objectToFormData(obj) {
        // No good way around this:
        if (hasFormData) {
            var formData = new FormData();
            Object.keys(obj).forEach(k => formData.append(k, obj[k]));
            return formData;
        } else {
            return ancientSerialize(obj);
        }

    }

    async getFromReportingApi(url) {
        var response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return this.parseJSON(this.checkStatus(response));
    }

    async postToReportingApi(url, data) {
        var formData = this.objectToFormData(this.withCsrf(data));
        var response = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            // No good way around this.
            headers: hasFormData ? undefined : {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return this.parseJSON(this.checkStatus(response));
    }

    async listReports() {
        var response = await this.getFromReportingApi(
            "/reports/api/list_reports", {
                method: 'GET',
            });
        return response['reports'];
    }

    async getReportingTypes() {
        var promise = this.postToReportingApi("/reports/api/reporting_types", {});
        return (await promise)['reporting_type'];
    }

    async getReportTypes(reportingTypeId) {
        var formData = {
            reporting_type_id: reportingTypeId,
        };
        var promise = this.postToReportingApi("/reports/api/report_types", formData);
        return (await promise)['report_type'];
    }

    async getDataTypes(reportTypeId) {
        var formData = {
            report_type_id: reportTypeId,
        };
        var promise = this.postToReportingApi("/reports/api/data_types", formData);
        return (await promise)['data_type'];
    }

    async getPresentationTypes(reportTypeId, dataTypeId) {
        var formData = {
            report_type_id: reportTypeId,
            data_type_id: dataTypeId,
        };
        var promise = this.postToReportingApi("/reports/api/report_presentations", formData);
        return (await promise)['report_presentation'];
    }

    async getFilters(reportPresentationId) {
        var formData = {
            rp_id: reportPresentationId,
        };
        var promise = this.postToReportingApi(
            "/reports/api/filters",
            formData);
        return (await promise);
    }

    async getHelp(reportPresentationId, filter, field, partial) {
        var formData = {
            rp_id: reportPresentationId,
            filter: JSON.stringify(filter),
            field: field,
            partial: partial,
        };
        var promise = this.postToReportingApi(
            "/reports/api/help",
            formData);
        return (await promise);
    }

    async runReport(reportPresentationId, name, filter) {
        var formData = {
            name: name,
            filter: JSON.stringify(filter),
            rp_id: reportPresentationId,
        };
        return await this.postToReportingApi("/reports/api/run_report", formData);
    }
}

export {Api as default};
