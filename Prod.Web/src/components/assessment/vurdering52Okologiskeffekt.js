import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import {action, autorun, autorunAsync, extendObservable, observable, toJS} from 'mobx';

import config from '../../config';
// import {loadData} from '../stores/apiService'; 
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'

import SpeciesSpeciesTable from './52Okologiskeffekt/SpeciesSpeciesTable'
import SpeciesNaturetypeTable from './52Okologiskeffekt/SpeciesNaturetypeTable'


import HostParasiteTable from './52Okologiskeffekt/HostParasiteTable'
import createTaxonSearch from './52Okologiskeffekt/createTaxonSearch'


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi 

@observer
export default class Vurdering52Okologiskeffekt extends React.Component {
    constructor(props) {
        super(props)
        const {riskAssessment, evaluationContext} = props
        extendObservable(this, {
            // showModal: false,
            newSSITS: {
                ScientificName: "",
                ScientificNameId: "",
                ScientificNameAuthor: "",
                VernacularName: "",
                TaxonRank: "",
                TaxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                DomesticOrAbroad : "",
                RedListCategory: "", 
                KeyStoneSpecie : false, 
                EffectLocalScale : false, 
                Effect : "Weak",
                InteractionType : "CompetitionSpace", 
                LongDistanceEffect : false, 
                ConfirmedOrAssumed : false, 
            }, 
            newGTD: {
                ScientificName: "",
                ScientificNameId: "",
                ScientificNameAuthor: "",
                VernacularName: "",
                TaxonRank: "",
                TaxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                DomesticOrAbroad : "",
                RedListCategory: "", 
                KeyStoneSpecie : false, 
                EffectLocalScale : false, 
                Effect : "Weak", 
                InteractionType : "", 
                LongDistanceEffect : false, 
                ConfirmedOrAssumed : false, 
            }, 
            newHPI: {
                ScientificName: "",
                ScientificNameId: "",
                ScientificNameAuthor: "",
                VernacularName: "",
                TaxonRank: "",
                TaxonId: "",
                taxonSearchString: "",
                taxonSearchResult: [],
                DomesticOrAbroad : "",
                RedListCategory: "", 
                KeyStoneSpecie : false, 
                EffectLocalScale : false, 
                ParasiteScientificName : "",
                ParasiteVernacularName : "",
                ParasiteEcoEffect : "1", 
                ParasiteNewForHost : false, 
                ParasiteIsAlien : false, 
                DiseaseConfirmedOrAssumed : false, 
            },
            newSNITS: {
                NiNCode: riskAssessment.vurderingAllImpactedNatureTypes.length > 0
                    ? riskAssessment.vurderingAllImpactedNatureTypes[0].NiNCode
                    : "",
                NiNVariation: [],
                naturetypes: riskAssessment.vurderingAllImpactedNatureTypes,
                RedListCategory: "", 
                DomesticOrAbroad : "",
                KeyStoneSpecie : false, 
                EffectLocalScale : false, 
                Effect : "Weak",
                InteractionType : "CompetitionSpace", 
                LongDistanceEffect : false, 
                ConfirmedOrAssumed : false
                // taxonSearchString: "",
                // taxonSearchResult: [], 
                // taxonSearchWaitingForResult: false - should not be observable
            } 
        })

        this.addSSITS = () => {
            const list = riskAssessment.SpeciesSpeciesInteractions //ThreatenedSpecies;
            const newItem = this.newSSITS;
            const clone = toJS(newItem);
            // console.log("Clone: " + JSON.stringify(clone))
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            list.push(clone)
            newItem.ScientificName = ""
            newItem.ScientificNameId = ""
            newItem.ScientificNameAuthor = ""
            newItem.VernacularName = ""
            newItem.TaxonRank = ""
            newItem.TaxonId = ""
            newItem.RedListCategory = "" 
            newItem.KeyStoneSpecie = false
            newItem.InteractionType = "CompetitionSpace" 
            newItem.Effect = "Weak" 
            newItem.EffectLocalScale = false 
            newItem.LongDistanceEffect = false 
            newItem.ConfirmedOrAssumed = false
            newItem.DomesticOrAbroad = ""
            newItem.taxonSearchString = ""
            newItem.taxonSearchResult.replace([])
            newItem.taxonSearchWaitingForResult = false
        }
        this.addSNITS = () => {
            const list = riskAssessment.SpeciesNaturetypeInteractions //ThreatenedSpecies;
            const newItem = this.newSNITS;
            const clone = toJS(newItem);
            // console.log("Clone: " + JSON.stringify(clone))
            // clone.taxonSearchString = undefined
            // clone.taxonSearchResult = undefined
            list.push(clone)
//            newItem.NiNCode = "",  Dropdown inneholder fortsatt samme naturtype - beholder derfor koden
            newItem.NiNVariation.clear(),

            newItem.RedListCategory = "" 
            newItem.KeyStoneSpecie = false
            newItem.InteractionType = "CompetitionSpace" 
            newItem.Effect = "Weak" 
            newItem.EffectLocalScale = false 
            newItem.LongDistanceEffect = false 
            newItem.ConfirmedOrAssumed = false
            newItem.DomesticOrAbroad = ""
            newItem.taxonSearchString = ""

            // newItem.taxonSearchResult.replace([])
            // newItem.taxonSearchWaitingForResult = false
        }
        this.addGTD = () => {
            const list = riskAssessment.GeneticTransferDocumented;
            const newItem = this.newGTD;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined
            list.push(clone)
            newItem.ScientificName = ""
            newItem.ScientificNameId = ""
            newItem.ScientificNameAuthor = ""
            newItem.VernacularName = ""
            newItem.TaxonRank = ""
            newItem.TaxonId = ""
            newItem.RedListCategory = "" 
            newItem.KeyStoneSpecie = false
            newItem.InteractionType = ""
            newItem.Effect = "Weak" 
            newItem.EffectLocalScale = false 


            newItem.LongDistanceEffect = false
            newItem.ConfirmedOrAssumed = false
            newItem.DomesticOrAbroad = "" 
            newItem.taxonSearchString = ""
            newItem.taxonSearchResult.replace([])
            newItem.taxonSearchWaitingForResult = false
        }
        this.addHPI = () => {
            const list = riskAssessment.HostParasiteInformations;
            const newItem = this.newHPI;
            const clone = toJS(newItem);
            clone.taxonSearchString = undefined
            clone.taxonSearchResult = undefined

// console.log("addHPI: " + JSON.stringify(clone))

            list.push(clone)
            newItem.ScientificName = ""
            newItem.ScientificNameId = ""
            newItem.ScientificNameAuthor = ""
            newItem.VernacularName = ""
            newItem.TaxonRank = ""
            newItem.TaxonId = ""
            newItem.RedListCategory = "" 
            newItem.KeyStoneSpecie = false
            newItem.ParasiteScientificName = "" 
            newItem.ParasiteVernacularName = "" 
            newItem.ParasiteEcoEffect = "1"
            newItem.EffectLocalScale = false 
            newItem.ParasiteNewForHost = false 
            newItem.ParasiteIsAlien = false 
            newItem.NewHost = false
            newItem.DiseaseConfirmedOrAssumed = false 
            newItem.DomesticOrAbroad = "" 
            newItem.taxonSearchString = ""
            newItem.taxonSearchResult.replace([])
            newItem.taxonSearchWaitingForResult = false
        }

        createTaxonSearch(this.newSSITS, evaluationContext, tax => !!tax.rlCategory && tax.existsInCountry)
        // createTaxonSearch(this.newSSIDS, "N")
        createTaxonSearch(this.newGTD, evaluationContext, tax => tax.existsInCountry)

        createTaxonSearch(this.newHPI, evaluationContext, tax => tax.existsInCountry)


    }

    render() {
        const {riskAssessment, viewModel, fabModel, evaluationContext} = this.props;
        const labels = fabModel.kodeLabels
        const nbsp = "\u00a0"
        const crit52D = getCriterion(riskAssessment, 1 , "D")
        const crit52E = getCriterion(riskAssessment, 1 , "E")
        const crit52F = getCriterion(riskAssessment, 1 , "F")
        const crit52G = getCriterion(riskAssessment, 1 , "G")
        const crit52H = getCriterion(riskAssessment, 1 , "H")
        const crit52I = getCriterion(riskAssessment, 1 , "I")
        
        return(
            <div>
                {config.showPageHeaders ? <h3>Økologisk effekt</h3> : <br />}
                <fieldset className="well">
                    <h4>{labels.DEcrit.heading}</h4>
                    <SpeciesSpeciesTable list={riskAssessment.SpeciesSpeciesInteractions} newItem={this.newSSITS} addNewItem={this.addSSITS} koder={fabModel.koder} labels={labels} showRedlist showKeyStoneSpecie showEffect showInteractionType showConfirmedOrAssumed/>
                    <Xcomp.HtmlString observableValue={[riskAssessment, 'SpeciesSpeciesInteractionsSupplementaryInformation']} label="Utfyllende informasjon" />
                    <hr />
                    <br />
                    <SpeciesNaturetypeTable list={riskAssessment.SpeciesNaturetypeInteractions} newItem={this.newSNITS} addNewItem={this.addSNITS}  koder={fabModel.koder} labels={labels} naturtypeLabels={fabModel.naturtypeLabels} />

                    <hr/>
                    <Criterion criterion={crit52D} />
                    <hr/>
                    <Criterion criterion={crit52E} />
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={crit52F} />
                </fieldset>
                <fieldset className="well">
                    <Criterion criterion={crit52G} />
                </fieldset>
                <fieldset className="well">
                    <h4>{crit52H.heading}</h4>
                    <p>{crit52H.info}</p>
                    <SpeciesSpeciesTable list={riskAssessment.GeneticTransferDocumented} newItem={this.newGTD} addNewItem={this.addGTD} koder={fabModel.koder} labels={labels} showKeyStoneSpecie showConfirmedOrAssumed />
                    <hr/>
                    {crit52H.majorUncertainty ?
                    <div>
                        <span>Beskrivelse</span>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'GeneticTransferDomesticDescription']} />
                    </div> : 
                    null}
                    <Criterion criterion={crit52H} mode="noheading"/>
                    {/*<p>HGeneticTransferLevel: {riskAssessment.HGeneticTransferLevel}</p>*/}
                </fieldset>
                <fieldset className="well">
                    <h4>{crit52I.heading} </h4>
                    <p>{crit52I.info}</p>
                    <HostParasiteTable list={riskAssessment.HostParasiteInformations} newItem={this.newHPI} addNewItem={this.addHPI} koder={fabModel.koder} labels={labels} showKeyStoneSpecie />
                    <hr/>
                    {crit52I.majorUncertainty ?
                    <div>
                        <span>Beskrivelse</span>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'VectorBiologicalDiseaseSpreadingDomesticDescription']} />
                    </div> : 
                    null }
                    <Criterion criterion={crit52I} mode="noheading"/>
                </fieldset>
            </div>
        );


                }
                }

                Vurdering52Okologiskeffekt.propTypes = {
                    viewModel: PropTypes.object.isRequired,
                    riskAssessment: PropTypes.object.isRequired
                }


