import React from 'react';
import {autorun, extendObservable, observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import NaturtypeSelector from './naturtypeSelector';
import NaturtypeModal from './naturetypeModal';
// import * as Xcomp from '../observableComponents';

@observer
export default class NewNaturetype extends React.Component {
    constructor(props) {
        super()
        const {fabModel, addNaturtype} = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: false,
            // hasStateChange: false,
            // naturtypeLabel: null,
            nyNaturtype: {
                NiNCode: null,
                DominanceForrest: [],
                TimeHorizon: null,
                ColonizedArea: null,
                StateChange: [],
                AffectedArea: null
            }
        })



        this.setSelectedNT = (naturtypekode) => {
            const nnt = this.nyNaturtype
            // console.log("Nincode: " + naturtypekode)
            nnt.NiNCode = naturtypekode
            nnt.DominanceForrest.clear()
            nnt.TimeHorizon = null
            nnt.ColonizedArea = null
            nnt.StateChange.clear()
            nnt.AffectedArea = null
            this.showModal = true
        }

        this.setSelectedNaturtype = (naturtypekode) => {
            this.hideStateChange = false;
            this.setSelectedNT(naturtypekode)
        }
        this.setSelectedLivsmedium = (naturtypekode) => {
            this.hideStateChange = true;
            this.setSelectedNT(naturtypekode)
        }


        // this.onOk = (obj) => {
        //     addNaturtype(obj)
        // }
    }

    render() {
        const {fabModel, addNaturtype, labels} = this.props;
        const nts = fabModel.naturtyper
        const lms = fabModel.livsmediumCodes
        const doms = fabModel.dominansSkog
        const koder = fabModel.koder

        // console.log("labels " + JSON.stringify(labels))

        return <div>
            {/* {fabModel.language === "SV"
            ? <h3>Här kommer SVEN</h3> */}
            <div>
                <h4>{labels.NatureTypes.chooseNT}:</h4>
                {nts
                    ? <NaturtypeSelector naturtyper={nts} mode={"naturetype"} setSelected={this.setSelectedNaturtype}/>
                    : null}
            </div>
            {fabModel.livsmediumEnabled
                ? <div>
                    <br />
                    <h4>{labels.NatureTypes.chooseLM}:</h4>
                    {lms
                        ? <NaturtypeSelector
                            naturtyper={lms}
                            mode={"livsmedium"}
                            setSelected={this.setSelectedLivsmedium}/>
                        : null}
                </div>
                : null}
            {this.showModal
            ? <NaturtypeModal
                hideStateChange={[this, "hideStateChange"]}
                naturtype={this.nyNaturtype}
                showModal={[this, "showModal"]}
                onOk={addNaturtype}
                fabModel={fabModel}
                labels={labels}/>
            : null}

        </div>
    }
}
