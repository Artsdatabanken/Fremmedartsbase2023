import fetch from 'isomorphic-fetch'
import config from '../config';
import { computed, extendObservable, observable, toJS, action, makeObservable } from 'mobx';
import {
    Log,
    User,
    UserManager
} from 'oidc-client';

class AuthenticationStore {
    // @observable manager = null;
    user = null;
    access = null;
constructor() {
    makeObservable(this, {
        user: observable,
        access: observable,
        isLoggedIn: computed,
        userName: computed,
        userId: computed,
        hasAccess: computed,
        isAdmin: computed,
        hasApplication: computed,
        getAuthToken: computed,
        isInRole: action,
        login: action,
        completeLogin: action,
        logout: action,
        completeLogout: action,
        handleError: action
    });

    Log.logger = console;
    Log.level = Log.INFO;
    this.manager = new UserManager(config.authconfig);
    this
        .manager
        .events
        .addAccessTokenExpiring(function () {
            Log.warn("token expiring...");
            window.appInsights.trackEvent({ name: 'token expiring'})
        });
    this.manager.events.addSilentRenewError(() => {
        Log.warn("renew token failed...");
        window.appInsights.trackException({exception: new Error('renew token failed')});//.trackEvent({ name: 'renew token failed'})
    });
    this.manager.events.addAccessTokenExpired(() => {
        Log.warn("token expired...");
        window.appInsights.trackException({exception: new Error('token expired')});//trackEvent({ name: 'token expired'})
    });
    this
        .manager
        .events
        .addUserLoaded(e => {
            Log.info("user loaded...");
            action(() => {
                Log.info("old token " + (this.user ? this.user.access_token: "no token"))
                this.user = e
                Log.info("new token..." + e.access_token);
                if (window.appInsights) {
                    var validatedId = e.profile.sub;
                    window.appInsights.setAuthenticatedUserContext(validatedId);
                    window.appInsights.trackPageView();
                    window.appInsights.trackEvent({
                        name:"SetAuthenticatedUserContext", 
                        properties: { UserContextString: validatedId }
                    })
                }
                // window.appInsights.trackEvent({ name: 'new token loaded'})
            })()
        })
    // window.setTimeout(
    //     () => {this.manager.signinSilent()}      
    // , 10000);
}

    get isLoggedIn() {
        //        return true
        return this.user != null && this.user.access_token && !this.user.expired;
    }
    get userName() {
        //        return true
        return this.user != null && this.user.profile ? this.user.profile.preferred_username : '';
    }
    get userId() {
        //        return true
        return this.user != null && this.user.profile ? this.user.profile.sub : '';
    }
    get hasAccess() {
        //        return true
        return this.isLoggedIn && (this.isInRole("fab_administrator") || this.access != null && this.access.harTilgang); // || (this.access != null && this.access.HasAccess ));
    }
    get isAdmin() {
        //        return true
        return this.isLoggedIn && (this.isInRole("fab_administrator") || (this.access != null && this.access.erAdministrator)); // || (this.access != null && this.access.HasAccess ));
    }
    get hasApplication() {
        return this.isLoggedIn && this.access != null && this.access.harSoktOmTilgang; // || (this.access != null && this.access.HasAccess ));
    }
    get getAuthToken() {
        return (this.user != null && this.user.access_token && !this.user.expired) ? this.user.access_token : "";
    }

    async applyForAccess(reason) {
        if (this.isLoggedIn) {
            const url = config.getUrl("Access/applications/apply")
            var data = await this.sendJsonRequest(url, reason);
            action(() =>
                this.access = data
            )()
        }
    }
    async getJsonRequest(url) {

        const response = await fetch(url, {
                method: 'GET',
                // mode: 'no-cors',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getAuthToken
                })
            }).then((response1) => {
                if (response1.status >= 400 && response1.status < 600) {
                    throw new Error("Bad response from server");
                }
                return response1.json();
            }).then((response2) => {

                return response2;
            })
            .catch((error) => {
                console.log(error)
            });
        const json = await response
        return json

    }
    async sendJsonRequest(url, data) {

        const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data), // data can be `string` or {object}! (cant get it to work with {object}...)
                // mode: 'no-cors',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.getAuthToken
                })
            }).then((response1) => {
                if (response1.status >= 400 && response1.status < 600) {
                    throw new Error("Bad response from server");
                }
                return response1.json();
            }).then((response2) => {

                return response2;
            })
            .catch((error) => {
                console.log(error)
            });
        const json = await response
        return json

    }

    async loadAccessRights() {

        if (this.isLoggedIn) {
            const url = config.getUrl("Access/Access")
            const json = await this.getJsonRequest(url)
            // console.log("ddd" + JSON.stringify(json))
            action(() =>
                this.access = json
            )()
        }
    }

    isInRole = (role) => {
        if (!this.isLoggedIn) {
            return false
        }
        var found = false;
        if (!this.user.profile.role) return false
        if (!Array.isArray(this.user.profile.role)) {
            if (this.user.profile.role == role) return true;
        } else {
            this.user.profile.role.forEach(element => {
                if (element == role) {
                    found = true
                }
            });
        }
        return found;
    };

    loadUser = () => {
        this.manager.getUser()
            .then(
                (user) => {
                    action(() => {
                        Log.info("Manuell load user...")
                        if(user)
                        {
                        this.user = user
                        if (window.appInsights) {
                            var validatedId = user.profile.sub;
                            window.appInsights.setAuthenticatedUserContext(validatedId);
                            window.appInsights.trackPageView();
                            window.appInsights.trackEvent({
                                name:"SetAuthenticatedUserContext", 
                                properties: { UserContextString: validatedId }
                            })
                        }
                        this.loadAccessRights()
                        }
                    })()
                }
            );
    }

    login = () => {
        this.manager.signinRedirect()
            .catch((error) => this.handleError(error));
    };

    completeLogin = (callback) => {

        this.manager.signinRedirectCallback()
            .then(action(user => {
                this.user = user;
                this.loadAccessRights();
                if (callback) {
                    callback()
                }
            }))
            .catch((error) => this.handleError(error));
    };

    logout = () => {
        this.manager.signoutRedirect()
            .catch((error) => this.handleError(error));
    };

    completeLogout = () => {
        this.manager.signoutRedirectCallback()
            .then(() => {
                this.manager.removeUser()
            })
            .then(() => {
                this.user = null;
            })
            .catch((error) => this.handleError(error));
    };

    handleError(error) {
        console.error("Problem with authentication endpoint: ", error);
    }
}

let auth = new AuthenticationStore()
export default auth