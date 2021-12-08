import React from 'react';
import {autorun, extendObservable, observable, action, toJS} from 'mobx';
import {observer, inject} from 'mobx-react';
import * as Xcomp from '../observableComponents';
import BsModal from '../../bootstrapModal'

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
        const {fabModel, naturtype, onOk, showModal} = props;
        const [sm, smprop] = showModal
        extendObservable(this, {
            // showModal: true,
            taxonSearchString: "",
            taxonSearchResult: [],
            taxonSearchWaitingForResult: true,
            hasStateChange: false,
            // hideStateChange: false,
            naturtypeLabel: null,
            editNaturtype: toJS(naturtype) // clone it
            // {
            //     NiNCode: null,
            //     DominanceForrest: [],
            //     TimeHorizon: null,
            //     ColonizedArea: null,
            //     StateChange: [],
            //     AffectedArea: null
            // }
        })
        // this.setSelectedNaturtype = (naturtypekode) => {
        //     const nnt = this.editNaturtype
        //     nnt.NiNCode = naturtypekode
        //     nnt
        //         .DominanceForrest
        //         .clear()
        //     nnt.TimeHorizon = null
        //     nnt.ColonizedArea = null
        //     nnt
        //         .StateChange
        //         .clear()
        //     nnt.AffectedArea = null

        //     this.showModal = true
        // }

        // this.hideModal = () => this.showModal = false
        this.hideModal  = action(() => sm[smprop]  = false)

        this.onOk = action (() => {
            this.hideModal()
            console.log(this.editNatureype)
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
        const {fabModel, naturtype, labels, showModal, hideStateChange, livsmedium} = this.props;
        const [sm, smprop] = showModal
        const [hsc, hscprop] = hideStateChange
        this.hideStateChange = hsc[hscprop]
        const ntLabels = labels.NatureTypes
        // const nts = fabModel.naturtyper
        const doms = fabModel.dominansSkog
        const koder = fabModel.koder
        const addNaturtype = naturtype
        console.log(addNaturtype)
        console.log("render naturtypeModal")
        return <div>
            {sm[smprop]
                ? <BsModal
                        heading={
                            <div> 
                                <h4>{this.editNaturtype.niNCode}</h4>
                                <p>{this.naturtypeLabel}</p>
                            </div >}
                        onCancel={this.hideModal}
                        onOk={this.onOk}
                        labels={labels.General}
                        children = {this.editNaturtype.Children}>
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




                        {/* <StringEnum2
                            label={ntLabels.affectedArea}
                            observableValue={[this.editNaturtype, 'affectedArea']}
                            codes={koder.affectedArea}
                            forceSync
                            observableDisabled={hsc[hscprop] || [this, "hasStateChange"]}/> */}
                       {!livsmedium && <Xcomp.MultiselectArray
                                label={ntLabels.assessmentBackground}
                                observableValue={[this.editNaturtype, 'background']} 
                                codes={koder.assessmentBackgrounds}
                                forceSync
                                formlayout
                               // mode="check"
                                />}

                        {livsmedium &&                         
                          <div>
                          <Xcomp.String 
                          label={ntLabels.speciesOrTaxon}
                          observableValue={[this, 'taxonSearchString']} placeholder={labels.General.searchSpecies} />
                            {this.taxonSearchResult.length > 0 ?
                            <div className="speciesSearchList" 
                                //style={{position: 'absolute', top: "36px", left:"15px"}}
                            >
                                <ul className="panel list-unstyled">
                                {this.taxonSearchResult.map(item =>
                                    <li 
                                    /*onClick={action(e => {
                                        props.newItem.taxonId = item.taxonId;
                                        props.newItem.taxonRank = item.taxonRank;
                                        props.newItem.scientificName = item.scientificName;
                                        props.newItem.scientificNameId = item.scientificNameId;
                                        props.newItem.scientificNameAuthor = item.author;
                                        props.newItem.vernacularName = item.popularName;

                                        props.newItem.redListCategory = item.rlCategory;
                                        props.newItem.taxonSearchResult.replace([]); 
                                        props.newItem.taxonSearchString = "" })} 
                                        key={item.scientificName}*/
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
                            </div> :
                            null}
                            {this.taxonSearchString != "" || this.taxonSearchWaitingForResult ?
                            <div style={{zIndex: 10000}}>
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
