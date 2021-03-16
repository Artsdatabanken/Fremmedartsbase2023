import React from 'react';
import {observer} from 'mobx-react';
import {action, autorun, extendObservable, observable, useStrict} from 'mobx';
import * as Xcomp from '../observableComponents';
// import {loadData, storeData} from '../stores/apiService';




@observer
export class EditReferenceRow extends React.Component {
    render() {
        const {label, fieldName, reference} = this.props
        return (
            <div className="row">
                <div className="col-md-2">{label}:</div>
                <div className="col-md-10"><Xcomp.String observableValue={[reference, fieldName]}/></div>
            </div>
        )
    }
}

@observer
export class NoEditReferenceRow extends React.Component {
    render() {
        const {label, fieldName, reference} = this.props
        return (
            <div className="row" style={{marginTop: "7px"}}>
                <div className="col-md-2">{label}:</div>
                <div className="col-md-10"><span>{reference[fieldName]}</span></div>
            </div>
        )
    }
}



@observer
export default class EditReference extends React.Component {
    constructor({reference, referenceContext}) {
        super()

        //event.on('addreference', (arg) => console.log("new reference added: " + arg))

        extendObservable(this, {
            // redigeringsType: referenceContext ? referenceContext.redigeringsType : "All"
            redigeringsType: "All"
        })

        autorun(() => {
            // this.redigeringsType = referenceContext ? referenceContext.redigeringsType : this.redigeringsType
            
        })
    //     this.referenceFields = [
    //         {
    //             type:"Publication",
    //             fields: [
    //                 {label:"Author", fieldName:"author"},
    //                 {label:"Årstall", fieldName:"year"},
    //                 {label:"Tittel", fieldName:"title"},
    //                 {label:"Summary", fieldName:"summary"},
    //                 {label:"Journal", fieldName:"journal"},
    //                 {label:"Volum", fieldName:"volume"},
    //                 {label:"Sider", fieldName:"pages"},
    //                 {label:"Bibliografi", fieldName:"bibliography"},
    //                 {label:"Nøkkelord", fieldName:"keywords"}
    //             ]
    //         },
    //         {
    //             type:"Person",
    //             fields: [
    //                 {label:"Etternavn", fieldName:"lastname"},
    //                 {label:"Mellomnavn", fieldName:"middlename"},
    //                 {label:"Fornavn", fieldName:"firstname"}
    //             ]
    //         },
    //         {
    //             type:"Url",
    //             fields: [
    //                 {label:"Tittel", fieldName:"title"},
    //                 {label:"URL", fieldName:"url"}
    //             ]
    //         }
    //     ]
    

    }



            /*{this.referenceFields.map(group => 
                this.redigeringsType === group.type || this.redigeringsType === 'All'
                ? <div key={group.type}>
                    {group.fields.map(f => 
                        (reference.allowEdit
                        ? <EditReferenceRow key={f.fieldName} label={f.label} fieldName={f.fieldName} reference={reference} />
                        : <NoEditReferenceRow key={f.fieldName} label={f.label} fieldName={f.fieldName} reference={reference} />)
                    )}
                </div>
            : null)}*/





    render() {
        const {reference, referenceContext, refcodes} = this.props
        // console.log("ee" + referenceContext.redigeringsType)
        // const nbsp = "\u00a0"
        // console.log("ref: " + JSON.stringify(reference))
        return (
            <div>
            { refcodes.map(group => 
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
