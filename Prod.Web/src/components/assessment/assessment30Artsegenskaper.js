import React from 'react';
// import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
// import RadioGroup from './radioGroup'
import config from '../../config';
import * as Xcomp from './observableComponents';
import UploadPicturesButton from './30Artsegenskaper/uploadPicturesButton'
import OriginTable from './30Artsegenskaper/originTable'
//import ArrivedCountryFrom from './30Artsegenskaper/arrivedCountryFrom'
import ArrivedCountryFrom from './arrivedCountryFrom'

@inject("appState")
@observer
export default class Assessment30Artsegenskaper extends React.Component {
    constructor(props) {
        super(props)
    }
    setNaturalOriginsAllUnknown(vurdering) {
        const unknown = vurdering.naturalOrigins.find(row => row.climateZone == "unknown;")
        unknown.europe = true
        unknown.asia = true
        unknown.africa = true
        unknown.oceania = true
        unknown.northAndCentralAmerica = true
        unknown.southAmerica = true
    }
    setCurrentInternationalExistenceAreasAllUnknown(vurdering) {
        const unknown = vurdering.currentInternationalExistenceAreas.find(row => row.climateZone == "unknown;")
        unknown.europe = true
        unknown.asia = true
        unknown.africa = true
        unknown.oceania = true
        unknown.northAndCentralAmerica = true
        unknown.southAmerica = true
    }
    transferNaturalOriginsToCurrentInternationalExistenceAreas(vurdering) {
        const origins=vurdering.naturalOrigins
        const destinations=vurdering.currentInternationalExistenceAreas
        for(let n = 0; n < origins.length; n++) {
            const origin = origins[n]
            const dest = destinations[n]
            // for (let key of Object.keys(origin))
            for (const key in origin) {
                if (key != "climateZone" && origin[key]) {
                    dest[key] = true
                }
            }
        }
    }
    render() {
        const {appState:{assessment}, appState} = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels
        const koder = appState.koder
        //console.log(assessment.naturalOrigins)

        // const {vurdering, viewModel, fabModel} = this.props;
        const nbsp = "\u00a0"
        // const labels = config.labels
        // const labels = fabModel.codeLabels
        // const isMarine = vurdering.Marine && !vurdering.Terrestrial && !vurdering.Limnic
        const isMarine = vurdering.marine || vurdering.brackishWater
        const isLimnic = vurdering.limnic && !vurdering.terrestrial && !vurdering.marine  && !vurdering.brackishWater
        const isLimnicTerrestrial = vurdering.terrestrial || vurdering.limnic
        const limnicTerrestrialMarinelabel = (id) => koder.limnicTerrestrialMarine.find(code => code.Value === id).Text
        const climateZoneLabel = (id) => koder.naturalOriginClimateZone.find(code => code.Value === id).Text
        const subClimateZoneLabel = (id) => koder.naturalOriginSubClimateZone.find(code => code.Value === id).Text
        const naturalOriginDisabled = (id, region) => koder.naturalOriginDisabled.find(code => code.Value === id).Text.indexOf(region) !== -1

        return(
            <>
            <fieldset className="well">

                <h2>{labels.NaturalOrigin.globalPrevalence}</h2>
                {config.showPageHeaders ? <h3>Artsegenskaper</h3> : null }
                
                {appState.imageUploadEnabled
                ? <div>
                    <UploadPicturesButton scientificName={vurdering.evaluatedScientificName}/>
                    
                </div>
                : null}
                {assessment.alienSpeciesCategory == "DoorKnocker" && assessment.speciesStatus == "A" ?

                <div>
                    <p>{labels.NaturalOrigin.habitat}</p>
                    <Xcomp.Bool observableValue={[vurdering, 'limnic']} label={limnicTerrestrialMarinelabel("limnic")} />            
                    <Xcomp.Bool observableValue={[vurdering, 'terrestrial']} label={limnicTerrestrialMarinelabel("terrestrial")} />            
                    <Xcomp.Bool observableValue={[vurdering, 'marine']} label={limnicTerrestrialMarinelabel("marine")} />     
                    <Xcomp.Bool observableValue={[vurdering, 'brackishWater']} label={limnicTerrestrialMarinelabel("brackishWater")} />         
                    {/*appState.showBrackishWater
                    ? <Xcomp.Bool observableValue={[vurdering, 'brackishWater']} label={limnicTerrestrialMarinelabel("brackishWater")} />            
                    : null*/}
                    {
                    isLimnicTerrestrial ?
                    //vurdering.limnic || vurdering.terrestrial ?
                    <div>
                        <br/>
                        <div className="well">
                        <h4><b>{labels.NaturalOrigin.naturalOrigin}</b></h4>
                        <OriginTable 
                            origins={vurdering.naturalOrigins} 
                            climateZoneLabel={climateZoneLabel}
                            subClimateZoneLabel={subClimateZoneLabel}
                            naturalOriginDisabled={naturalOriginDisabled}
                            labels={labels.NaturalOrigin}
                        />
                        <Xcomp.Button 
                            primary 
                            onClick={() => this.transferNaturalOriginsToCurrentInternationalExistenceAreas(vurdering)} 
                            className="pull-right"
                            >{labels.NaturalOrigin.transfer}</Xcomp.Button>
                        <Xcomp.Button 
                            primary 
                            onClick={() => this.setNaturalOriginsAllUnknown(vurdering)} 
                            className="pull-left"
                            >{labels.NaturalOrigin.noKnown}</Xcomp.Button>
                        <br />
                        <br />
                        { assessment.naturalOrigins.filter(
                                row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                            ).length > 0 ?
                            <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginUnknownDocumentation']} label={labels.NaturalOrigin.describe} /> :
                            null}
                        </div>
                        <div className="well">
                        <h4><b>{labels.NaturalOrigin.currentExistenceAria}</b></h4>
                        <OriginTable 
                            origins={vurdering.currentInternationalExistenceAreas} 
                            climateZoneLabel={climateZoneLabel}
                            subClimateZoneLabel={subClimateZoneLabel}
                            naturalOriginDisabled={naturalOriginDisabled}
                            labels={labels.NaturalOrigin}
                        />
                        <Xcomp.Button 
                            primary 
                            onClick={() => this.setCurrentInternationalExistenceAreasAllUnknown(vurdering)} 
                            className="pull-left"
                            >{labels.NaturalOrigin.noKnown}</Xcomp.Button>
                        <br />
                        <br />
                        { vurdering.currentInternationalExistenceAreas.filter(
                                row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                            ).length > 0 ?
                            <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceAreasUnknownDocumentation']} label={labels.NaturalOrigin.describe} /> :
                            null}
                        </div>
                    </div> :
                    null}
                    {isLimnic ?
                    <div>
                        <Xcomp.Bool observableValue={[vurdering, 'survivalBelow5c']} label={labels.NaturalOrigin.survivalBelow5c}/>
                        <hr/>
                    </div> :
                    null }
                    {isMarine ?
                    <div>
                        <div className="well">
                            <h4><b>{labels.NaturalOrigin.naturalOrigin}</b></h4>
                            <Xcomp.MultiselectArray observableValue={[vurdering, 'naturalOriginMarine']} codes={koder.naturalOriginMarine} labels={labels.General} />
                            <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginMarineDetails']} label={labels.NaturalOrigin.describeMarine} /> 
                        </div>
                        <div className="well">
                            <h4><b>{labels.NaturalOrigin.currentExistenceAria}</b></h4>
                            <Xcomp.MultiselectArray observableValue={[vurdering, 'currentInternationalExistenceMarineAreas']} codes={koder.naturalOriginMarine} labels={labels.General}/>
                            <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceMarineAreasDetails']} label={labels.NaturalOrigin.describeMarine} /> 
                        </div> 
                    </div>:
                    null }                
               <div className="well">
                    <h4>{labels.Reproduction.reproduction}</h4>
                    <Xcomp.Bool label={labels.Reproduction.sexual} observableValue={[vurdering, 'reproductionSexual']}/>
                    <Xcomp.Bool label={labels.Reproduction.asexual} observableValue={[vurdering, 'reproductionAsexual']}/>
                    <Xcomp.Number label={labels.Reproduction.generationTime} observableValue={[vurdering, 'reproductionGenerationTime']}/>
                </div>
                {appState.otherEffectsEnabled 
                ? <div className="well">
                        <Xcomp.Button 
                            primary 
                            xs
                            className="pull-right"
                            onClick={() => {
                                vurdering.healthEffects = labels.OtherEffects.noKnownValue
                                vurdering.economicEffects = labels.OtherEffects.noKnownValue
                                vurdering.positiveEcologicalEffects = labels.OtherEffects.noKnownValue
                                vurdering.effectsOnPopulationOfOrigin = labels.OtherEffects.noKnownValue
                            }}
                        >{labels.OtherEffects.fillNoKnown} "{labels.OtherEffects.noKnownValue}"</Xcomp.Button>
                    <h4>{labels.OtherEffects.otherEffects}</h4>
                    <Xcomp.String label={labels.OtherEffects.healthEffects} observableValue={[vurdering, 'healthEffects']}/>
                    <Xcomp.String label={labels.OtherEffects.economicEffects} observableValue={[vurdering, 'economicEffects']}/>
                    <label>{labels.OtherEffects.ecosystemEffects}</label>
                    <div className="intent30">
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoBasic} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsBasicLifeProcesses']} codes={koder.ecosystemServiceEffectsBasicLifeProcesses}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoSupport} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsProvisioningServices']} codes={koder.ecosystemServiceEffectsSupportingServices}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoRegulating} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsRegulatingServices']} codes={koder.ecosystemServiceEffectsRegulatingServices}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoKnowledge} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsHumanSpiritualServices']} codes={koder.ecosystemServiceEffectsHumanMindServices}/>
                    </div>
                    <Xcomp.String label={labels.OtherEffects.positiveEffects} observableValue={[vurdering, 'positiveEcologicalEffects']}/>
                    <Xcomp.String label={labels.OtherEffects.effectsOnPopulationOfOrigin} observableValue={[vurdering, 'effectsOnPopulationOfOrigin']}/>
                </div>
                : null}
                </div>
                 : assessment.isRegionallyAlien == true ? 

                 <div>
                     <p>{labels.NaturalOrigin.habitat}</p>
                <Xcomp.Bool observableValue={[vurdering, 'limnic']} label={limnicTerrestrialMarinelabel("limnic")} />            
                <Xcomp.Bool observableValue={[vurdering, 'terrestrial']} label={limnicTerrestrialMarinelabel("terrestrial")} />            
                <Xcomp.Bool observableValue={[vurdering, 'marine']} label={limnicTerrestrialMarinelabel("marine")} />     
                <Xcomp.Bool observableValue={[vurdering, 'brackishWater']} label={limnicTerrestrialMarinelabel("brackishWater")} />         
                {/*appState.showBrackishWater
                ? <Xcomp.Bool observableValue={[vurdering, 'brackishWater']} label={limnicTerrestrialMarinelabel("brackishWater")} />            
                : null*/}
                {
                isLimnicTerrestrial ?
                //vurdering.limnic || vurdering.terrestrial ?
                <div>
                    <br/>
                    <div className="well">
                    <h4><b>{labels.NaturalOrigin.naturalOrigin}</b></h4>
                    <OriginTable 
                        origins={vurdering.naturalOrigins} 
                        climateZoneLabel={climateZoneLabel}
                        subClimateZoneLabel={subClimateZoneLabel}
                        naturalOriginDisabled={naturalOriginDisabled}
                        labels={labels.NaturalOrigin}
                    />
                    <Xcomp.Button 
                        primary 
                        onClick={() => this.transferNaturalOriginsToCurrentInternationalExistenceAreas(vurdering)} 
                        className="pull-right"
                        >{labels.NaturalOrigin.transfer}</Xcomp.Button>
                    <Xcomp.Button 
                        primary 
                        onClick={() => this.setNaturalOriginsAllUnknown(vurdering)} 
                        className="pull-left"
                        >{labels.NaturalOrigin.noKnown}</Xcomp.Button>
                    <br />
                    <br />
                    { vurdering.naturalOrigins.filter(
                            row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                        ).length > 0 ?
                        <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginUnknownDocumentation']} label={labels.NaturalOrigin.describe} /> :
                        null}
                    </div>
                    <div className="well">
                    <h4><b>{labels.NaturalOrigin.currentExistenceAria}</b></h4>
                    <OriginTable 
                        origins={vurdering.currentInternationalExistenceAreas} 
                        climateZoneLabel={climateZoneLabel}
                        subClimateZoneLabel={subClimateZoneLabel}
                        naturalOriginDisabled={naturalOriginDisabled}
                        labels={labels.NaturalOrigin}
                    />
                    <Xcomp.Button 
                        primary 
                        onClick={() => this.setCurrentInternationalExistenceAreasAllUnknown(vurdering)} 
                        className="pull-left"
                        >{labels.NaturalOrigin.noKnown}</Xcomp.Button>
                    <br />
                    <br />
                    { vurdering.currentInternationalExistenceAreas.filter(
                            row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                        ).length > 0 ?
                        <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceAreasUnknownDocumentation']} label={labels.NaturalOrigin.describe} /> :
                        null}
                    </div>
                </div> :
                null}
                {isLimnic ?
                <div>
                    <Xcomp.Bool observableValue={[vurdering, 'survivalBelow5c']} label={labels.NaturalOrigin.survivalBelow5c}/>
                    <hr/>
                </div> :
                null }
                {isMarine ?
                <div>
                    <div className="well">
                        <h4><b>{labels.NaturalOrigin.naturalOrigin}</b></h4>
                        <Xcomp.MultiselectArray observableValue={[vurdering, 'naturalOriginMarine']} codes={koder.naturalOriginMarine} labels={labels.General} />
                        <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginMarineDetails']} label={labels.NaturalOrigin.describeMarine} /> 
                    </div>
                    <div className="well">
                        <h4><b>{labels.NaturalOrigin.currentExistenceAria}</b></h4>
                        <Xcomp.MultiselectArray observableValue={[vurdering, 'currentInternationalExistenceMarineAreas']} codes={koder.naturalOriginMarine} labels={labels.General}/>
                        <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceMarineAreasDetails']} label={labels.NaturalOrigin.describeMarine} /> 
                    </div> 
                </div>:
                null }
                <div className="well">
                    <div>
                        <h4>{labels.NaturalOrigin.arrivedCountry} {" vurderingsområdet "} {labels.NaturalOrigin.arrivedCountryFrom}</h4>
                        {/* <ArrivedCountryFrom vurdering={vurdering} fabModel={fabModel} /> */}
                        <ArrivedCountryFrom assessment={assessment} appState={appState} />
                    </div>
                    <label>{labels.NaturalOrigin.arrivedCountryFromDetails}</label>
                    <Xcomp.HtmlString observableValue={[vurdering, 'arrivedCountryFromDetails']} /> {/* earlier named: 'NaturalOrigin' */}
                </div>
               <div className="well">
                    <h4>{labels.Reproduction.reproduction}</h4>
                    <Xcomp.Bool label={labels.Reproduction.sexual} observableValue={[vurdering, 'reproductionSexual']}/>
                    <Xcomp.Bool label={labels.Reproduction.asexual} observableValue={[vurdering, 'reproductionAsexual']}/>
                    <Xcomp.Number label={labels.Reproduction.generationTime} observableValue={[vurdering, 'reproductionGenerationTime']}/>
                </div>
                {appState.otherEffectsEnabled 
                ? <div className="well">
                        <Xcomp.Button 
                            primary 
                            xs
                            className="pull-right"
                            onClick={() => {
                                vurdering.healthEffects = labels.OtherEffects.noKnownValue
                                vurdering.economicEffects = labels.OtherEffects.noKnownValue
                                vurdering.positiveEcologicalEffects = labels.OtherEffects.noKnownValue
                                vurdering.effectsOnPopulationOfOrigin = labels.OtherEffects.noKnownValue
                            }}
                        >{labels.OtherEffects.fillNoKnown} "{labels.OtherEffects.noKnownValue}"</Xcomp.Button>
                    <h4>{labels.OtherEffects.otherEffects}</h4>
                    <Xcomp.String label={labels.OtherEffects.healthEffects} observableValue={[vurdering, 'healthEffects']}/>
                    <Xcomp.String label={labels.OtherEffects.economicEffects} observableValue={[vurdering, 'economicEffects']}/>
                    <label>{labels.OtherEffects.ecosystemEffects}</label>
                    <div className="intent30">
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoBasic} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsBasicLifeProcesses']} codes={koder.ecosystemServiceEffectsBasicLifeProcesses}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoSupport} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsProvisioningServices']} codes={koder.ecosystemServiceEffectsSupportingServices}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoRegulating} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsRegulatingServices']} codes={koder.ecosystemServiceEffectsRegulatingServices}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoKnowledge} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsHumanSpiritualServices']} codes={koder.ecosystemServiceEffectsHumanMindServices}/>
                    </div>
                    <Xcomp.String label={labels.OtherEffects.positiveEffects} observableValue={[vurdering, 'positiveEcologicalEffects']}/>
                    <Xcomp.String label={labels.OtherEffects.effectsOnPopulationOfOrigin} observableValue={[vurdering, 'effectsOnPopulationOfOrigin']}/>
                </div>
                : null}
                 </div> :
                 
                 <div>
                     <p>{labels.NaturalOrigin.habitat}</p>
                <Xcomp.Bool observableValue={[vurdering, 'limnic']} label={limnicTerrestrialMarinelabel("limnic")} />            
                <Xcomp.Bool observableValue={[vurdering, 'terrestrial']} label={limnicTerrestrialMarinelabel("terrestrial")} />            
                <Xcomp.Bool observableValue={[vurdering, 'marine']} label={limnicTerrestrialMarinelabel("marine")} />     
                <Xcomp.Bool observableValue={[vurdering, 'brackishWater']} label={limnicTerrestrialMarinelabel("brackishWater")} />         
                {/*appState.showBrackishWater
                ? <Xcomp.Bool observableValue={[vurdering, 'brackishWater']} label={limnicTerrestrialMarinelabel("brackishWater")} />            
                : null*/}
                {
                isLimnicTerrestrial ?
                //vurdering.limnic || vurdering.terrestrial ?
                <div>
                    <br/>
                    <div className="well">
                    <h4><b>{labels.NaturalOrigin.naturalOrigin}</b></h4>
                    <OriginTable 
                        origins={vurdering.naturalOrigins} 
                        climateZoneLabel={climateZoneLabel}
                        subClimateZoneLabel={subClimateZoneLabel}
                        naturalOriginDisabled={naturalOriginDisabled}
                        labels={labels.NaturalOrigin}
                    />
                    <Xcomp.Button 
                        primary 
                        onClick={() => this.transferNaturalOriginsToCurrentInternationalExistenceAreas(vurdering)} 
                        className="pull-right"
                        >{labels.NaturalOrigin.transfer}</Xcomp.Button>
                    <Xcomp.Button 
                        primary 
                        onClick={() => this.setNaturalOriginsAllUnknown(vurdering)} 
                        className="pull-left"
                        >{labels.NaturalOrigin.noKnown}</Xcomp.Button>
                    <br />
                    <br />
                    { vurdering.naturalOrigins.filter(
                            row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                        ).length > 0 ?
                        <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginUnknownDocumentation']} label={labels.NaturalOrigin.describe} /> :
                        null}
                    </div>
                    <div className="well">
                    <h4><b>{labels.NaturalOrigin.currentExistenceAria}</b></h4>
                    <OriginTable 
                        origins={vurdering.currentInternationalExistenceAreas} 
                        climateZoneLabel={climateZoneLabel}
                        subClimateZoneLabel={subClimateZoneLabel}
                        naturalOriginDisabled={naturalOriginDisabled}
                        labels={labels.NaturalOrigin}
                    />
                    <Xcomp.Button 
                        primary 
                        onClick={() => this.setCurrentInternationalExistenceAreasAllUnknown(vurdering)} 
                        className="pull-left"
                        >{labels.NaturalOrigin.noKnown}</Xcomp.Button>
                    <br />
                    <br />
                    { vurdering.currentInternationalExistenceAreas.filter(
                            row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                        ).length > 0 ?
                        <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceAreasUnknownDocumentation']} label={labels.NaturalOrigin.describe} /> :
                        null}
                    </div>
                </div> :
                null}
                {isLimnic ?
                <div>
                    <Xcomp.Bool observableValue={[vurdering, 'survivalBelow5c']} label={labels.NaturalOrigin.survivalBelow5c}/>
                    <hr/>
                </div> :
                null }
                {isMarine ?
                <div>
                    <div className="well">
                        <h4><b>{labels.NaturalOrigin.naturalOrigin}</b></h4>
                        <Xcomp.MultiselectArray observableValue={[vurdering, 'naturalOriginMarine']} codes={koder.naturalOriginMarine} labels={labels.General} />
                        <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginMarineDetails']} label={labels.NaturalOrigin.describeMarine} /> 
                    </div>
                    <div className="well">
                        <h4><b>{labels.NaturalOrigin.currentExistenceAria}</b></h4>
                        <Xcomp.MultiselectArray observableValue={[vurdering, 'currentInternationalExistenceMarineAreas']} codes={koder.naturalOriginMarine} labels={labels.General}/>
                        <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceMarineAreasDetails']} label={labels.NaturalOrigin.describeMarine} /> 
                    </div> 
                </div>:
                null }                
                
                 </div>
                }                
            </fieldset>

            <fieldset className="well">
                <div>
                    <h4>{labels.NaturalOrigin.arrivedCountry}  {vurdering.expertGroup.indexOf("Svalbard") > -1 ? "Svalbard" : "Fastlands-Norge"} {labels.NaturalOrigin.arrivedCountryFrom}</h4>
                    {/* <ArrivedCountryFrom vurdering={vurdering} fabModel={fabModel} /> */}
                        <ArrivedCountryFrom assessment={assessment} appState={appState}/>
                    </div>
                <label>{labels.NaturalOrigin.arrivedCountryFromDetails}</label>
                <Xcomp.HtmlString observableValue={[vurdering, 'arrivedCountryFromDetails']} /> {/* earlier named: 'NaturalOrigin' */}
            </fieldset>
            <fieldset className="well">
                <h4>{labels.Reproduction.reproduction}</h4>
                <Xcomp.Bool label={labels.Reproduction.sexual} observableValue={[vurdering, 'reproductionSexual']}/>
                <Xcomp.Bool label={labels.Reproduction.asexual} observableValue={[vurdering, 'reproductionAsexual']}/>
                <Xcomp.Number label={labels.Reproduction.generationTime} observableValue={[vurdering, 'reproductionGenerationTime']}/>
            </fieldset>

            {appState.otherEffectsEnabled 
                ? <fieldset className="well">
                        <Xcomp.Button 
                            primary 
                            xs
                            className="pull-right"
                            onClick={() => {
                                vurdering.healthEffects = labels.OtherEffects.noKnownValue
                                vurdering.economicEffects = labels.OtherEffects.noKnownValue
                                vurdering.positiveEcologicalEffects = labels.OtherEffects.noKnownValue
                                vurdering.effectsOnPopulationOfOrigin = labels.OtherEffects.noKnownValue
                            }}
                        >{labels.OtherEffects.fillNoKnown} "{labels.OtherEffects.noKnownValue}"</Xcomp.Button>
                    <h4>{labels.OtherEffects.otherEffects}</h4>
                    <Xcomp.String label={labels.OtherEffects.healthEffects} observableValue={[vurdering, 'healthEffects']}/>
                    <Xcomp.String label={labels.OtherEffects.economicEffects} observableValue={[vurdering, 'economicEffects']}/>
                    <label>{labels.OtherEffects.ecosystemEffects}</label>
                    <div className="intent30">
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoBasic} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsBasicLifeProcesses']} codes={koder.ecosystemServiceEffectsBasicLifeProcesses}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoSupport} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsProvisioningServices']} codes={koder.ecosystemServiceEffectsSupportingServices}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoRegulating} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsRegulatingServices']} codes={koder.ecosystemServiceEffectsRegulatingServices}/>
                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoKnowledge} labels={labels.General} observableValue={[vurdering, 'ecosystemServiceEffectsHumanSpiritualServices']} codes={koder.ecosystemServiceEffectsHumanMindServices}/>
                    </div>
                    <Xcomp.String label={labels.OtherEffects.positiveEffects} observableValue={[vurdering, 'positiveEcologicalEffects']}/>
                    <Xcomp.String label={labels.OtherEffects.effectsOnPopulationOfOrigin} observableValue={[vurdering, 'effectsOnPopulationOfOrigin']}/>
                </fieldset>
                : null}
            </>
        );
	}
}



// Vurdering32Artsegenskaper.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	vurdering: PropTypes.object.isRequired
// }
