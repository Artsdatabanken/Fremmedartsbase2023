import React from 'react';
import {autorun, extendObservable, observable, action, toJS} from 'mobx';
import {observer, inject} from 'mobx-react';
import * as Xcomp from '../observableComponents';
import BsModal from '../../bootstrapModal'
import createTaxonSearch from '../../createTaxonSearch'
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

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
        // const [objD,
        //     propD] = props.observableDisabled;
        // return <Xcomp.StringEnum {...props} disabled={!objD[propD] || props.disabled}/>
        return <Xcomp.StringEnum {...props} disabled={disabled}/>
    }
}

@observer
export default class NaturetypeModal extends React.Component {
    constructor(props) {
        super()
        const {fabModel, naturtype, onOk, showModal, taxon} = props;
        const [sm, smprop] = showModal
        // console.log("NaturetypeModal taxon " + JSON.stringify(taxon))
        extendObservable(this, {
            hasStateChange: false,
            naturtypeLabel: null,
            editNaturtype: naturtype, 
        })
        this.hideModal  = action(() => sm[smprop]  = false)

        this.onOk = action (() => {
            this.hideModal()
            console.log(this.editNaturetype)
            const clone = toJS(this.editNaturtype) // clone once more to be sure...
            onOk(clone)
        })
        autorun(() => {
            if (fabModel.naturtypeLabels && this.editNaturtype && this.editNaturtype.niNCode) {
                this.naturtypeLabel = fabModel.naturtypeLabels[this.editNaturtype.niNCode]
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
        const {fabModel, naturtype, labels, showModal, hideStateChange, livsmedium, taxon} = this.props;
        const [sm, smprop] = showModal
        const [hsc, hscprop] = hideStateChange
        this.hideStateChange = hsc[hscprop]
        const ntLabels = labels.NatureTypes
        // const natureTypeCodes = require('./../../../Nin2_3.json')
        // const redListCodes = require('./../../../TrueteOgSjeldneNaturtyper2018.json')
        const doms = fabModel.dominansSkog
        const koder = fabModel.koder
        const disabled = fabModel.userContext.readonly
        // const addNaturtype = naturtype       
        
        // console.log("render naturtypeModal ")
        // console.log("render naturtypeModal: " + JSON.stringify(taxon))
        // console.log("render naturtypeModal taxonSearchResult: " + taxon.taxonSearchResult.length)
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
                    <Xcomp.StringEnum
                        label={ntLabels.timeHorizon}
                        observableValue={[this.editNaturtype, 'timeHorizon']}
                        codes={koder.timeHorizon}
                        forceSync/>
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
                        //observableDisabled={hsc[hscprop] || [this, "hasStateChange"]}
                        />
                    }

                    {!livsmedium && <Xcomp.MultiselectArray
                            label={ntLabels.assessmentBackground}
                            observableValue={[this.editNaturtype, 'background']} 
                            codes={koder.assessmentBackgrounds}
                            forceSync
                            formlayout
                            // mode="check"
                            />}

                    {livsmedium &&                         
                        <div style={{position: 'relative'}}>
                        <Xcomp.String 
                            disabled={disabled} 
                            label={ntLabels.speciesOrTaxon}
                            observableValue={[taxon, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />

                        {taxon.taxonSearchResult.length > 0 ? 
                        <div className="speciesSearchList" 
                                // style={{position: 'absolute', top: "36px", left:"15px"}}
                        >
                            <ul className="panel list-unstyled">
                            {taxon.taxonSearchResult.map(item =>
                                <li onClick={action(e => {
                                taxon.taxonId = item.taxonId;
                                taxon.taxonRank = item.taxonRank;
                                taxon.scientificName = item.scientificName;
                                taxon.scientificNameId = item.scientificNameId;
                                taxon.scientificNameAuthor = item.author;
                                taxon.vernacularName = item.popularName;

                                taxon.redListCategory = item.rlCategory;
                                taxon.taxonSearchResult.replace([]); 
                                taxon.taxonSearchString = "" })} 
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
                    </div> 
                    }
                </BsModal>
                : null}
        </div>
    }
}
