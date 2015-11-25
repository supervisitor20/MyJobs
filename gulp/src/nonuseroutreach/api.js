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

    async postToNuoApi(url, data) {
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

    async getFromNuoApi(url) {
        var response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return this.parseJSON(this.checkStatus(response));
    }

    async loadExistingInboxes () {
        var response = await this.getFromNuoApi("/prm/api/nonuseroutreach/inbox/list");
        return response;
    }
}

export {Api as default};