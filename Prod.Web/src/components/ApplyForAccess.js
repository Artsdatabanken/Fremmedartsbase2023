import React from 'react'
import {observable} from 'mobx'
import auth from './authService'

import * as Xcomp from './observableComponents'
import { observer } from 'mobx-react'

var ApplyForAccessStore = observable({reason: ''})
@observer
export default class ApplyForAccess extends React.Component {
    sendApplication(e) {
        e.preventDefault()
        auth.applyForAccess(ApplyForAccessStore.reason);
    }

    render() {
        const {labels, applicationPending} = this.props
        return (
            <form role="form">
                
                {
                applicationPending
                ? 
                <div>
                    Søknad om tilgang til produksjonsbase er sendt! Avventer at administrator gir deg tilgang - du vil få en epost når dette er på plass.
                </div>
                : 
                <div>
                <span>Begrunn behov for tilgang til databasen - kun meldemmer av ekspertkomiteer skal ha tilgang til denne.</span>
                <Xcomp.String observableValue={[ApplyForAccessStore, 'reason']} placeholder="begrunnelse" maxlength="2000" ></Xcomp.String>
                <Xcomp.Button disabled={ApplyForAccessStore.reason.length < 3} onClick={(e) => this.sendApplication(e) }><span>Send søknad</span></Xcomp.Button>
                </div>
                }
            </form>
        )
    }
}
