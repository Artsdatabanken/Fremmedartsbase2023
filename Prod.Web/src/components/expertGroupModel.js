import {extendObservable, autorun, observable, runInAction} from 'mobx';
import fetch from 'isomorphic-fetch'
//import * as Utils from '../utils';
import {loadData} from '../apiService';
// import {user} from "./userSession"
import auth from './authService'
import config from '../config'

//const loadData = () => {}


class ExpertGroupModel {
    constructor() {
        extendObservable(this,
        {
            alleekspertgrupper: [],
            valgtekspertgruppe: null,
            eksperterforvalgtgruppe: [],
            alleeksperter: [],
            valgtekspert: null,
            valgtekspertsrolleivalgtekspertgruppe: {
                leder: false,
                skriver: false
                // leser: false
            },
            tilgangsoknader: [],
        });

        autorun(() => {
                    if (auth.isAdmin) { // actual check

                        this.GetAccessApplications();

                        loadData(config.getUrl("ExpertGroups"),
                            data => {
                                if (data) {
                                    const res = data.map(s => {return {value:s, text:s}}) // todo: remove this line when server data is correct
                                    const expertgroups = observable.array(res) 
                                    runInAction(() => {
                                        this.alleekspertgrupper = expertgroups
                                        this.valgtekspertgruppe = expertgroups[0].value

                                    })
                                }
                            })
                        loadData(config.getUrl("Access/users"),
                            data => {
                                if (data) {
                                    const res = data.map(s => {return {value:s.id, text:s.value}}) // todo: remove this line when server data is correct
                                    const expertgroups = observable.array(res) 
                                    runInAction(() => {
                                        this.alleeksperter = expertgroups;
                                        this.valgtekspert = expertgroups[0].value
                                    })
                                    // this.alleeksperter = data;
                                    // this.valgtekspert = data[0].GUID;
                                }
                            })
                    } else {
                    runInAction(() => {
                    this.valgtekspertgruppe = null;
                        this.valgtekspert = null;
                        this.alleekspertgrupper = [];
                        this.alleeksperter = [];
                    })}
            }
        );


        autorun(() => {
            if (this.valgtekspertgruppe && auth.isAdmin) {
                this.hentEkspertgruppeMedlemmer()
            }
        });
    }

    GetAccessApplications() {
        loadData(config.getUrl("Access/applications"), data => {
            if (data) {
                this.tilgangsoknader = data;
            }
        });
    }

    hentEkspertgruppeMedlemmer() {
                const url = config.getUrl("ExpertGroups/members/"+ this.valgtekspertgruppe);
                loadData(url, data =>
                    runInAction(() => {
                    this.eksperterforvalgtgruppe.replace(data)}))
    }
}

let expertgroupmodel = new ExpertGroupModel()
export default expertgroupmodel