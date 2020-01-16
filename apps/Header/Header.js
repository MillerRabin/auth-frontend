import router from '/node_modules/es-class-router/main.js'
import loader from "/node_modules/async-content-loader/main.js";

const gTemplateP = loader.request(`/apps/Header/Header.html`);

function setupNavigation(header) {
    function removeActive() {
        for (const link of links)
            link.classList.remove('active');
    }

    function setActive(route) {
        removeActive();
        if (route.active == null) return;
        const aLink = links[route.active];
        if (aLink == null) return;
        aLink.classList.add('active');
    }

    const links = header.mount.querySelectorAll('ul li');
    router.on.change(event => setActive(event.detail.route));
    setActive(router.activeRoute);
}

async function render(header) {
    const template = await gTemplateP;
    header._mount.innerHTML = template.text;
    setupNavigation(header);
}


export default class Header {
    constructor (mount) {
        this._mount = mount;
        render(this);
    }

    get mount() {
        return this._mount;
    }}