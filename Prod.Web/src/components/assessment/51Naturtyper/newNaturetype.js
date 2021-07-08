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
        const {appState, addNaturtype} = props;
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
                Background: [],
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
            nnt.Background.clear()
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
        const {appState, addNaturtype, labels, codes, header} = this.props;        
        //const nts = appState.naturtyper
        const nts =  codes
        const lms = appState.livsmediumCodes
        const doms = appState.dominansSkog
        const koder = appState.koder
        console.log(nts)
        // console.log("labels " + JSON.stringify(labels))

        return <div className="natureType">
            {/* {appState.language === "SV"
            ? <h3>Här kommer SVEN</h3> */}
            <div>
                <h4>{header}</h4>
                {nts
                    ? <NaturtypeSelector 
                        naturtyper={nts} 
                        mode={"naturetype"} 
                        setSelected={this.setSelectedNaturtype}
                        />
                    : null}
            </div>
            {appState.livsmediumEnabled
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
                fabModel={appState}
                showModal={[this, "showModal"]}
                onOk={addNaturtype}
                appState={appState}
                labels={labels}/>
            : null}

        </div>
    }
}
