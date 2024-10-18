
function overlayMapUrl(anchor) {
    const relPath = '/supportapi/MetriaCache/metriawmsproxy?LAYERS=MetriaTatortPlus'
    switch (anchor) {
        case '#lokalapi':
            return 'http://localhost:58772/'
        case '#pavlov':
        default:
            return 'http://it-webadbtest01.it.ntnu.no' + relPath
    }
}

function isRelease() {
    return !(window.location.href.indexOf("localhost") > 1)
}

function isNotTest() {
    return !(window.location.href.indexOf("test") > 1) && isRelease()
}

const homeuri = window.location.protocol + "//" + window.location.host



const authconfig =
{
    authority: import.meta.env.VITE_AUTHORITY_URL,
    client_id: import.meta.env.VITE_AUTHORITY_CLIENT_ID,
    redirect_uri: homeuri + "/#signin-oidc",
    silent_redirect_uri: homeuri + "/#silentredirect",
    popup_redirect_uri: homeuri + "/#silentredirect",
    post_logout_redirect_uri: homeuri + "/#post-logout",
    response_type: "code",
    scope: "openid profile roles email fab4api",
    automaticSilentRenew: true,
    acr_values: "Level3",
    ui_locales: "nb",
    loadUserInfo: true,
    revokeAccessTokenOnSignout: true,
    response_mode: "query"
}

const config = {
    // apiUrl: "https://rl2019api.artsdatabanken.no",   // "http://localhost:25807",
    apiUrl: import.meta.env.VITE_BACKEND_URL,
    getUrl: resource => config.apiUrl + "/api/" + resource,
    // getSignalRUrl: apiUrl(window.location.hash) + "/messageHub",
    mapApiUrl: import.meta.env.VITE_ARTSKART_BASEURL,
    mapEpsgCode: 32633,
    mapEpsgDef: "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    overlayMapUrl: overlayMapUrl(window.location.hash),
    referenceApiUrl: import.meta.env.VITE_REFERENCE_URL,
    authconfig: authconfig,
    isRelease: isRelease(),
    isNotTest: isNotTest()
}

export default config
