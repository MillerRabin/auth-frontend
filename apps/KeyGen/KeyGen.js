import loader from "/node_modules/async-content-loader/main.js";
import UUID from "/node_modules/cross-uuid/browser/main.js";

const gTemplateP = loader.request(`/apps/KeyGen/KeyGen.html`);

async function render(keygen) {
    const template = await gTemplateP;
    keygen._mount.innerHTML = template.text;
    keygen._id = keygen._mount.querySelector('.line.id .value');
    keygen.id = UUID.generate();
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
        if (this._id == null) return null;
        this._id.innerHTML;
    }

    set id(value) {
        this._id.innerHTML = value;
    }
}