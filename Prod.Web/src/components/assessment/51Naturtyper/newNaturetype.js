import React from 'react';
import {autorun, extendObservable, observable, toJS, action, runInAction} from 'mobx';
import {observer, inject} from 'mobx-react';
import NaturtypeSelector from './naturtypeSelector';
import LivsmediumSelector from './livsmediumSelector';
import NaturtypeModal from './naturetypeModal';
// import * as Xcomp from '../observableComponents';
@inject("appState")
@observer
export default class NewNaturetype extends React.Component {
    constructor(props) {
        super()
        const {appState, addNaturtype, hideStateChange} = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: hideStateChange,
            // hasStateChange: false,
            // naturtypeLabel: null,
            nyNaturtype: {
                niNCode: null,
                // dominanceForrest: [],
                timeHorizon: null,
                colonizedArea: null,
                stateChange: [],
                background: [],
                affectedArea: null
            }
        })



        // this.setSelectedNT = action ((naturtypekode) => {
        //     console.log("Nincode: " + naturtypekode)
        //     const nnt = this.nyNaturtype
        //     nnt.niNCode = naturtypekode
        //     // nnt.dominanceForrest.clear()
        //     nnt.timeHorizon = null
        //     nnt.colonizedArea = null
        //     // nnt.stateChange.clear()
        //     nnt.affectedArea = null
        //     // nnt.background.clear()
        //     this.showModal = true
        // })

        // this.setSelectedNaturtype = action((naturtypekode) => {
        //     // this.hideStateChange = false;
        //     this.setSelectedNT(naturtypekode)
        // })
        // this.setSelectedLivsmedium = action((naturtypekode) => {
        //     // this.hideStateChange = true;
        //     this.setSelectedNT(naturtypekode)
        // })


        // this.onOk = (obj) => {
        //     addNaturtype(obj)
        // }
    }

    render() {
        const {appState, addNaturtype, labels, codes, header, superheader, config} = this.props;        
        //const nts = appState.naturtyper
        const nts =  codes
        const lms = appState.livsmediumCodes
        const doms = appState.dominansSkog
        const koder = appState.koder
        // console.log("NTS: " + JSON.stringify(nts, undefined, 2))
        // console.log("labels " + JSON.stringify(labels))

        console.log("lms" + lms)


        return <div className="natureType">
            {/* {appState.language === "SV"
            ? <h3>Här kommer SVEN</h3> */}
            <div>
                <h4>{superheader}</h4>
                <p>{header}</p>
                {/* {this.props.children} */}
                {this.props.mode === "livsmedium" ?
                    <LivsmediumSelector
                        naturtyper={appState.livsmediumCodes} 
                        nyNaturtype={this.nyNaturtype}
                        showModal={() => runInAction(() => this.showModal = true)}
                        // setSelected={() => console.log("setSelectedNaturtype")}
                        // setSelected={this.setSelectedNaturtype}
                    /> :
                    null
                }



                {/* {nts
                    ? <NaturtypeSelector 
                        naturtyper={nts} 
                        config={config}
                        mode={"naturetype"} 
                        setSelected={this.setSelectedNaturtype}
                        />
                    : null} */}
            </div>
            {/* {appState.livsmediumEnabled
                ? <div>
                    <br />
                    <p>{labels.NatureTypes.chooseLM}:</p>
                    {lms
                        ? <NaturtypeSelector
                            naturtyper={lms}
                            mode={"livsmedium"}
                            setSelected={this.setSelectedLivsmedium}/>
                        : null}
                </div>
                : null} */}
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
