import React from 'react';
import {extendObservable, action} from 'mobx';
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
        this.updateNaturetype = action((upd) => {
            // console.log("upd nt: " + JSON.stringify(upd))
            const nt = naturtype
            nt.dominanceForrest.replace(upd.dominanceForrest)
            nt.timeHorizon = upd.timeHorizon
            nt.colonizedArea = upd.colonizedArea
            nt.stateChange.replace(upd.stateChange)
            nt.affectedArea = upd.affectedArea            
            nt.background = upd.background
            this.showModal = false

        })
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
                <td>{assessment.alienSpeciesCategory == "DoorKnocker" ? koder.timeHorizon[1].Text : kodeTekst(koder.timeHorizon, nt.timeHorizon)}</td>
                <td>{kodeTekst(koder.colonizedArea, nt.colonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.affectedArea)}</td>
                <td>
                <Xcomp.MultiselectArray
                                observableValue={[nt, 'background']} 
                                codes={koder.assessmentBackgrounds}
                                //mode="check"
                                hideUnchecked/>
                <Xcomp.MultiselectArray
                                observableValue={[nt, 'background']} 
                                codes={koder.assessmentBackgrounds}
                                mode="check"
                                hideUnchecked/>
                </td>
                <td>
                    <Xcomp.Button 
                    style= {{marginBottom: '10px'}}
                        primary 
                        xs 
                        title = {gLabels.edit}
                        onClick={action(() => {
                            this.showModal = true
                            this.hideStateChange = nt.niNCode.startsWith("LI ")
                            })}
                        >
                            {/*{gLabels.edit}*/}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                            </svg>
                            </Xcomp.Button>
                    {this.showModal
                    ? <NaturtypeModal 
                        naturtype={nt} 
                        showModal={[this, "showModal"]}
                        hideStateChange={[this, "hideStateChange"]} 
                        onOk={this.updateNaturetype} 
                        fabModel={fabModel} 
                        labels={labels}/>
                    : null}
                    
                    <Xcomp.Button primary xs onClick={deleteRow} title={gLabels.delete}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                        {/*{gLabels.delete}*/}
                        </Xcomp.Button>
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
                    //const key = nt.NiNCode + nt.TimeHorizon + nt.ColonizedArea
                    //console.log(nt)
                    const key = nt.niNCode
                    return <NaturtypeRad key={key} naturtype={nt} deleteRow={deleteRow} codes={codes} fabModel={fabModel} labels={labels}/> }) :
                    null
                }
            </tbody>
            </table>
            </div>
        )
    }
}
