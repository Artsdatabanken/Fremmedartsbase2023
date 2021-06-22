import React from 'react';
import {autorun, extendObservable, observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import NaturtypeSelector from './naturtypeSelector';
import * as Xcomp from '../observableComponents';
import BsModal from '../bootstrapModal'

@observer
export class StringEnum2 extends React.Component {
    render() {
        const props = this.props
        const [objD,
            propD] = props.observableDisabled;
        return <Xcomp.StringEnum {...props} disabled={!objD[propD] || props.disabled}/>
    }
}

@observer
export default class NewNaturetype extends React.Component {
    constructor(props) {
        super()
        const {fabModel, addNaturtype} = props;
        extendObservable(this, {
            showModal: false,
            hasStateChange: false,
            naturtypeLabel: null,
            nyNaturtype: {
                NiNCode: null,
                DominanceForrest: [],
                TimeHorizon: null,
                ColonizedArea: null,
                StateChange: [],
                AffectedArea: null
            }
        })
        this.setSelectedNaturtype = (naturtypekode) => {
            const nnt = this.nyNaturtype
            nnt.NiNCode = naturtypekode
            nnt.DominanceForrest.clear()
            nnt.TimeHorizon = null
            nnt.ColonizedArea = null
            nnt.StateChange.clear()
            nnt.AffectedArea = null

            this.showModal = true
        }


        this.hideModal = () => this.showModal = false
        this.onOk = () => {
            this.hideModal()
            const clone = toJS(this.nyNaturtype)
            addNaturtype(clone)
        }
        autorun(() => {
            if (fabModel.naturtypeLabels && this.nyNaturtype && this.nyNaturtype.NiNCode) {
                this.naturtypeLabel = fabModel.naturtypeLabels[this.nyNaturtype.NiNCode]
            }
        })
        autorun(() => {
            const hasSC = this.nyNaturtype.StateChange.length > 0
            this.hasStateChange = hasSC
            if (!hasSC) {
                this.nyNaturtype.AffectedArea = "0"
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
        const {fabModel, addNaturtype, labels} = this.props;
        const nts = fabModel.naturtyper
        const doms = fabModel.dominansSkog
        const koder = fabModel.koder

        return <div>
            <h4>Velg blant følgende naturtyper (NiN 2.0):</h4>
            {nts
                ? <NaturtypeSelector naturtyper={nts} setSelected={this.setSelectedNaturtype}/>
                : null}
            {this.showModal
                ? <BsModal
                        heading={
                            <div> 
                                <h4>{this.nyNaturtype.NiNCode}</h4>
                                <p>{this.naturtypeLabel}</p>
                            </div >}
                        onCancel={this.hideModal}
                        onOk={this.onOk}>
                        {doms && this.hasDominanceForrest(this.nyNaturtype.NiNCode)
                            ? <Xcomp.MultiselectArray
                                    label={labels.dominanceForrest}
                                    observableValue={[this.nyNaturtype, 'DominanceForrest']}
                                    codes={doms}
                                    forceSync
                                    formlayout/>
                            : null}
                        <Xcomp.StringEnum
                            label={labels.timeHorizon}
                            observableValue={[this.nyNaturtype, 'TimeHorizon']}
                            codes={koder.timeHorizon}
                            forceSync/>
                        <Xcomp.StringEnum
                            label={labels.colonizedArea}
                            observableValue={[this.nyNaturtype, 'ColonizedArea']}
                            codes={koder.colonizedArea}
                            forceSync/>
                        <Xcomp.MultiselectArray
                            label={labels.stateChange}
                            observableValue={[this.nyNaturtype, 'StateChange']}
                            codes={koder.tilstandsendringer}
                            forceSync
                            formlayout/>
                        <StringEnum2
                            label={labels.affectedArea}
                            observableValue={[this.nyNaturtype, 'AffectedArea']}
                            codes={koder.affectedArea}
                            forceSync
                            observableDisabled={[this, "hasStateChange"]}/>
                    </BsModal>
                : null}
        </div>
    }
}
