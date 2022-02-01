import React from 'react';
import {extendObservable, observable, action} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

import createTaxonSearch, { selectTaxonSearchState } from '../../createTaxonSearch'
import NaturtypeModal from './naturetypeModal';

const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

@observer
export class HabitatTableRow extends React.Component {
    constructor(props) {
        super()
        const {naturtype, fabModel, deleteRow, taxon} = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: false,
            edit: props.editMode
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
        const {naturtype, fabModel, assessment, deleteRow, labels, toggleEdit, editMode, taxon} = this.props;
        const gLabels = labels.General
        const nt = naturtype
        const disabled = fabModel.userContext.readonly
        console.log(nt)
        const newTaxon = nt.taxon
        const koder = fabModel.koder
        const ntlabel = (nt.niNCode && nt.niNCode.length > 3 && nt.niNCode.startsWith("LI "))
            ? fabModel.livsmediumLabels[nt.niNCode]
            : fabModel.naturtypeLabels[nt.niNCode]
        const stateChangLabel = nt.StateChange ? nt.StateChange.map(sc => kodeTekst(koder.tilstandsendringer, sc)).join('\n') : ""
        // console.log("row: " + JSON.stringify(nt))
        return(
            <tr>
                <td>{nt.niNCode}</td>
                <td>{ntlabel}</td>
                {/*
                <td>{nt.dominanceForrest ? nt.dominanceForrest.join('\n') : ""}</td>*/}
                {this.edit
                ?
                    <td>
                        {newTaxon && newTaxon.taxonId != "" ? 
                            <div 
                                    className="speciesNewItem"
                                    onClick={action(() => {
                                        newTaxon.taxonId = "";
                                        newTaxon.taxonRank = "";
                                        newTaxon.scientificName = "";
                                        newTaxon.scientificNameId = "";
                                        newTaxon.scientificNameAuthor = "";
                                        newTaxon.vernacularName = "";
                                        newTaxon.redListCategory = "";
                                        newTaxon.taxonSearchResult.replace([]); 
                                        newTaxon.taxonSearchString = "";                                        
                                        }) 
                                        
                                    }
                                >
                                    <div className={"rlCategory " + newTaxon.redListCategory}>{ newTaxon.redListCategory}</div>
                                    <div className="vernacularName">{newTaxon.vernacularName}</div>
                                    <div className="scientificName">{newTaxon.scientificName}</div>
                                    <div className="author">{"(" + newTaxon.scientificNameAuthor + ")"}</div>
                                </div> :
                        <div style={{position: 'relative'}}>                          
                          <Xcomp.String 
                            disabled={disabled} 
                            //label={ntLabels.speciesOrTaxon}
                            observableValue={[taxon, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />
                          {taxon.taxonSearchResult.length > 0 && 
                          <div className="speciesSearchList" 
                                //style={{position: 'absolute', top: "36px", left:"15px"}}
                            >
                              <ul className="panel list-unstyled">
                              {taxon.taxonSearchResult.map(item =>                              
                                  <li 
                                      onClick={action(() => selectTaxonSearchState(newTaxon, item)
                                       
                                        /*nt.taxon.taxonId = item.taxonId,
                                        nt.taxon.taxonRank = item.taxonRank,
                                        nt.taxon.scientificName = item.scientificName,
                                        nt.taxon.scientificNameId = item.scientificNameId,
                                        nt.taxon.scientificNameAuthor = item.author,
                                        nt.taxon.vernacularName = item.popularName,

                                        nt.taxon.redListCategory = item.rlCategory,
                                        nt.taxon.taxonSearchResult.replace([]), 
                                        nt.taxon.taxonSearchString = "",  */
                                       // this.edit = !this.edit                                          
                                        )}
                                      key={item.scientificName}
                                  >
                                      <div className="speciesSearchItem">
                                          <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                          <div className="vernacularName">{item.popularName}</div>
                                          <div className="scientificName">{item.scientificName}</div>
                                          <div className="author">{"(" + item.author + ")"}</div>
                                      </div>
                                  </li>
                              )}
                              </ul>
                          </div> 
                          }
                          {taxon.taxonSearchWaitingForResult ?
                          <div  style={{zIndex: 10000, position: 'absolute', top: "40px", left:"35px"}}>
                              <div  className={"three-bounce"}>
                                  <div className="bounce1" />
                                  <div className="bounce2" />
                                  <div className="bounce3" />
                              </div>
                          </div> :
                          null}
                      </div> }
                    </td> : 
                    <td>{nt.taxon ? nt.taxon.scientificName : ""}</td>}
                {this.edit
                ?
                <td>{assessment.alienSpeciesCategory == "DoorKnocker" ? koder.timeHorizon[1].Text : 
                        //kodeTekst(koder.timeHorizon, nt.timeHorizon)
                        <Xcomp.StringEnum observableValue={[nt, 'timeHorizon']} forceSync codes={koder.timeHorizon} />
                        }</td> :
                <td>{kodeTekst(koder.timeHorizon, nt.timeHorizon)}</td>
                    }
                {/*<td>{kodeTekst(koder.colonizedArea, nt.colonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.affectedArea)}</td>*/}
                <td>
                <Xcomp.Button  
                    disabled={this.context.readonly} xs className={this.edit ? "ok" : ""} title={!this.edit ? labels.General.edit : labels.General.ok} 
                    onClick={action(() => {this.edit = !this.edit; this.hideStateChange = nt.niNCode.startsWith("LI "); toggleEdit()})}
                >{this.edit ? labels.General.ok : 
                   // labels.General.edit
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                    </svg>
                    
                    }
                    </Xcomp.Button>
                    <Xcomp.Button xs onClick={deleteRow} title={gLabels.delete}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                        {/*{gLabels.delete}*/}
                        </Xcomp.Button>

                   
                    {this.showModal
                    ? <NaturtypeModal 
                        naturtype={nt}
                        taxon={taxon} 
                        showModal={[this, "showModal"]}
                        hideStateChange={[this, "hideStateChange"]} 
                        onOk={this.updateNaturetype} 
                        livsmedium ={true}
                        fabModel={fabModel} 
                        labels={labels}/>
                    : null}
                </td>               
            </tr>
        );
    }
}

@observer
export default class HabitatTable extends React.Component {
    constructor(props) {
        super()
        
        extendObservable(this, {
            taxon: {
                id: "habitatTableTaxonSearch",
                scientificName: "",
                scientificNameId: "",
                scientificNameAuthor: "",
                vernacularName: "",
                taxonRank: "",
                taxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                domesticOrAbroad : "",
                redListCategory: "", 
                keyStoneSpecie : false, 
                effectLocalScale : false, 
                effect : "Weak",
                scale: "Limited",
                status: "NewAlien",
                interactionType : "CompetitionSpace", 
                //interactionType : [], 
                longDistanceEffect : false, 
                confirmedOrAssumed : false, 
                basisOfAssessment: [],
                interactionTypes: [],
            }, 
        })
        // console.log("HabitatTable this.taxon " + JSON.stringify(this.taxon))
        //createTaxonSearch(this.taxon, props.fabModel.evaluationContext, tax => tax.existsInCountry)
        createTaxonSearch(this.taxon, props.fabModel.evaluationContext)
    }
            
    @observable editMode = false

    @action toggleEdit = () => {
        this.editMode = !this.editMode
    }
    render() {
        const {naturetypes, labels, canRenderTable, fabModel, desc} = this.props;
        const ntLabels = labels.NatureTypes
        const assessment = fabModel.assessment
        // console.log("naturtyperader#: " + naturetypes.length)
        return(
            <div><p>{desc}</p>
            <table className="table habitat">
            
            <colgroup>               
                <col  style={{width: "15%"}}/>
                <col  style={{width: "30%"}}/>
                <col  style={{width: "15%"}}/>
                <col  style={{width: "25%"}}/>
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
                    const key = nt.niNCode + nt.timeHorizon + nt.colonizedArea + 
                    //nt.stateChange.join(';') 
                    + nt.affectedArea
                    return <HabitatTableRow key={key} naturtype={nt} taxon={this.taxon} deleteRow={deleteRow} fabModel={fabModel} toggleEdit={this.toggleEdit} editMode={this.editMode} labels={labels} assessment={assessment}/> }) :
                    null
                }
            </tbody>
            </table>
            </div>
        )
    }
}
