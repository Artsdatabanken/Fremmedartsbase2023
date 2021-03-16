import React from 'react';
import {observer} from 'mobx-react';
import {action, autorun, extendObservable, observable, useStrict} from 'mobx';
import * as Xcomp from '../observableComponents';
import {loadData, storeData} from '../../stores/apiService';

import EditReference from './editReference'

@observer
export default class ReferenceDetailsPane extends React.Component {
    constructor() {
        super()
        extendObservable(this, {

            redigeringsType: 'All',
            // kanLagres: false,
        })

        // this.contextVerdier = [
        //     {
        //         text: 'Alle referanser',
        //         value: "None"
        //     }, {
        //         text: 'Referanser knytt til FAB 3',
        //         value: "Local"
        //     }, {
        //         text: 'Egne registrerte referanser',
        //         value: "Personal"
        //     }
        // ];
        // this.typeVerdier = [
        //     {
        //         text: 'Alle felt',
        //         value: "All"
        //     }, {
        //         text: 'Publikasjoner',
        //         value: "Publication"
        //     }, {
        //         text: 'Personer',
        //         value: "Person"
        //     }, {
        //         text: 'Url',
        //         value: "Url"
        //     }
        // ];

    }
   
    render() {
        const {valgtReferanse, nyReferanse, lagreReferanse, slettReferanse, codes, labels} = this.props;
        // const nbsp = "\u00a0"
        const rLabels = labels.Reference
        return (
            <div className="well" id="Visreferanse">
                <h3>{rLabels.editPaneHeading}</h3>
                <div className="row">
                    <div className="col-md-3">
                        <Xcomp.StringEnum
                            observableValue={[this, 'redigeringsType']}
                            codes={codes.ReferenceType}
                            disabled={!valgtReferanse.allowEdit}/>
                    </div>
                    <div className="col-md-3">
                        <Xcomp.Button onClick={lagreReferanse} disabled={!valgtReferanse.kanLagres}>
                            {valgtReferanse.id === 'NY_REFERANSE' ? 'Lagre referanse' : 'Oppdatere referanse'}
                        </Xcomp.Button>
                    </div>
                    <div className="col-md-3">
                        <Xcomp.Button
                            onClick={nyReferanse}
                            >{rLabels.referenceNew}</Xcomp.Button>
                    </div>
                    <div className="col-md-3">
                        <Xcomp.Button
                            onClick={slettReferanse}
                            disabled={!(valgtReferanse.allowDelete && valgtReferanse.id != 'NY_REFERANSE')}>{rLabels.referenceDelete}</Xcomp.Button>
                    </div>
                </div>
                {valgtReferanse.id
                    ? <EditReference reference={ valgtReferanse} referenceContext={this} refcodes={codes.ReferenceType}/>
                    : <h4>{rLabels.canNotEdit}</h4>
                }
            </div>
        );
    }
}
