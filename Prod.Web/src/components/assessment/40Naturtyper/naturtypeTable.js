import React from 'react';
import {extendObservable} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

import NaturtypeModal from './naturetypeModal';

const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

@observer
export class NaturtypeRad extends React.Component {
    constructor(props) {
        super()
        const {naturtype, fabModel, deleteRow} = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: false
        })
        this.updateNaturetype = (upd) => {
            // console.log("upd nt: " + JSON.stringify(upd))
            const nt = naturtype
            nt.DominanceForrest.replace(upd.DominanceForrest)
            nt.TimeHorizon = upd.TimeHorizon
            nt.ColonizedArea = upd.ColonizedArea
            nt.StateChange.replace(upd.StateChange)
            nt.AffectedArea = upd.AffectedArea

            this.showModal = false

        }
    }

    // editSelectedNaturtype(naturtypekode) {
    //     this.hideStateChange = false;
    //     this.setSelectedNT(naturtypekode)
    // }
    // this.setSelectedLivsmedium = (naturtypekode) => {
    //     this.hideStateChange = true;
    //     this.setSelectedNT(naturtypekode)
    // }


    render() {
        const {naturtype, fabModel, deleteRow, labels} = this.props;
        const gLabels = labels.General
        const nt = naturtype
        const koder = fabModel.koder
        const ntlabel = (nt.NiNCode && nt.NiNCode.length > 3 && nt.NiNCode.startsWith("LI "))
            ? fabModel.livsmediumLabels[nt.NiNCode]
            : fabModel.naturtypeLabels[nt.NiNCode]
        const stateChangLabel = nt.StateChange.map(sc => kodeTekst(koder.tilstandsendringer, sc)).join('\n')
        // console.log("row: " + JSON.stringify(nt))
        return(
            <tr>
                <td>{nt.NiNCode}</td>
                <td>{ntlabel}</td>
                <td>{nt.DominanceForrest.join('\n')}</td>
                <td>{kodeTekst(koder.timeHorizon, nt.TimeHorizon)}</td>
                <td>{kodeTekst(koder.colonizedArea, nt.ColonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.AffectedArea)}</td>
                <td>
                    <Xcomp.Button 
                        primary 
                        xs 
                        onClick={() => {
                            this.showModal = true
                            this.hideStateChange = nt.NiNCode.startsWith("LI ")
                            }}
                        >{gLabels.edit}</Xcomp.Button>
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
export default class NaturtypeTable extends React.Component {
    render() {
        const {naturetypes, labels, canRenderTable, fabModel} = this.props;
        const ntLabels = labels.NatureTypes
        // console.log("naturtyperader#: " + naturetypes.length)
        return(
            <table className="table">
            <colgroup>
                <col  style={{width: "8%"}}/>
                <col  style={{width: "18%"}}/>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "12%"}}/>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "12%"}}/>
                <col  style={{width: "5%"}}/>
                <col  style={{width: "5%"}}/>
            </colgroup>
            <thead>
                <tr>
                    <th>{ntLabels.code}</th>
                    <th>{ntLabels.name}</th>
                    <th>{ntLabels.dominanceForrest}</th>
                    <th>{ntLabels.timeHorizon}</th>
                    <th>{ntLabels.colonizedArea}</th>
                    <th>{ntLabels.stateChange}</th>
                    <th>{ntLabels.affectedArea}</th>
                    <th>&nbsp;</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                {canRenderTable ? naturetypes.map(nt => { 
                    const deleteRow = () => naturetypes.remove(nt)
                    const key = nt.NiNCode + nt.TimeHorizon + nt.ColonizedArea + nt.StateChange.join(';') + nt.AffectedArea
                    return <NaturtypeRad key={key} naturtype={nt} deleteRow={deleteRow} fabModel={fabModel} labels={labels}/> }) :
                    null
                }
            </tbody>
            </table>
        )
    }
}
