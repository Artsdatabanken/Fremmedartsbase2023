import React from 'react';
import {observer} from 'mobx-react';
import {extendObservable} from 'mobx';
import * as Xcomp from '../observableComponents';
import EditReference from './editReference'

class ReferenceDetailsPane extends React.Component {
    constructor() {
        super()
        extendObservable(this, {
            redigeringsType: 'All',
        })
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

export default observer(ReferenceDetailsPane);
