import React from 'react';
import {extendObservable, action} from 'mobx';
import {observer, inject} from 'mobx-react';
// import * as Xcomp from '../observableComponents';
// import NaturtypeModal from './naturetypeModal';
const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 
inject('appState')
@observer
export class RedlistedNaturetypeRad extends React.Component {
    constructor(props) {
        super()
        const {naturtype, fabModel, deleteRow} = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: false
        })
        this.updateNaturetype = action((upd) => {
            // console.log("upd rlnt: " + JSON.stringify(upd))
            const nt = naturtype
            nt.TimeHorizon = upd.TimeHorizon
            nt.ColonizedArea = upd.ColonizedArea
            nt.StateChange.replace(upd.StateChange)
            nt.AffectedArea = upd.AffectedArea
            nt.Background = upd.Background
            this.showModal = false
        })
    }
    
    render() {
        const {naturtype, fabModel, deleteRow, labels} = this.props;
        const gLabels = labels.General
        const nt = naturtype
        console.log(nt)
        const koder = fabModel.koder
        const stateChangLabel = nt.stateChange.map(sc => kodeTekst(koder.tilstandsendringer, sc)).join('\n')
        return(
            <tr>
                <td>{nt.redlistedNatureTypeName}</td>
                <td>{nt.category}</td>
                <td>{kodeTekst(koder.timeHorizon, nt.timeHorizon)}</td>
                <td>{kodeTekst(koder.colonizedArea, nt.colonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.affectedArea)}</td>
            </tr>
        );
    }
}
@observer
export default class RedlistedNaturetypeTable extends React.Component {
    render() {
        const {naturetypes, labels, canRenderTable, fabModel} = this.props;
        const ntLabels = labels.NatureTypes
        console.log(naturetypes)
        return(
            <table className="table">
                <colgroup>
                    <col  style={{width: "20%"}}/>
                    <col  style={{width: "10%"}}/>
                    <col  style={{width: "10%"}}/>
                    <col  style={{width: "12%"}}/>
                    <col  style={{width: "20%"}}/>
                    <col  style={{width: "12%"}}/>
                    <col  style={{width: "5%"}}/>
                </colgroup>
                <thead>
                    <tr>
                        <th>{ntLabels.redlistName}</th>
                        <th>{ntLabels.category}</th>
                        <th>{ntLabels.timeHorizon}</th>
                        <th>{ntLabels.colonizedArea}</th>
                        <th>{ntLabels.stateChange}</th>
                        <th>{ntLabels.affectedArea}</th>
                        {/*<th>&nbsp;</th>*/}
                    </tr>
                </thead>
                <tbody>
                    {canRenderTable 
                    ? naturetypes.map(nt => { 
                        const deleteRow = () => naturetypes.remove(nt)
                        const key = nt.redlistedNatureTypeName + nt.timeHorizon + nt.colonizedArea + nt.stateChange.join(';') + nt.affectedArea
                        return <RedlistedNaturetypeRad key={key} naturtype={nt} deleteRow={deleteRow} fabModel={fabModel} labels={labels}/> }) 
                    : null}
                </tbody>
            </table>
        )
    }
}
