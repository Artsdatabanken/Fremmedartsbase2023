import React from 'react';
import {extendObservable} from 'mobx';
import {observer, inject} from 'mobx-react';
import * as Xcomp from '../observableComponents';

import NaturtypeModal from './naturetypeModal';

const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 
@inject("appState")
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
        const {naturtype, fabModel, deleteRow, labels, codes, appState:{assessment}} = this.props;
        
        const riskAssessment = assessment.riskAssessment 
        const gLabels = labels.General
        const nt = naturtype
        const ntlabel = nt.niNVariation
        const koder = codes
        //const dominanceForrest = nt.DominanceForrest.join('\n')
        const dominanceForrest = nt.DominanceForrest
      /*  const ntlabel = (nt.NiNCode && nt.NiNCode.length > 3 && nt.NiNCode.startsWith("LI "))
            ? fabModel.livsmediumLabels[nt.NiNCode]
            : fabModel.naturtypeLabels[nt.NiNCode] */
       // const stateChangLabel = nt.StateChange.map(sc => kodeTekst(koder.tilstandsendringer, sc)).join('\n')
       const stateChangLabel = nt.stateChange
        // console.log("row: " + JSON.stringify(nt))
        return(
            <tr>
                <td>{nt.niNCode}</td>
                <td>{ntlabel}</td>
                <td>{dominanceForrest}</td>
                <td></td>
                <td>{kodeTekst(koder.timeHorizon, nt.timeHorizon)}</td>
                <td>{kodeTekst(koder.colonizedArea, nt.colonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.affectedArea)}</td>
                <td>
                <Xcomp.MultiselectArray
                                observableValue={[nt, 'background']} 
                                codes={koder.assessmentBackgrounds}
                                mode="check"/>
                </td>
                <td>
                    <Xcomp.Button 
                    style= {{marginBottom: '10px'}}
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
                    
                    <Xcomp.Button primary xs onClick={deleteRow}>{gLabels.delete}</Xcomp.Button>
                </td>
                <td>&nbsp;</td>
            </tr>
        );
    }
}

@observer
export default class NaturtypeTable extends React.Component {
    render() {
        const {naturetypes, labels, canRenderTable, fabModel, desc, codes} = this.props;
        const ntLabels = labels.NatureTypes
        // console.log("naturtyperader#: " + naturetypes.length)
        return(
            <div><p>{desc}</p>
            <table className="table naturetype">
            
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
                    <th>{ntLabels.name}</th>
                    <th>{ntLabels.dominanceForrest}</th>
                    <th>{ntLabels.natureTypeArea}</th>
                    <th>{ntLabels.timeHorizon}</th>
                    <th>{ntLabels.colonizedArea}</th>
                    <th>{ntLabels.stateChange}</th>
                    <th>{ntLabels.affectedArea}</th>
                    <th>{ntLabels.assessmentBackground}</th>
                    <th>&nbsp;</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                {!canRenderTable ? naturetypes.map(nt => { 
                    const deleteRow = () => naturetypes.remove(nt)
                    //const key = nt.NiNCode + nt.TimeHorizon + nt.ColonizedArea + nt.StateChange.join(';') + nt.AffectedArea
                    const key = nt.NiNCode + nt.TimeHorizon + nt.ColonizedArea
                    return <NaturtypeRad key={key} naturtype={nt} deleteRow={deleteRow} codes={codes} fabModel={fabModel} labels={labels}/> }) :
                    null
                }
            </tbody>
            </table>
            </div>
        )
    }
}
