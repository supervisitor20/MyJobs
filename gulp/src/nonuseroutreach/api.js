export class Api {
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

  async getFromNuoApi(url) {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return this.parseJSON(this.checkStatus(response));
  }

  async getExistingInboxes() {
    return await this.getFromNuoApi('/prm/api/nonuseroutreach/inbox/list');
  }
}

export {Api as default};
