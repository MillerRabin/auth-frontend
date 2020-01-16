import loader from "/node_modules/async-content-loader/main.js";

const gTemplateP = loader.request(`/apps/KeyGen/KeyGen.html`);

async function render(keygen) {
    const template = await gTemplateP;
    keygen._mount.innerHTML = template.text;
}


export default class KeyGen {
    constructor (mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }
}