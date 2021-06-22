import React from 'react';
import {extendObservable} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

import NaturtypeModal from './naturetypeModal';

const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

@observer
export class RedlistedNaturetypeRad extends React.Component {
    constructor(props) {
        super()
        const {naturtype, fabModel, deleteRow} = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: false
        })
        this.updateNaturetype = (upd) => {
            // console.log("upd rlnt: " + JSON.stringify(upd))
            const nt = naturtype

            nt.TimeHorizon = upd.TimeHorizon
            nt.ColonizedArea = upd.ColonizedArea
            nt.StateChange.replace(upd.StateChange)
            nt.AffectedArea = upd.AffectedArea

            this.showModal = false

        }
    }
    
    render() {
        const {naturtype, fabModel, deleteRow, labels} = this.props;
        const gLabels = labels.General
        const nt = naturtype
        const koder = fabModel.koder
        const stateChangLabel = nt.StateChange.map(sc => kodeTekst(koder.tilstandsendringer, sc)).join('\n')
        // console.log("rlntrow: " + JSON.stringify(nt))

        // const ntlabel = fabModel.naturtypeLabels[nt.NiNCode]
        return(
            <tr>
                <td>{nt.RedlistedNatureTypeName}</td>
                <td>{nt.Category}</td>
                <td>{kodeTekst(koder.timeHorizon, nt.TimeHorizon)}</td>
                <td>{kodeTekst(koder.colonizedArea, nt.ColonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.AffectedArea)}</td>
                <td>
                    <Xcomp.Button primary xs onClick={() => this.showModal = true}>{gLabels.edit}</Xcomp.Button>
                    {this.showModal
                    ? <NaturtypeModal 
                        naturtype={nt} 
                        showModal={[this, "showModal"]}
                        hideStateChange={[this, "hideStateChange"]} 
                        onOk={this.updateNaturetype} 
                        fabModel={fabModel} 
                        labels={labels}/>
                    : null}
                </td>
                <td><Xcomp.Button primary xs onClick={deleteRow}>{gLabels.delete}</Xcomp.Button></td>
            </tr>
        );
    }
}

@observer
export default class RedlistedNaturetypeTable extends React.Component {
    render() {
        const {naturetypes, labels, canRenderTable, fabModel} = this.props;
        const ntLabels = labels.NatureTypes
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
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                {canRenderTable ? naturetypes.map(nt => { 
                    const deleteRow = () => naturetypes.remove(nt)
                    const key = nt.RedlistedNatureTypeName + nt.TimeHorizon + nt.ColonizedArea + nt.StateChange.join(';') + nt.AffectedArea
                    return <RedlistedNaturetypeRad key={key} naturtype={nt} deleteRow={deleteRow} fabModel={fabModel} labels={labels}/> }) :
                    null
                }
            </tbody>
            </table>
        )
    }
}
