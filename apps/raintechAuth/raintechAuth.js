import loader from '/node_modules/async-content-loader/main.js';
import config from '/apps/config/config.js';
import safe from '/node_modules/safe-ops/main.js';
import location from '/node_modules/location-browser/main.js';
import messages from '/node_modules/browser-messages/main.js';

const currentUser = {};

class RaintechAuthException extends Error {
    constructor(object) {
        super();
        Object.assign(this, object);
    }
}

function saveCertificate(cert) {
    window.localStorage['raintech-auth'] = cert;
}

function clearCurrentUser(emitEvent = false) {
    for (let key in currentUser) {
        if (!currentUser.hasOwnProperty(key)) continue;
        delete currentUser[key];
    }
    if (emitEvent) messages.send('user.changed', null);
}

function rewriteCurrentUser(data) {
    clearCurrentUser();
    for (let key in data.user) {
        if (!data.user.hasOwnProperty(key)) continue;
        currentUser[key] = data.user[key];
    }
    currentUser.certificate = data.certificate;
    messages.send('user.changed', currentUser);
}

let checkCertificatePromise = null;
async function getCurrentUser() {
    if (currentUser.certificate != null) return currentUser;
    const search = location.getSearch();
    const cert = (safe.isEmpty(search.cert)) ? window.localStorage['raintech-auth'] : search.cert;
    if (cert == null) {
        clearCurrentUser();
        return null;
    }
    checkCertificatePromise = (checkCertificatePromise == null) ? checkCertificate({ certificate: cert }) : checkCertificatePromise;
    await checkCertificatePromise;
    checkCertificatePromise = null;
    return currentUser;
}

function clearCertificate() {
    return window.localStorage.removeItem('raintech-auth');
}

async function login(data) {
    const sData = Object.assign(data);
    sData.referer = config.referer;
    const rData = await loader.json(config.authPath + '/api/users/login/bypassword', {
        method: 'POST',
        data: sData
    });
    saveCertificate(rData.certificate);
    rewriteCurrentUser(rData);
    return rData;
}

async function checkCertificate(data) {
    const sData = Object.assign({}, data);
    sData.referer = config.referer;
    try {
        const rData = await loader.json(config.authPath + '/api/users/login/bycert', {
            method: 'POST',
            data: sData
        });
        saveCertificate(rData.certificate);
        rewriteCurrentUser(rData);
        return rData;
    } catch (e) {
        throw new RaintechAuthException(e);
    }
}

async function logout() {
    const rData = await loader.json(config.authPath + '/api/users/logout', {
        method: 'GET'
    });
    clearCertificate();
    clearCurrentUser(true);
    return rData;
}

async function signup(data) {
    if (safe.isEmpty(data.newPassword)) throw new RaintechAuthException({ newPassword: 'password is empty' });
    const sData = Object.assign(data);
    sData.referer = config.referer;
    const rData =  await loader.json(config.authPath + '/api/users/signup/bypassword', {
        method: 'POST',
        data: sData
    });
    saveCertificate(rData.certificate);
    rewriteCurrentUser(rData);
    return rData
}

async function restore(data) {
    if (safe.isEmpty(data.email)) throw new RaintechAuthException({ email: 'Please, specify your email' });
    const sData = Object.assign(data);
    sData.referer = config.referer;
    const rData = await loader.json(config.authPath + '/api/users/changepassword/byemail', {
        method: 'POST',
        data: sData
    });
    saveCertificate(rData.certificate);
    rewriteCurrentUser(rData);
    return rData
}

async function update(data) {
    const sData = Object.assign(data);
    sData.referer = config.referer;
    const user = await getCurrentUser();
    sData.certificate = user.certificate;
    return await loader.json(config.authPath + '/api/users', {
        method: 'PUT',
        data: sData
    });
}

async function check() {
    const currentUser = await getCurrentUser();
    if (currentUser == null) throw new RaintechAuthException({ message: 'User is not authorized'});
    return currentUser;
}

function onUserChanged(callback) {
    return messages.on('user.changed', callback);
}

async function onAuthData(status, intention, value) {
    console.log(status, intention, value);
}

function init(storage) {
    function createIntention() {
        storage.createIntention({
            title: 'need authentication',
            input: 'token',
            output: 'authData',
            onData: onAuthData
        });
    }

    createIntention();
}


export default {
    login,
    logout,
    signup,
    restore,
    update,
    check,
    currentUser,
    onUserChanged,
    init,
    Exception: RaintechAuthException
};
