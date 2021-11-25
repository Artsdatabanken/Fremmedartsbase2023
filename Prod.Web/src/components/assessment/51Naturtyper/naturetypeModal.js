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
        const {fabModel, naturtype, labels, showModal, hideStateChange} = this.props;
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
                        <Xcomp.StringEnum
                            label={ntLabels.colonizedArea}
                            observableValue={[this.editNaturtype, 'colonizedArea']}
                            codes={koder.colonizedArea}
                            forceSync/>


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
                        <Xcomp.MultiselectArray
                                label={ntLabels.assessmentBackground}
                                observableValue={[this.editNaturtype, 'background']} 
                                codes={koder.assessmentBackgrounds}
                                forceSync
                                formlayout
                               // mode="check"
                                />
                    </BsModal>
                : null}
        </div>
    }
}
