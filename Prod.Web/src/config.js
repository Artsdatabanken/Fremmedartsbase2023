function apiUrl (anchor) {
    //const relPath = '/lr/' + GIT_BRANCH + '_api/'
    switch (anchor) {
      case '#lokalapi':
        return 'http://localhost:25808'
      case '#remoteapi':
          return 'https://fab4api.test.artsdatabanken.no/'
      default:
        //return relPath   // This does not currently work because api is not relative to ("under") app 
        if (window.location.href.indexOf("test.") > 1) {return 'https://fab4api.test.artsdatabanken.no'}
        return  process.env.NODE_ENV === 'development' ? 'http://localhost:25808' : 'https://fab4api.test.artsdatabanken.no'
    }
  }
  function referenceApiUrl (anchor) {
        //return relPath   // This does not currently work because api is not relative to ("under") app 
        if (window.location.href.indexOf("test.") > 1) {return 'https://referenceapi.test.artsdatabanken.no/'}
        return  'https://referenceapi.artsdatabanken.no/'
    }

  function mapApiUrl (anchor) {
    const relPath = '/supportapi/listhelper/'
    switch (anchor) {
      case '#lokalapi':
        return 'http://localhost:58772/listhelper/'
      case '#pavlov':
      default:
          return 'http://it-webadbtest01.it.ntnu.no' + relPath
    }
  }
  
  function overlayMapUrl (anchor) {
    const relPath = '/supportapi/MetriaCache/metriawmsproxy?LAYERS=MetriaTatortPlus'
    switch (anchor) {
      case '#lokalapi':
        return 'http://localhost:58772/'
      case '#pavlov':
      default:
          return 'http://it-webadbtest01.it.ntnu.no' + relPath
    }
  }

  function isRelease(){
   return window.location.href.indexOf("rl2021.artsdatabanken.no") > 1
  }

  const homeuri = window.location.protocol + "//" + window.location.host
  // const homeuri = 
  //   (process.env.NODE_ENV === 'development') ?
  //   "http://localhost:12345" :
  //   (window.location.href.indexOf("test.") > 1) ?
  //   "https://fab4api.test.artsdatabanken.no" :
  //   "https://fab4api.test.artsdatabanken.no"



  const authconfig = 
  { 
      authority: "https://id.artsdatabanken.no/",
      client_id: "fab4",
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


//   const authconfig = 
//   (process.env.NODE_ENV === 'development') ?
//   { 
//       authority: "https://id.artsdatabanken.no/",
//       client_id: "fab4",
//       redirect_uri: "http://localhost:1234/#signin-oidc",
//       silent_redirect_uri: "http://localhost:1234/#silentredirect",
//       popup_redirect_uri: "http://localhost:1234/#silentredirect",
//       post_logout_redirect_uri: "http://localhost:1234/#post-logout",
//       response_type: "code",
//       scope: "openid profile roles email fab4api",
//       automaticSilentRenew: true,
//       acr_values: "Level3",
//       ui_locales: "nb",
//       loadUserInfo: true,
//       revokeAccessTokenOnSignout: true,
//       response_mode: "query"
//   } : (window.location.href.indexOf("test.") > 1 ?
//   {
//       authority: "https://id.artsdatabanken.no/",
//       client_id: "fab4",
//       redirect_uri: "https://fab4api.test.artsdatabanken.no/#signin-oidc",
//       silent_redirect_uri: "https://fab4api.test.artsdatabanken.no/#silentredirect",
//       popup_redirect_uri: "https://fab4api.test.artsdatabanken.no/#silentredirect",
//       post_logout_redirect_uri: "https://fab4api.test.artsdatabanken.no/#post-logout",
//       response_type: "code",
//       scope: "openid profile roles email fab4api",
//       automaticSilentRenew: true,
//       acr_values: "Level3",
//       ui_locales: "nb",
//       loadUserInfo: true,
//       revokeAccessTokenOnSignout: true,
//       response_mode: "query"
//   }:
//   {
//     authority: "https://id.artsdatabanken.no/",
//     client_id: "fab4",
//     redirect_uri: "https://fab4api.test.artsdatabanken.no/#signin-oidc",
//     silent_redirect_uri: "https://fab4api.test.artsdatabanken.no/#silentredirect",
//     popup_redirect_uri: "https://fab4api.test.artsdatabanken.no/#silentredirect",
//     post_logout_redirect_uri: "https://fab4api.test.artsdatabanken.no/#post-logout",
//     response_type: "code",
//     scope: "openid profile roles email fab4api",
//     automaticSilentRenew: true,
//     acr_values: "Level3",
//     ui_locales: "nb",
//     loadUserInfo: true,
//     revokeAccessTokenOnSignout: true,
//     response_mode: "query"
// });  
  

const config = {
    // apiUrl: "https://rl2019api.artsdatabanken.no",   // "http://localhost:25807",
    apiUrl: apiUrl(window.location.hash),
    getUrl: resource => config.apiUrl + "/api/" + resource,
    getSignalRUrl: apiUrl(window.location.hash) + "/messageHub",
    mapApiUrl: mapApiUrl(window.location.hash),
    overlayMapUrl: overlayMapUrl(window.location.hash),
    referenceApiUrl: referenceApiUrl(window.location.hash),
    authconfig: authconfig,
    isRelease: isRelease()
  }
export default config