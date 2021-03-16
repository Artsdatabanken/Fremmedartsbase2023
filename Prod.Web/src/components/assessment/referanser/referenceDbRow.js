import React from 'react';
import {observer} from 'mobx-react';
import {action, autorun, extendObservable, observable, useStrict} from 'mobx';
import * as Xcomp from '../observableComponents';
// import {loadData, storeData} from '../stores/apiService';



@observer
export default class ReferenceDbRow extends React.Component {
    constructor({reference}) {
        super()

        //event.on('addreference', (arg) => console.log("new reference added: " + arg))

        // extendObservable(this, {
        //     // showDetail: false,
        //     allowEdit: true
        // })
    }
    render() {
        const {reference, addReference, visDetalj, labels} = this.props
        const gLabels = labels.General
        const nbsp = "\u00a0"
        return (
            <tr>
                <td>
                    <Xcomp.Button primary xs
                        disabled={this.context.readonly}
                        onClick={() => addReference(reference)}
                    >{gLabels.add}</Xcomp.Button>
                </td>
                <td>
                    <span>{reference.referenceString}</span>
                </td>
                <td>
                    <span>{reference.type}</span>
                </td>
                <td>
                    <Xcomp.Button primary xs 
                        disabled={this.context.readonly}
                        onClick={() => visDetalj(reference)}
                    >{gLabels.showDetails}</Xcomp.Button>
                </td>
            </tr>
        )
    }
}



                //     <Xcomp.Button primary xs onClick={() => {((item) =>{
                //             this.valgtReferanse.Year = item.year
                //             this.valgtReferanse.Volume = item.volume
                //             this.valgtReferanse.Summary = item.summary
                //             this.valgtReferanse.Title = item.title
                //             this.valgtReferanse.Pages = item.pages
                //             this.valgtReferanse.Middlename = item.middlename
                //             this.valgtReferanse.Lastname = item.lastname
                //             this.valgtReferanse.Keywords = item.keywords
                //             this.valgtReferanse.Journal = item.journal
                //             this.valgtReferanse.Firstname = item.firstname
                //             this.valgtReferanse.Bibliography = item.bibliography
                //             this.valgtReferanse.Author = item.author
                //             this.valgtReferanse.URL = item.url
                //     })(item)}} >Vis detalj</Xcomp.Button>
                // </td>

