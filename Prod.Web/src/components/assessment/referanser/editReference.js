import React from 'react';
import { observer } from 'mobx-react';
import { autorun, extendObservable } from 'mobx';
import * as Xcomp from '../observableComponents';



export class EditReferenceRow extends React.Component {
    render() {
        const { label, fieldName, reference } = this.props
        return (
            <div className="row">
                <div className="col-md-2">{label}:</div>
                <div className="col-md-10"><Xcomp.String observableValue={[reference, fieldName]} /></div>
            </div>
        )
    }
}

export class NoEditReferenceRow extends React.Component {
    render() {
        const { label, fieldName, reference } = this.props
        return (
            <div className="row" style={{ marginTop: "7px" }}>
                <div className="col-md-2">{label}:</div>
                <div className="col-md-10"><span>{reference[fieldName]}</span></div>
            </div>
        )
    }
}

class EditReference extends React.Component {
    constructor({ reference, referenceContext }) {
        super()
        extendObservable(this, {
            redigeringsType: "All"
        })
        autorun(() => {
        })
    }

    render() {
        const { reference, referenceContext, refcodes } = this.props
        return (
            <div>
                {refcodes.map(group =>
                    this.redigeringsType === group.Value || this.redigeringsType === 'All'
                        ? <div key={group.Value}>
                            {group.Children.Fields.map(f =>
                            (reference.allowEdit
                                ? <EditReferenceRow key={f.Value} label={f.Text} fieldName={f.Value} reference={reference} />
                                : <NoEditReferenceRow key={f.Value} label={f.Text} fieldName={f.Value} reference={reference} />)
                            )}
                        </div>
                        : null)}
            </div>
        )
    }
}

export default observer(EditReference);
