
import { computed, extendObservable, observable, toJS, action, makeObservable } from 'mobx';


class AuthenticationStore {

constructor() {
    makeObservable(this, {
        isAdmin: computed,
    });

    }
    get isAdmin() {
        //        return true
        return true; // || (this.access != null && this.access.HasAccess ));
    }
    
}

let auth = new AuthenticationStore()
export default auth