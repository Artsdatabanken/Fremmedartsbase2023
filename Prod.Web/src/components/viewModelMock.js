import {
    action,
    autorun,
    computed,
    extendObservable,
    makeObservable,
    flow,
    observable,
    reaction,
    runInAction,
    trace,
    transaction,
    toJS,
    isObservable,
    isObservableProp
} from 'mobx';



class ViewModelMock {
    constructor() {
        makeObservable(this, {

        });

        extendObservable(this, {
            userContext: {
                readonly: false
            }
        })
    }

        
}
export default new ViewModelMock()