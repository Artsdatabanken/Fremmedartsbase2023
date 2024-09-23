import React from 'react';
import {autorun, extendObservable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import RedlistedNaturetypeSelector from './redlistedNaturetypeSelector';
import * as Xcomp from '../observableComponents';
import BsModal from '../../bootstrapModal'
import {StringEnum2} from './naturetypeModal'

class NewRedlistedNaturetype extends React.Component {
    constructor(props) {
        super()
        const {appState, addNaturtype} = props;
        extendObservable(this, {
            showModal: false,
            hasStateChange: false,
            naturtypeLabel: null,
            nyNaturtype: {
                RedlistedNatureTypeName: null,
                Category: null,
                TimeHorizon: null,
                ColonizedArea: null,
                StateChange: [],
                AffectedArea: null
            }
        })
        this.setSelectedNaturtype = (naturtypekode) => {
            const nnt = this.nyNaturtype
                nnt.RedlistedNatureTypeName = naturtypekode.name,
                nnt.Category = naturtypekode.category,
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
                if (appState.naturtypeLabels && this.nyNaturtype && this.nyNaturtype.niNCode) {
                    this.naturtypeLabel = appState.naturtypeLabels[this.nyNaturtype.niNCode]
                }
            })
            autorun(() => {
                const hasSC = this.nyNaturtype.stateChange.length > 0
                this.hasStateChange = hasSC
                if (!hasSC) {
                    this.nyNaturtype.AffectedArea = "0"
                }
            })
        }

        render() {
            const {appState, addNaturtype, labels} = this.props;
            const koder = appState.koder
            const ntLabels = labels.NatureTypes

            return <div>
                {/* {appState.language === "SV"
                ? <h3>Här kommer hotade/sällsynta naturtyper</h3> */}
                <div>
                    <h5>{ntLabels.chooseRedlistedNT}:</h5>
                    {appState.redlistedNaturetypeCodes && <RedlistedNaturetypeSelector
                        naturtyper={appState.redlistedNaturetypeCodes}
                        setSelected={this.setSelectedNaturtype}/>
                    }
                </div>
                {this.showModal && <BsModal
                    heading={
                        <div>
                            <h4>{this.nyNaturtype.RedlistedNatureTypeName}</h4> 
                            <b> {this.nyNaturtype.Category} </b>
                        </div >}
                    onCancel={this.hideModal}
                    onOk={this.onOk}
                    labels={labels.General}>
                    <Xcomp.StringEnum
                        label={ntLabels.timeHorizon}
                        observableValue={[this.nyNaturtype, 'TimeHorizon']}
                        codes={koder.timeHorizon}
                        forceSync/>
                    <Xcomp.StringEnum
                        label={ntLabels.colonizedArea}
                        observableValue={[this.nyNaturtype, 'ColonizedArea']}
                        codes={koder.colonizedArea}
                        forceSync/>
                    <Xcomp.MultiselectArray
                        label={ntLabels.stateChange}
                        labels={labels.General}
                        observableValue={[this.nyNaturtype, 'StateChange']}
                        codes={koder.tilstandsendringer}
                        forceSync
                        formlayout/>
                    <StringEnum2
                        label={ntLabels.affectedArea}
                        observableValue={[this.nyNaturtype, 'AffectedArea']}
                        codes={koder.affectedArea}
                        forceSync
                        observableDisabled={[this, "hasStateChange"]}/>
                </BsModal>
}
            </div>
        }
    }

export default observer(NewRedlistedNaturetype);
