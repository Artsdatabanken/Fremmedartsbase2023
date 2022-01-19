import React from 'react';
import {autorun, extendObservable, observable, toJS, action, runInAction} from 'mobx';
import {observer, inject} from 'mobx-react';
import NaturtypeSelector from './naturtypeSelector';
import LivsmediumSelector from './livsmediumSelector';
import TruetSelector from './truetSelector';
import NaturtypeModal from './naturetypeModal';
import createTaxonSearch, {createTaxonSearchState} from '../../createTaxonSearch'
// import * as Xcomp from '../observableComponents';

const taxonSearchState = createTaxonSearchState("newNaturtypeTaxonSearch")

@inject("appState")
@observer
export default class NewNaturetype extends React.Component {
    constructor(props) {
        super()
        const {appState, addNaturtype, hideStateChange} = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: hideStateChange,
            nyNaturtype: {
                niNCode: null,
                name: null,
                timeHorizon: null,
                colonizedArea: null,
                stateChange: [],
                background: [],
                affectedArea: null,
                taxon: null
            },
        })
        createTaxonSearch(taxonSearchState, appState.evaluationContext, tax => tax.existsInCountry)
    }

    render() {
        const {appState, addNaturtype, labels, codes, header, superheader, config} = this.props;        
        //const nts = appState.naturtyper
        const nts =  codes
        const lms = appState.livsmediumCodes
        const doms = appState.dominansSkog
        const koder = appState.koder
        const livsmedium = superheader === "Livsmedium"
        console.log("lms" + lms)

        return <div className="natureType">
            <div>
                <h4>{superheader}</h4>
                <p dangerouslySetInnerHTML={{ __html: header }}></p>
                {this.props.mode === "livsmedium" ?
                <LivsmediumSelector
                    naturtyper={appState.livsmediumCodes} 
                    nyNaturtype={this.nyNaturtype}                    
                    showModal={() => runInAction(() => this.showModal = true)}
                /> :
                this.props.mode === "truet" ?
                <TruetSelector
                    naturtyper={appState.trueteogsjeldneCodes}
                    nyNaturtype={this.nyNaturtype}
                    showModal={() => runInAction(() => this.showModal = true)}
                /> :
                this.props.mode === "nin" ?
                <NaturtypeSelector
                    naturtyper={appState.naturtyperNIN2} 
                    nyNaturtype={this.nyNaturtype}                    
                    showModal={() => runInAction(() => this.showModal = true)}
                /> :
                null
                }
            </div>
            {this.showModal
            ? <NaturtypeModal
                taxon = {taxonSearchState}
                hideStateChange={[this, "hideStateChange"]}
                naturtype={this.nyNaturtype}
                fabModel={appState}
                livsmedium={livsmedium}
                showModal={[this, "showModal"]}
                onOk={addNaturtype}
                appState={appState}
                labels={labels}/>
            : null}
        </div>
    }
}
