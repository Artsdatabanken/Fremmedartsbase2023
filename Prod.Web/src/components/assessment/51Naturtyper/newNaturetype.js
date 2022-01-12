import React from 'react';
import {autorun, extendObservable, observable, toJS, action, runInAction} from 'mobx';
import {observer, inject} from 'mobx-react';
import NaturtypeSelector from './naturtypeSelector';
import LivsmediumSelector from './livsmediumSelector';
import TruetSelector from './truetSelector';
import NaturtypeModal from './naturetypeModal';
import createTaxonSearch from '../../createTaxonSearch'
// import * as Xcomp from '../observableComponents';

const taxonSearchState = observable({
    id: "newNaturtypeTaxonSearch",
    scientificName: "",
    scientificNameId: "",
    scientificNameAuthor: "",
    vernacularName: "",
    taxonRank: "",
    taxonId: "",
    taxonSearchString: "",
    taxonSearchResult: [],
    domesticOrAbroad : "",
    redListCategory: "", 
    basisOfAssessment: []
})



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
                name: null,
                // dominanceForrest: [],                
                timeHorizon: null,
                colonizedArea: null,
                stateChange: [],
                background: [],
                affectedArea: null,
                // taxon: {
                //     id: "newNaturtypeNyNaturtypeTaxonSearch",
                //     scientificName: "",
                //     scientificNameId: "",
                //     scientificNameAuthor: "",
                //     vernacularName: "",
                //     taxonRank: "",
                //     taxonId: "",
                //     taxonSearchString: "",
                //     taxonSearchResult: [],
                //     domesticOrAbroad : "",
                //     redListCategory: "", 
                //     keyStoneSpecie : false, 
                //     effectLocalScale : false, 
                //     effect : "Weak",
                //     scale: "Limited",
                //     status: "NewAlien",
                //     interactionType : "CompetitionSpace", 
                //     //interactionType : [], 
                //     longDistanceEffect : false, 
                //     confirmedOrAssumed : false, 
                //     basisOfAssessment: [],
                //     interactionTypes: [],
                // }, 
            },
            // taxon: {
            //     id: "newNaturtypeTaxonSearch",
            //     scientificName: "",
            //     scientificNameId: "",
            //     scientificNameAuthor: "",
            //     vernacularName: "",
            //     taxonRank: "",
            //     taxonId: "",
            //     taxonSearchString: "",
            //     taxonSearchResult: [],
            //     domesticOrAbroad : "",
            //     redListCategory: "", 
            //     keyStoneSpecie : false, 
            //     effectLocalScale : false, 
            //     effect : "Weak",
            //     scale: "Limited",
            //     status: "NewAlien",
            //     interactionType : "Competition___###___Space", 
            //     //interactionType : [], 
            //     longDistanceEffect : false, 
            //     confirmedOrAssumed : false, 
            //     basisOfAssessment: [],
            //     interactionTypes: [],
            // }, 
        })


        createTaxonSearch(taxonSearchState, appState.evaluationContext, tax => tax.existsInCountry)
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
        // to determine if the modal pop-up will be for a nature type or for a habitat
        //console.log("newNaturetype nyNaturtype: " + JSON.stringify(Object.keys(this)))
        // console.log("newNaturetype nyNaturtype2: " + JSON.stringify(Object.keys(this.nyNaturtype)))
        // console.log("newNaturetype nyNaturtype2.1: " + JSON.stringify(this.nyNaturtype))
        //console.log("newNaturetype taxonSearchState: " + JSON.stringify(Object.keys(taxonSearchState)))

        const livsmedium = superheader === "Livsmedium"
        console.log("lms" + lms)


        return <div className="natureType">
            {/* {appState.language === "SV"
            ? <h3>Här kommer SVEN</h3> */}
            <div>
                <h4>{superheader}</h4>
                <p dangerouslySetInnerHTML={{ __html: header }}></p>
                {/* {this.props.children} */}
                {this.props.mode === "livsmedium" ?
                <LivsmediumSelector
                    naturtyper={appState.livsmediumCodes} 
                    nyNaturtype={this.nyNaturtype}                    
                    showModal={() => runInAction(() => this.showModal = true)}
                    // setSelected={() => console.log("setSelectedNaturtype")}
                    // setSelected={this.setSelectedNaturtype}
                /> :
                this.props.mode === "truet" ?
                <TruetSelector
                    naturtyper={appState.trueteogsjeldneCodes}
                    nyNaturtype={this.nyNaturtype}
                    showModal={() => runInAction(() => this.showModal = true)}
                    // setSelected={() => console.log("setSelectedNaturtype")}
                    // setSelected={this.setSelectedNaturtype}
                /> :
                this.props.mode === "nin" ?
                <NaturtypeSelector
                    naturtyper={appState.naturtyperNIN2} 
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
                //taxon = {this.nyNaturtype.taxon}
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
