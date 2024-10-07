import React from 'react';
import { observer, inject } from 'mobx-react';
import config from '../../config';
import * as Xcomp from './observableComponents';
import UploadPicturesButton from './30Artsegenskaper/uploadPicturesButton'
import OriginTable from './30Artsegenskaper/originTable'
import ArrivedCountryFrom from './arrivedCountryFrom'

class Assessment30Artsegenskaper extends React.Component {
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
        const origins = vurdering.naturalOrigins
        const destinations = vurdering.currentInternationalExistenceAreas
        for (let n = 0; n < origins.length; n++) {
            const origin = origins[n]
            const dest = destinations[n]
            for (const key in origin) {
                if (key != "climateZone" && origin[key]) {
                    dest[key] = true
                }
            }
        }
    }
    render() {
        const { appState: { assessment }, appState } = this.props;
        const vurdering = assessment
        const labels = appState.codeLabels
        const koder = appState.koder
        const nbsp = "\u00a0"
        const isMarine = vurdering.marine || vurdering.brackishWater
        // const isLimnic = vurdering.limnic && !vurdering.terrestrial && !vurdering.marine  && !vurdering.brackishWater
        const isLimnicTerrestrial = vurdering.terrestrial || vurdering.limnic
        const limnicTerrestrialMarinelabel = (id) => koder.limnicTerrestrialMarine.find(code => code.Value === id).Text
        const climateZoneLabel = (id) => koder.naturalOriginClimateZone.find(code => code.Value === id).Text
        const subClimateZoneLabel = (id) => koder.naturalOriginSubClimateZone.find(code => code.Value === id).Text
        const naturalOriginDisabled = (id, region) => koder.naturalOriginDisabled.find(code => code.Value === id).Text.indexOf(region) !== -1

        return (
            <div>
                <br />
                <fieldset className="well">
                    <h2>Artsinformasjon</h2>
                    {config.showPageHeaders
                        ? <h3>Artsegenskaper</h3>
                        : null}
                    {appState.imageUploadEnabled
                        ? <div>
                            <UploadPicturesButton scientificName={vurdering.evaluatedScientificName} />
                        </div>
                        : null}
                    <div>
                        <h3>{labels.NaturalOrigin.habitat}</h3>
                        <Xcomp.Bool observableValue={[vurdering, 'limnic']} label={limnicTerrestrialMarinelabel("limnic")} />
                        <Xcomp.Bool observableValue={[vurdering, 'terrestrial']} label={limnicTerrestrialMarinelabel("terrestrial")} />
                        <Xcomp.Bool observableValue={[vurdering, 'marine']} label={limnicTerrestrialMarinelabel("marine")} />
                        {(isLimnicTerrestrial || isMarine) &&
                            <h3>{labels.NaturalOrigin.globalPrevalence}</h3>
                        }
                    </div>
                    {(assessment.isDoorKnocker && assessment.speciesStatus == "A")
                        ? <div>
                            {isLimnicTerrestrial
                                ? <div>
                                    <div className="well">
                                        <h4>{labels.NaturalOrigin.naturalOrigin}</h4>
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
                                        {assessment.naturalOrigins.filter(
                                            row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                                        ).length > 0
                                            ? <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginUnknownDocumentation']} label={labels.NaturalOrigin.describe} />
                                            : null}
                                    </div>
                                    <div className="well">
                                        <h4>{labels.NaturalOrigin.currentExistenceAria}</h4>
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
                                        {vurdering.currentInternationalExistenceAreas.filter(
                                            row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                                        ).length > 0
                                            ? <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceAreasUnknownDocumentation']} label={labels.NaturalOrigin.describe} />
                                            : null}
                                    </div>
                                </div>
                                : null}
                            {isMarine
                                ? <div>
                                    <div className="well">
                                        <h4>{labels.NaturalOrigin.naturalOrigin}</h4>
                                        <Xcomp.MultiselectArray observableValue={[vurdering, 'naturalOriginMarine']} disabled={appState.userContext.readonly} codes={koder.naturalOriginMarine} labels={labels.General} />
                                        <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginMarineDetails']} label={labels.NaturalOrigin.describeMarine} />
                                    </div>
                                    <div className="well">
                                        <h4>{labels.NaturalOrigin.currentExistenceAria}</h4>
                                        <Xcomp.MultiselectArray observableValue={[vurdering, 'currentInternationalExistenceMarineAreas']} disabled={appState.userContext.readonly} codes={koder.naturalOriginMarine} labels={labels.General} />
                                        <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceMarineAreasDetails']} label={labels.NaturalOrigin.describeMarine} />
                                    </div>
                                </div>
                                : null}
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
                                    <Xcomp.String label={labels.OtherEffects.healthEffects} observableValue={[vurdering, 'healthEffects']} />
                                    <Xcomp.String label={labels.OtherEffects.economicEffects} observableValue={[vurdering, 'economicEffects']} />
                                    <label>{labels.OtherEffects.ecosystemEffects}</label>
                                    <div className="intent30">
                                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoBasic} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsBasicLifeProcesses']} codes={koder.ecosystemServiceEffectsBasicLifeProcesses} />
                                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoSupport} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsProvisioningServices']} codes={koder.ecosystemServiceEffectsSupportingServices} />
                                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoRegulating} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsRegulatingServices']} codes={koder.ecosystemServiceEffectsRegulatingServices} />
                                        <Xcomp.MultiselectArray label={labels.OtherEffects.ecoKnowledge} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsHumanSpiritualServices']} codes={koder.ecosystemServiceEffectsHumanMindServices} />
                                    </div>
                                    <Xcomp.String label={labels.OtherEffects.positiveEffects} observableValue={[vurdering, 'positiveEcologicalEffects']} />
                                    <Xcomp.String label={labels.OtherEffects.effectsOnPopulationOfOrigin} observableValue={[vurdering, 'effectsOnPopulationOfOrigin']} />
                                </div>
                                : null}
                        </div>
                        : assessment.isRegionallyAlien == true
                            ? <div>
                                {isLimnicTerrestrial
                                    ? <div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.naturalOrigin}</h4>
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
                                            {vurdering.naturalOrigins.filter(
                                                row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                                            ).length > 0
                                                ? <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginUnknownDocumentation']} label={labels.NaturalOrigin.describe} />
                                                : null}
                                        </div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.currentExistenceAria}</h4>
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
                                            {vurdering.currentInternationalExistenceAreas.filter(
                                                row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                                            ).length > 0
                                                ? <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceAreasUnknownDocumentation']} label={labels.NaturalOrigin.describe} />
                                                : null}
                                        </div>
                                    </div>
                                    : null}
                                {isMarine
                                    ? <div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.naturalOrigin}</h4>
                                            <Xcomp.MultiselectArray observableValue={[vurdering, 'naturalOriginMarine']} disabled={appState.userContext.readonly} codes={koder.naturalOriginMarine} labels={labels.General} />
                                            <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginMarineDetails']} label={labels.NaturalOrigin.describeMarine} />
                                        </div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.currentExistenceAria}</h4>
                                            <Xcomp.MultiselectArray observableValue={[vurdering, 'currentInternationalExistenceMarineAreas']} disabled={appState.userContext.readonly} codes={koder.naturalOriginMarine} labels={labels.General} />
                                            <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceMarineAreasDetails']} label={labels.NaturalOrigin.describeMarine} />
                                        </div>
                                    </div>
                                    : null}
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
                                        <Xcomp.String label={labels.OtherEffects.healthEffects} observableValue={[vurdering, 'healthEffects']} />
                                        <Xcomp.String label={labels.OtherEffects.economicEffects} observableValue={[vurdering, 'economicEffects']} />
                                        <label>{labels.OtherEffects.ecosystemEffects}</label>
                                        <div className="intent30">
                                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoBasic} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsBasicLifeProcesses']} codes={koder.ecosystemServiceEffectsBasicLifeProcesses} />
                                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoSupport} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsProvisioningServices']} codes={koder.ecosystemServiceEffectsSupportingServices} />
                                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoRegulating} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsRegulatingServices']} codes={koder.ecosystemServiceEffectsRegulatingServices} />
                                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoKnowledge} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsHumanSpiritualServices']} codes={koder.ecosystemServiceEffectsHumanMindServices} />
                                        </div>
                                        <Xcomp.String label={labels.OtherEffects.positiveEffects} observableValue={[vurdering, 'positiveEcologicalEffects']} />
                                        <Xcomp.String label={labels.OtherEffects.effectsOnPopulationOfOrigin} observableValue={[vurdering, 'effectsOnPopulationOfOrigin']} />
                                    </div>
                                    : null}
                            </div>
                            : <div>
                                {isLimnicTerrestrial
                                    ? <div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.naturalOrigin}</h4>
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
                                            {vurdering.naturalOrigins.filter(
                                                row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                                            ).length > 0
                                                ? <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginUnknownDocumentation']} label={labels.NaturalOrigin.describe} />
                                                : null}
                                        </div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.currentExistenceAria}</h4>
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
                                            {vurdering.currentInternationalExistenceAreas.filter(
                                                row => row.europe || row.asia || row.africa || row.oceania || row.northAndCentralAmerica || row.southAmerica
                                            ).length > 0
                                                ? <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceAreasUnknownDocumentation']} label={labels.NaturalOrigin.describe} />
                                                : null}
                                        </div>
                                    </div>
                                    : null}
                                {isMarine
                                    ? <div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.naturalOrigin}</h4>
                                            <Xcomp.MultiselectArray observableValue={[vurdering, 'naturalOriginMarine']} disabled={appState.userContext.readonly} codes={koder.naturalOriginMarine} labels={labels.General} />
                                            <Xcomp.HtmlString observableValue={[vurdering, 'naturalOriginMarineDetails']} label={labels.NaturalOrigin.describeMarine} />
                                        </div>
                                        <div className="well">
                                            <h4>{labels.NaturalOrigin.currentExistenceAria}</h4>
                                            <Xcomp.MultiselectArray observableValue={[vurdering, 'currentInternationalExistenceMarineAreas']} disabled={appState.userContext.readonly} codes={koder.naturalOriginMarine} labels={labels.General} />
                                            <Xcomp.HtmlString observableValue={[vurdering, 'currentInternationalExistenceMarineAreasDetails']} label={labels.NaturalOrigin.describeMarine} />
                                        </div>
                                    </div>
                                    : null}

                            </div>}
                </fieldset>
                <fieldset className="well">
                    <div>
                        <h3>
                            {vurdering.speciesStatus == "A"
                                ? labels.NaturalOrigin.arrivedCountryClassA
                                : labels.NaturalOrigin.arrivedCountry}
                            {vurdering.isRegionallyAlien
                                ? " vurderingsområdet "
                                : vurdering.expertGroup.indexOf("Svalbard") > -1
                                    ? "Svalbard"
                                    : "Fastlands-Norge"}
                            {labels.NaturalOrigin.arrivedCountryFrom}
                        </h3>
                        <ArrivedCountryFrom assessment={vurdering} appState={appState} />
                    </div>
                    <label>{labels.NaturalOrigin.arrivedCountryFromDetails}</label>
                    <Xcomp.HtmlString observableValue={[vurdering, 'arrivedCountryFromDetails']} />
                </fieldset>
                <fieldset className="well">
                    <h3>{labels.Reproduction.reproduction}</h3>
                    <Xcomp.Bool label={labels.Reproduction.sexual} observableValue={[vurdering, 'reproductionSexual']} />
                    <Xcomp.Bool label={labels.Reproduction.asexual} observableValue={[vurdering, 'reproductionAsexual']} />
                    <Xcomp.Number label={labels.Reproduction.generationTime} observableValue={[vurdering, 'reproductionGenerationTime']} />
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
                        <Xcomp.String label={labels.OtherEffects.healthEffects} observableValue={[vurdering, 'healthEffects']} />
                        <Xcomp.String label={labels.OtherEffects.economicEffects} observableValue={[vurdering, 'economicEffects']} />
                        <label>{labels.OtherEffects.ecosystemEffects}</label>
                        <div className="intent30">
                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoBasic} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsBasicLifeProcesses']} codes={koder.ecosystemServiceEffectsBasicLifeProcesses} />
                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoSupport} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsProvisioningServices']} codes={koder.ecosystemServiceEffectsSupportingServices} />
                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoRegulating} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsRegulatingServices']} codes={koder.ecosystemServiceEffectsRegulatingServices} />
                            <Xcomp.MultiselectArray label={labels.OtherEffects.ecoKnowledge} labels={labels.General} disabled={appState.userContext.readonly} observableValue={[vurdering, 'ecosystemServiceEffectsHumanSpiritualServices']} codes={koder.ecosystemServiceEffectsHumanMindServices} />
                        </div>
                        <Xcomp.String label={labels.OtherEffects.positiveEffects} observableValue={[vurdering, 'positiveEcologicalEffects']} />
                        <Xcomp.String label={labels.OtherEffects.effectsOnPopulationOfOrigin} observableValue={[vurdering, 'effectsOnPopulationOfOrigin']} />
                    </fieldset>
                    : null}
            </div>
        );
    }
}

export default inject("appState")(observer(Assessment30Artsegenskaper));
