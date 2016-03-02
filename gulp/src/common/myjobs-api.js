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

/**
 * Utility for making XHR calls from all our supported browsers.
 *
 * Also handles csrf and known response types.
 */
export class MyJobsApi {
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

  async get(url) {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return this.parseJSON(this.checkStatus(response));
  }

  async post(url, data) {
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
}
