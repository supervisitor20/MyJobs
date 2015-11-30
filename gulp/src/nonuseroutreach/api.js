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

export class Api {
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

    async getFromNuoApi(url) {
        let response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return this.parseJSON(this.checkStatus(response));
    }

    async getExistingInboxes() {
        let response = await this.getFromNuoApi("/prm/api/nonuseroutreach/inbox/list");
        return response;
    }
}

export {Api as default};