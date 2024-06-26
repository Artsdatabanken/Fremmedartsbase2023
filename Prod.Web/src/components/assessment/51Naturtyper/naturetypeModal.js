import React from 'react';
import {autorun, extendObservable, observable, action, toJS} from 'mobx';
import {observer, inject} from 'mobx-react';
import * as Xcomp from '../observableComponents';
import BsModal from '../../bootstrapModal'
import { selectTaxonSearchState } from '../../createTaxonSearch'
const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 
@inject("appState")
@observer
export class StringEnum2 extends React.Component {
    render() {
        const props = this.props
        const disabledTypeBool = typeof(props.observableDisabled) === "boolean"
        const disabled = 
            props.observableDisabled == undefined
            ? props.disabled
            : disabledTypeBool
            ? !props.observableDisabled
            : !props.observableDisabled[0][props.observableDisabled[1]]
        return <Xcomp.StringEnum {...props} disabled={disabled}/>
    }
}

@observer
export default class NaturetypeModal extends React.Component {
    constructor(props) {
        super()
        const {appState, naturtype, onOk, showModal, taxon} = props;
        const [sm, smprop] = showModal
        // console.log("NaturetypeModal taxon " + JSON.stringify(taxon))
        extendObservable(this, {
            hasStateChange: false,
            naturtypeLabel: null,
            editNaturtype: naturtype, 
            taxon: naturtype.taxon
        })
        this.hideModal  = action(() => sm[smprop]  = false)
        this.onOk = action (() => {
            this.hideModal()
            const clone = toJS(this.editNaturtype) // clone once more to be sure...
            onOk(clone)
        })
        autorun(() => {
            if (appState.naturtypeLabels && this.editNaturtype && this.editNaturtype.niNCode) {
                this.naturtypeLabel = appState.naturtypeLabels[this.editNaturtype.niNCode]
            }
        })
        autorun(() => {
            const hasSC = this.editNaturtype ? this.editNaturtype.stateChange.length > 0 : null
            this.hasStateChange =  hasSC 
            if (!hasSC) {
                this.editNaturtype.affectedArea = "0"
            }
        })
    }
    hasDominanceForrest(nincode) {
        if (!nincode) {
            return false
        }
        const htype = nincode.substring(0, 2)
        const htypes = ['T4', 'T30', 'T38', 'V2', 'V8']
        const result = htypes.indexOf(htype) > -1
        return result
    }
    render() {
        const {appState, naturtype, labels, showModal, hideStateChange, livsmedium, taxon, assessment} = this.props;
        const [sm, smprop] = showModal
        const [hsc, hscprop] = hideStateChange
        this.hideStateChange = hsc[hscprop]
        const ntLabels = labels.NatureTypes
        const doms = appState.dominansSkog
        const koder = appState.koder
        const disabled = appState.userContext.readonly
        return <div>
            {sm[smprop]
                ? <BsModal
                        heading={
                            <div>
                                <h4>{naturtype.name ? naturtype.name : this.editNaturtype.name ? this.editNaturtype.name : ""}</h4> 
                                <p>{this.naturtypeLabel}</p>
                            </div >}
                        onCancel={this.hideModal}
                        onOk={this.onOk}
                        labels={labels.General}
                        >
                    {doms && this.hasDominanceForrest(this.editNaturtype.niNCode)
                        ? <Xcomp.MultiselectArray
                                label={ntLabels.dominanceForrest}
                                labels={labels.General}
                                observableValue={[this.editNaturtype, 'dominanceForrest']}
                                codes={doms}
                                forceSync
                                formlayout/>
                        : null}
                    {(assessment.isDoorKnocker && assessment.speciesStatus == "A") ? 
                    <div>
                        <label>{ntLabels.timeHorizon}</label><br/>
                        <span>{kodeTekst(koder.timeHorizon, this.editNaturtype.timeHorizon)}</span>
                    </div>
                     :
                    <Xcomp.StringEnum
                        label={ntLabels.timeHorizon}
                        observableValue={[this.editNaturtype, 'timeHorizon']}
                        codes={koder.timeHorizon }
                        forceSync/>
                    }
                    {!livsmedium && <Xcomp.StringEnum
                        label={ntLabels.colonizedArea}
                        observableValue={[this.editNaturtype, 'colonizedArea']}
                        codes={koder.colonizedArea}
                        forceSync/>}


                    {hsc[hscprop]
                        ? null
                        : <Xcomp.MultiselectArray
                            label={ntLabels.stateChange}
                            labels={labels.General}
                            observableValue={[this.editNaturtype, 'stateChange']}
                            codes={koder.tilstandsendringer}
                            forceSync
                            formlayout/>}
                    {!livsmedium &&  <StringEnum2
                        label={ntLabels.affectedArea}
                        observableValue={[this.editNaturtype, 'affectedArea']}
                        codes={koder.affectedArea}
                        forceSync
                        />
                    }
                    {!livsmedium && <Xcomp.MultiselectArray
                            label={ntLabels.assessmentBackground}
                            observableValue={[this.editNaturtype, 'background']} 
                            codes={koder.assessmentBackgrounds}
                            forceSync
                            formlayout
                            />}

                    {livsmedium &&
                    <>     
                        {this.taxon.taxonId != "" ? 
                            <div 
                                className="speciesNewItem"
                                onClick={action(() => {
                                    this.taxon.taxonId = "";
                                    this.taxon.taxonRank = "";
                                    this.taxon.scientificName = "";
                                    this.taxon.scientificNameId = "";
                                    this.taxon.scientificNameAuthor = "";
                                    this.taxon.vernacularName = "";
                                    this.taxon.redListCategory = "";
                                    this.taxon.taxonSearchResult.replace([]); 
                                    this.taxon.taxonSearchString = "";                                        
                                    }) 
                                        
                                    }
                                >
                                    <div className={"rlCategory " + this.taxon.redListCategory}>{ this.taxon.redListCategory}</div>
                                    <div className="vernacularName">{this.taxon.vernacularName}</div>
                                    <div className="scientificName">{this.taxon.scientificName}</div>
                                    <div className="author">{"(" + this.taxon.scientificNameAuthor + ")"}</div>
                            </div> :                    
                        <div style={{position: 'relative'}}>
                        <Xcomp.String 
                            disabled={disabled} 
                            label={ntLabels.speciesOrTaxon}
                            observableValue={[taxon, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />

                        {taxon.taxonSearchResult.length > 0 ? 
                        <div className="speciesSearchList" >
                            <ul className="panel list-unstyled">
                            {taxon.taxonSearchResult.map(item =>
                                <li 
                                    onClick={action(() => selectTaxonSearchState(this.taxon, item))}
                                    key={item.scientificName}
                                >
                                    <div className="speciesSearchItem">
                                        <div className={"rlCategory " + item.rlCategory}>{item.rlCategory}</div>
                                        <span className="vernacularName">{item.popularName}</span>
                                        <div className="scientificName">{item.scientificName}</div>
                                        <div className="author">{"(" + item.author + ")"}</div>
                                    </div>
                                </li>
                            )}
                            </ul>
                        </div> 
                        : null
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
                    </>
                    }
                </BsModal>
                : null}
        </div>
    }
}
