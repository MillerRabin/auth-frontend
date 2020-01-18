import loader from "/node_modules/async-content-loader/main.js";
import UUID from "/node_modules/cross-uuid/browser/main.js";
import safe from "/node_modules/safe-ops/main.js";

const gTemplateP = loader.request(`/apps/KeyGen/KeyGen.html`);

function downloadFile(file) {
    var blob = new Blob([file], {type: "application/zip"});
    var objectUrl = window.URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = objectUrl;
    anchor.setAttribute('download', 'configuration.zip');
    anchor.click();
}

async function download(keygen) {
    try {
        const xhr = await loader.request('/api/configurations/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            data: JSON.stringify(keygen.data),
            params: { responseType: "arraybuffer" }
        });
        downloadFile(xhr.response);
    } catch (e) {
        keygen.error = e;
    }
}

function getObject(text) {
    if (safe.isEmpty(text)) return {};
    const obj = `{\n${text}\n}`;
    return JSON.parse(obj);
}

async function render(keygen) {
    const template = await gTemplateP;
    keygen.mount.innerHTML = template.text;
    keygen.id = UUID.generate();
    keygen.download.onclick = function () {
        download(keygen);
    }
}

function assign(object, field, selector) {
    const key = `_${field}`;
    if (object[key] == null)
        object[key] = object.mount.querySelector(selector);
    return object[key];
}

export default class KeyGen {
    constructor (mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }


    get id() {
        return assign(this, 'id', '.line.id .value').innerHTML;
    }

    set id(value) {
        assign(this, 'id', '.line.id .value').innerHTML = value;
    }

    get text() {
        return assign(this, 'text', '.line.info .value').value;
    }

    set text(value) {
        assign(this, 'text', '.line.info .value').value = value;
    }

    get download() {
        return assign(this, 'download', '.submit.download');
    }

    get data() {
        return { id: this.id, data: getObject(this.text)};
    }

    get error() {
        return assign(this, 'error', '.error').innerHTML;
    }

    set error(e) {
        const err = assign(this, 'error', '.error');
        if (e == null) {
            err.innerHTML = '';
            return;
        }
        const etext = (e.error != null) ? e.error :
                      (e.text != null) ? e.text : e.message;
        return err.innerHTML = etext;
    }

}