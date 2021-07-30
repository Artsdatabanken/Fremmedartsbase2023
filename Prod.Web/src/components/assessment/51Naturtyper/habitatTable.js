import React from 'react';
import {extendObservable} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

import NaturtypeModal from './naturetypeModal';

const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

@observer
export class HabitatTableRow extends React.Component {
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
            nt.Background = upd.Background
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
        console.log(nt)
        const koder = fabModel.koder
        const ntlabel = (nt.niNCode && nt.niNCode.length > 3 && nt.niNCode.startsWith("LI "))
            ? fabModel.livsmediumLabels[nt.niNCode]
            : fabModel.naturtypeLabels[nt.niNCode]
        const stateChangLabel = nt.StateChange.map(sc => kodeTekst(koder.tilstandsendringer, sc)).join('\n')
        // console.log("row: " + JSON.stringify(nt))
        return(
            <tr>
                <td>{nt.niNCode}</td>
                <td>{ntlabel}</td>
                <td>{nt.dominanceForrest.join('\n')}</td>
                <td></td>
                <td>{kodeTekst(koder.timeHorizon, nt.timeHorizon)}</td>
                <td>{kodeTekst(koder.colonizedArea, nt.colonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.affectedArea)}</td>
                <td>
                    <Xcomp.Button 
                        primary 
                        xs 
                        onClick={() => {
                            this.showModal = true
                            this.hideStateChange = nt.niNCode.startsWith("LI ")
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
export default class HabitatTable extends React.Component {
    render() {
        const {naturetypes, labels, canRenderTable, fabModel, desc} = this.props;
        const ntLabels = labels.NatureTypes
        // console.log("naturtyperader#: " + naturetypes.length)
        return(
            <div><p>{desc}</p>
            <table className="table table-striped">
            
            <colgroup>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "10%"}}/>                
                <col  style={{width: "15%"}}/>
                <col  style={{width: "10%"}}/>
                <col  style={{width: "15%"}}/>
                <col  style={{width: "15%"}}/>
                <col  style={{width: "25%"}}/>
                <col  style={{width: "15%"}}/>
                <col  style={{width: "15%"}}/>
            </colgroup>
            <thead>
                <tr>
                    <th>{ntLabels.code}</th>
                    <th>{ntLabels.habitat}</th>
                    <th>{ntLabels.hosts}</th>
                    <th>{ntLabels.timeHorizon}</th>
                </tr>
            </thead>
            <tbody>
                {canRenderTable ? naturetypes.map(nt => { 
                    const deleteRow = () => naturetypes.remove(nt)
                    const key = nt.niNCode + nt.timeHorizon + nt.colonizedArea + nt.stateChange.join(';') + nt.affectedArea
                    return <NaturtypeRad key={key} naturtype={nt} deleteRow={deleteRow} fabModel={fabModel} labels={labels}/> }) :
                    null
                }
            </tbody>
            </table>
            </div>
        )
    }
}
