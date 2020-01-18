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
    const nText = text.split('\n').join(',\n');
    const obj = `{\n${nText}\n}`;
    return JSON.parse(obj);
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsText(file, 'utf-8');
        fr.onloadend = function (event) {
            return resolve(event.currentTarget.result);
        };
        fr.onerror = function (event) {
            return reject(event);
        };
        fr.onabort = function (event) {
            return reject(event);
        };
    });
}

async function readConfig(keygen, file) {
    try {
        const text = await readFile(file);
        keygen.configuration = JSON.parse(text);
    } catch (e) {
        keygen.error = e;
    }
}

async function render(keygen) {
    const template = await gTemplateP;
    keygen.mount.innerHTML = template.text;
    keygen.id = keygen.configuration.id;
    keygen.download.onclick = function () {
        keygen.error = null;
        download(keygen);
    };
    const fileInput = keygen.mount.querySelector('.submitFile');
    keygen.load.onclick = function () {
        keygen.error = null;
        fileInput.click();
    };
    fileInput.onchange = function () {
        const file = fileInput.files[0];
        readConfig(keygen, file);
    };
}

function assign(object, field, selector) {
    const key = `_${field}`;
    if (object[key] == null)
        object[key] = object.mount.querySelector(selector);
    return object[key];
}

function loadData(obj) {
    const res = [];
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        res.push(`"${key}": "${obj[key]}"`);
    }
    return res.join('\n');
}

export default class KeyGen {
    constructor (mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }

    get configuration() {
        if (this._configuration == null)
            this._configuration = {
                id: UUID.generate()
            };
        return this._configuration;
    }

    set configuration(value) {
        this._configuration = value;
        this.id = value.id;
        this.text = loadData(value.data);
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

    get load() {
        return assign(this, 'load', '.submit.load');
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