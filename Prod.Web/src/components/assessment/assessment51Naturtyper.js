import React from 'react';
import {observer, inject} from 'mobx-react';
import {action} from 'mobx';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import NaturtypeTable from './51Naturtyper/naturtypeTable';
import HabitatTable from './51Naturtyper/habitatTable';
import NewNaturetype from './51Naturtyper/newNaturetype';
import RedlistedNaturetypeTable from './51Naturtyper/redlistedNaturetypeTable';
import OriginTable from './30Artsegenskaper/originTable'
import errorhandler from '../errorhandler';
import ErrorList from '../errorList';

@inject("appState")
@observer
export default class Assessment51Naturtyper extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment}, appState} = this.props;
        this.addNaturtype = action((nyNt) => {
            assessment
                .impactedNatureTypes
                .push(nyNt)
        })
        this.addLivsmedium = action((nyLm) => {                      
            assessment
                .habitats
                .push(nyLm)
        })
    }

    render() {
        const {appState:{assessment}, appState} = this.props;
        const riskAssessment = assessment.riskAssessment
        const labels = appState.codeLabels
        const koder = appState.koder
        const disabled = appState.userContext.readonly
        const ntLabels = labels.NatureTypes
        const critC = riskAssessment.critC
        const critF = riskAssessment.critF
        const critG = riskAssessment.critG
        const marine = (assessment.expertGroup == "Marine invertebrater" || assessment.expertGroup == "Marine invertebrater (Svalbard)" || assessment.expertGroup == "Alger" || assessment.expertGroup == "Fisker" || assessment.expertGroup == "Fisker (Svalbard)")
        const mainland = assessment.expertGroup != "Marine invertebrater" && assessment.expertGroup.indexOf ("Svalbard") < 0
        const svalbard = (assessment.expertGroup == "Karplanter (Svalbard)" || assessment.expertGroup == "Pattedyr (Svalbard)")
        const contBioClimateZoneLabel = (id) => koder.continentalBioClimateZone.find(code => code.Value === id) ? koder.continentalBioClimateZone.find(code => code.Value === id).Text : id
        const arcticBioClimateZoneLabel = (id) => koder.arcticBioCLimateZone.find(code => code.Value === id) ? koder.arcticBioCLimateZone.find(code => code.Value === id).Text : id
        const coastLineZoneLabel = (id) => koder.coastLineZone.find(code => code.Value === id) ? koder.coastLineZone.find(code => code.Value === id).Text : id
        const coastZoneDisabled = (id, region) => koder.coastZoneDisabled.find(code => code.Value === id) ? koder.coastZoneDisabled.find(code => code.Value === id).Text.indexOf(region) !== -1 : true
        const arcticZoneDisabled = (id, region) => koder.arcticZoneDisabled.find(code => code.Value === id) ? koder.arcticZoneDisabled.find(code => code.Value === id).Text.indexOf(region) !== -1 : true
        const mainlandZoneDisabled = (id, region) => koder.mainlandZoneDisabled.find(code => code.Value === id) ? koder.mainlandZoneDisabled.find(code => code.Value === id).Text.indexOf(region) !== -1 : true
        const canRenderTable = !!appState.naturtypeLabels
        return (
            <div>
                <fieldset className="well"> 
                    <h2>{ntLabels.heading}</h2>   
                    <div>
                        {appState.trueteogsjeldneCodes
                        ? <NewNaturetype
                            mode="truet"
                            assessment={assessment}
                            appState={appState}
                            addNaturtype={this.addNaturtype}
                            labels={labels}
                            codes={appState.trueteogsjeldneCodes}
                            header={labels.NatureTypes.chooseTS}
                            hideStateChange={false}
                            superheader={ntLabels.redListEffects} >
                        </NewNaturetype>
                        : null}
                    </div>
                    <NewNaturetype
                        mode="nin"
                        appState={appState}
                        assessment={assessment}
                        addNaturtype={this.addNaturtype}
                        labels={labels}
                        codes={appState.naturtyperNIN2}
                        header={ntLabels.chooseNT}
                        superheader={ntLabels.effectsNiN23} >
                    </NewNaturetype>
                    {assessment.impactedNatureTypes.length > 0
                    ? <>
                    <h4>{ntLabels.chosenNatureTypes}</h4>
                    <NaturtypeTable
                        naturetypes={assessment.impactedNatureTypes}
                        appState={appState}
                        canRenderTable={canRenderTable}
                        labels={labels}
                        codes={koder}
                        disabled={disabled}
                        desc={ntLabels.colonizedAreaDescription}/>
                    </>
                    : null}
                    {assessment.impactedNatureTypesFrom2018.length > 0 
                    ? <div className="previousAssessment">
                        <h4>{ntLabels.dataFromPreviousAssessment}</h4>
                        <NaturtypeTable
                            naturetypes={assessment.impactedNatureTypesFrom2018}
                            appState={appState}
                            canRenderTable={canRenderTable}
                            labels={labels}
                            codes={koder}
                            disabled={true}
                            desc={ntLabels.transferredFromNiN22}/>
                    </div>
                    : null}
                    {assessment.redlistedNatureTypes.length > 0 
                    ? <div className="previousAssessment">
                        {assessment.impactedNatureTypesFrom2018.length == 0 
                        && <h4>{ntLabels.dataFromPreviousAssessment}</h4>}
                        <p>{ntLabels.redlistedNaturetypes2011}</p>
                        <RedlistedNaturetypeTable
                        naturetypes={assessment.redlistedNatureTypes}
                        canRenderTable={canRenderTable}
                        labels={labels}
                        appState={appState}/>
                    </div>
                    : null}
                    <ErrorList errorhandler={errorhandler} errorids={["(nat)err1"]} />  
                </fieldset> 
                <fieldset className="well">
                    <h4>{ntLabels.critCHeading}</h4>
                    <p>{ntLabels.criteriumC}</p>
                    <Criterion criterion={critC} mode="noheading" disabled={disabled}/>
                </fieldset>
                <fieldset className="well">
                    <h4>{ntLabels.critFHeading}</h4>
                    <p>{ntLabels.criteriumF}</p>
                    <Criterion criterion={critF} mode="noheading" disabled={disabled}/>
                    <p>{ntLabels.natureAffected}</p>
                    <Xcomp.HtmlString observableValue={[riskAssessment, 'threatenedNatureTypesAffectedDomesticDescription']} />
                </fieldset>
                <fieldset className="well">
                    <h4>{ntLabels.critGHeading}</h4>
                    <p>{ntLabels.criteriumG}</p>
                    <Criterion criterion={critG} mode="noheading" disabled={disabled}/>
                    <p>{ntLabels.natureAffected}</p>
                    <Xcomp.HtmlString observableValue={[riskAssessment, 'commonNatureTypesAffectedDomesticDescription']}/>
                </fieldset>
                
                <fieldset className="well">
                    <h4>{ntLabels.regionalNaturetypes}</h4>
                    {(!assessment.limnic && !assessment.marine && !assessment.terrestrial) ?
                    <>
                    <ErrorList errorhandler={errorhandler} errorids={["(nat)err2"]} />
                    </>
                    :(assessment.limnic && !assessment.marine && !assessment.terrestrial) ?
                    <>
                    <p> Regional naturvariasjon skal ikke fylles ut for limniske arter ettersom bioklimatiske seksjoner er lite relevant for ferskvannssystemer </p>
                    </>
                    :
                    <>
                    <p> Angi kombinasjoner av soner og seksjoner hvor arten finnes i dag, eller antas å kunne finnes i framtiden (innenfor vurderingsperioden) </p>
                    <p> Mer informasjon og kartvisning av soner og seksjoner finner du <a href="https://nin.artsdatabanken.no/Natur_i_Norge/Natursystem/Beskrivelsessystem/Regional_naturvariasjon?informasjon" target="_blank"> her</a>. </p>
                    <br/>
                    </> }
                    {marine && assessment.marine
                    ? <>
                        <h5 className={"bioCLZone"}>{ntLabels.marineSpecies}</h5>
                        <p className="bioCLZone">{ntLabels.coastWaterSections}</p>
                        <div className="bioclimaticZones">
                        <div>{ntLabels.coastWaterZones}</div>
                        <OriginTable 
                                mode = {"marine"}
                                origins={assessment.coastLineSections} 
                                climateZoneLabel={coastLineZoneLabel}
                                naturalOriginDisabled={coastZoneDisabled}
                                labels={labels.NaturalOrigin}
                        />
                        </div>
                    </>
                    : null}
                    {mainland && (assessment.limnic || assessment.terrestrial)
                    ? <>
                        {assessment.terrestrial ?
                        <>
                        <h5 className={"bioCLZone"}>{ntLabels.mainlandNorway}</h5>
                        <p className="bioCLZone">{ntLabels.bioClimateSections}</p>
                        <div className="bioclimaticZones">
                        <div>{ntLabels.bioClimateZones}</div>
                        <OriginTable 
                                mode = {"continental"}
                                origins={assessment.currentBioClimateZones} 
                                climateZoneLabel={contBioClimateZoneLabel}
                                naturalOriginDisabled={mainlandZoneDisabled}
                                labels={labels.NaturalOrigin}
                        />
                        </div>
                        </>
                        : null }
                    </>
                    : null}
                    {svalbard 
                    ? <>                   
                        <h5 className={"bioCLZone"}>{ntLabels.svalbard}</h5>
                        <p className="bioCLZone">{ntLabels.bioClimateSections}</p>
                        <div className="bioclimaticZones">
                        <div>{ntLabels.bioClimateZonesArctic}</div>
                        <OriginTable 
                                mode = {"arctic"}
                                origins={assessment.arcticBioClimateZones} 
                                climateZoneLabel={arcticBioClimateZoneLabel}
                                naturalOriginDisabled={arcticZoneDisabled}
                                labels={labels.NaturalOrigin}
                        />
                        </div>
                    </>
                    : null}
                </fieldset>
                {appState.livsmediumEnabled
                ? <fieldset className="well">
                    {appState.livsmediumCodes
                    ? <NewNaturetype
                        mode="livsmedium"
                        assessment={assessment}
                        appState={appState}
                        addNaturtype={this.addLivsmedium}
                        labels={labels}
                        codes={appState.livsmediumCodes}
                        header={labels.NatureTypes.chooseLM}
                        hideStateChange={true}
                        superheader={"Livsmedium"}
                    />
                    : null}
                    {assessment.habitats.length > 0
                    ? <HabitatTable
                        canRenderTable={canRenderTable}
                        naturetypes={assessment.habitats}
                        labels={labels}
                        appState={appState}
                        />
                    : null}
                </fieldset>
                : null}
                <br/>
            </div>
        );
    }
}
