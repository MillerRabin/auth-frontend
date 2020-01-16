import loader from '/node_modules/async-content-loader/main.js';
import router from '/node_modules/es-class-router/main.js';
import routeTables from './routeTables.js';
import Header from '../Header/Header.js';

async function render(main) {
    router.mount = main.mount.querySelector('#Center');
    router.routes = routeTables;
    const headerM = main.mount.querySelector('#Header_Container');
    main._header = new Header(headerM);
}

class Main {
    constructor(mount) {
        router.application = this;
        this._mount = mount;
        this._header = null;
        render(this);
    }

    get mount() {
        return this._mount;
    }

    get loaded() {
        return this._mount.classList.contains('loaded');
    }

    set loaded(value) {
        if (value) {
            this._mount.classList.add('loaded');
            return;
        }
        this._mount.classList.remove('loaded');
    }

    get header() {
        return this._header;
    }
}

loader.globalContentLoaded.then(() => {
    const mount = window.document.getElementById('Auth');
    new Main(mount);
});