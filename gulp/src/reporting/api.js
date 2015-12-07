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
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      const type = typeof obj[p];

      if (type === 'object' || type === 'array' || type === 'function') {
        throw new Error(
                  'Tried to serialize non primitive object. key: ' + p);
      }
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
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
      if (response.status === 200) {
        return response;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }

    parseJSON(response) {
      return response.json();
    }

    objectToFormData(obj) {
        // No good way around this:
      if (hasFormData) {
        const formData = new FormData();
        Object.keys(obj).forEach(k => formData.append(k, obj[k]));
        return formData;
      }
      return ancientSerialize(obj);
    }

    async getFromReportingApi(url) {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      return this.parseJSON(this.checkStatus(response));
    }

    async postToReportingApi(url, data) {
      const formData = this.objectToFormData(this.withCsrf(data));
      const response = await fetch(url, {
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
      const response = await this.getFromReportingApi(
        '/reports/api/list_reports');
      return response.reports;
    }

    async getReportingTypes() {
      const promise = this.postToReportingApi('/reports/api/reporting_types', {});
      return (await promise).reporting_type;
    }

    async getReportTypes(reportingTypeId) {
      const formData = {
        reporting_type_id: reportingTypeId,
      };
      const promise = this.postToReportingApi('/reports/api/report_types', formData);
      return (await promise).report_type;
    }

    async getDataTypes(reportTypeId) {
      const formData = {
        report_type_id: reportTypeId,
      };
      const promise = this.postToReportingApi('/reports/api/data_types', formData);
      return (await promise).data_type;
    }

    async getPresentationTypes(reportTypeId, dataTypeId) {
      const formData = {
        report_type_id: reportTypeId,
        data_type_id: dataTypeId,
      };
      const promise = this.postToReportingApi('/reports/api/report_presentations', formData);
      return (await promise).report_presentation;
    }

    async getFilters(reportPresentationId) {
      const formData = {
        rp_id: reportPresentationId,
      };
      const promise = this.postToReportingApi(
            '/reports/api/filters',
            formData);
      return (await promise);
    }

    async getHelp(reportPresentationId, filter, field, partial) {
      const formData = {
        rp_id: reportPresentationId,
        filter: JSON.stringify(filter),
        field: field,
        partial: partial,
      };
      const promise = this.postToReportingApi(
            '/reports/api/help',
            formData);
      return (await promise);
    }

    async runReport(reportPresentationId, name, filter) {
      const formData = {
        name: name,
        filter: JSON.stringify(filter),
        rp_id: reportPresentationId,
      };
      return await this.postToReportingApi('/reports/api/run_report', formData);
    }
}

export {Api as default};
