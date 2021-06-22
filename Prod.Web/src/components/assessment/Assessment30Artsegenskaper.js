import React from 'react';
// import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
// import RadioGroup from './radioGroup'
import config from '../../config';
import * as Xcomp from './observableComponents';
import UploadPicturesButton from './32artsegenskaper/uploadPicturesButton'
import OriginTable from './32artsegenskaper/originTable'
import ArrivedCountryFrom from './32artsegenskaper/arrivedCountryFrom'

@inject("appState")
@observer
export default class Assessment30Artsegenskaper extends React.Component {
    constructor(props) {
        super(props)
    }
    setNaturalOriginsAllUnknown(vurdering) {
        const unknown = vurdering.NaturalOrigins.find(row => row.ClimateZone == "unknown;")
        unknown.Europe = true
        unknown.Asia = true
        unknown.Africa = true
        unknown.Oceania = true
        unknown.NorthAndCentralAmerica = true
        unknown.SouthAmerica = true
    }
    setCurrentInternationalExistenceAreasAllUnknown(vurdering) {
        const unknown = vurdering.CurrentInternationalExistenceAreas.find(row => row.ClimateZone == "unknown;")
        unknown.Europe = true
        unknown.Asia = true
        unknown.Africa = true
        unknown.Oceania = true
        unknown.NorthAndCentralAmerica = true
        unknown.SouthAmerica = true
    }
    transferNaturalOriginsToCurrentInternationalExistenceAreas(vurdering) {
        const origins=vurdering.NaturalOrigins
        const destinations=vurdering.CurrentInternationalExistenceAreas
        for(let n = 0; n < origins.length; n++) {
            const origin = origins[n]
            const dest = destinations[n]
            // for (let key of Object.keys(origin))
            for (const key in origin) {
                if (key != "ClimateZone" && origin[key]) {
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


        // const {vurdering, viewModel, fabModel} = this.props;
        const nbsp = "\u00a0"
        // const labels = config.labels
        // const labels = fabModel.codeLabels
        // const isMarine = vurdering.Marine && !vurdering.Terrestrial && !vurdering.Limnic
        const isMarine = vurdering.Marine || vurdering.BrackishWater
        const isLimnic = vurdering.Limnic && !vurdering.Terrestrial && !vurdering.Marine  && !vurdering.BrackishWater
        const isLimnicTerrestrial = vurdering.Terrestrial || vurdering.Limnic
        const limnicTerrestrialMarinelabel = (id) => koder.limnicTerrestrialMarine.find(code => code.Value === id).Text
        const climateZoneLabel = (id) => koder.naturalOriginClimateZone.find(code => code.Value === id).Text
        const subClimateZoneLabel = (id) => koder.naturalOriginSubClimateZone.find(code => code.Value === id).Text
        const naturalOriginDisabled = (id, region) => koder.naturalOriginDisabled.find(code => code.Value === id).Text.indexOf(region) !== -1

        return(
            <div>
                <h2>Global utbredelse og artsegenskaper</h2>
                {config.showPageHeaders ? <h3>Artsegenskaper</h3> : <br />}
                <br />
                {appState.imageUploadEnabled
                ? <div>
                    <UploadPicturesButton scientificName={vurdering.EvaluatedScientificName}/>
                    <br />
                </div>
                : null}
                <Xcomp.Bool observableValue={[vurdering, 'limnic']} label={limnicTerrestrialMarinelabel("limnic")} />            
                <Xcomp.Bool observableValue={[vurdering, 'terrestrial']} label={limnicTerrestrialMarinelabel("terrestrial")} />            
                <Xcomp.Bool observableValue={[vurdering, 'marine']} label={limnicTerrestrialMarinelabel("marine")} />            
                {appState.showBrackishWater
                ? <Xcomp.Bool observableValue={[vurdering, 'brackishWater']} label={limnicTerrestrialMarinelabel("brackishWater")} />            
                : null}
                {isLimnicTerrestrial ?
                <div>
                    <br/>
                    <div className="well">
                    <h4><b>{labels.NaturalOrigin.naturalOrigin}</b></h4>
                    <OriginTable 
                        origins={vurdering.NaturalOrigins} 
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
                    { vurdering.NaturalOrigins.filter(
                            row => row.Europe || row.Asia || row.Africa || row.Oceania || row.NorthAndCentralAmerica || row.SouthAmerica
                        ).length > 0 ?
                        <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginUnknownDocumentation']} label={labels.NaturalOrigin.describe} /> :
                        null}
                    </div>
                    <div className="well">
                    <h4><b>{labels.NaturalOrigin.currentExistenceAria}</b></h4>
                    <OriginTable 
                        origins={vurdering.CurrentInternationalExistenceAreas} 
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
                    { vurdering.CurrentInternationalExistenceAreas.filter(
                            row => row.Europe || row.Asia || row.Africa || row.Oceania || row.NorthAndCentralAmerica || row.SouthAmerica
                        ).length > 0 ?
                        <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceAreasUnknownDocumentation']} label='Gi utdypende informasjon ved behov (påkrevd for "Ukjent" )' /> :
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
                        <h4>{labels.NaturalOrigin.arrivedCountryFrom}</h4>
                        {/* <ArrivedCountryFrom vurdering={vurdering} fabModel={fabModel} /> */}
                        <ArrivedCountryFrom vurdering={vurdering} />
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
                                vurdering.HealthEffects = labels.OtherEffects.noKnownValue
                                vurdering.EconomicEffects = labels.OtherEffects.noKnownValue
                                vurdering.PositiveEcologicalEffects = labels.OtherEffects.noKnownValue
                                vurdering.EffectsOnPopulationOfOrigin = labels.OtherEffects.noKnownValue
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

        );
	}
}



// Vurdering32Artsegenskaper.propTypes = {
// 	viewModel: PropTypes.object.isRequired,
// 	vurdering: PropTypes.object.isRequired
// }
