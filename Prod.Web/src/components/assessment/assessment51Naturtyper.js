import React from 'react';
import {observer, inject} from 'mobx-react';
import {action} from 'mobx';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'
import {getCriterion} from '../../utils'
import NaturtypeTable from './51Naturtyper/naturtypeTable';
import HabitatTable from './51Naturtyper/habitatTable';
import NewNaturetype from './51Naturtyper/newNaturetype';
import RedlistedNaturetypeTable from './51Naturtyper/redlistedNaturetypeTable';
//import NewRedlistedNaturetype from './51Naturtyper/newRedlistedNaturetype';

@inject("appState")
@observer
export default class Assessment51Naturtyper extends React.Component {
    constructor(props) {
        super(props)
        const {appState:{assessment}, appState} = this.props;
        
        // extendObservable(this, { })
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
        // this.addRedlistedNaturetype = action((nyNt) => {
        //     assessment
        //         .redlistedNatureTypes
        //         .push(nyNt)
        //     // alert("add new redlisted nature type: " + nyNt.RedlistedNatureTypeName + " -
        //     // " + nyNt.Category)
        // })
    }

    render() {
        const {appState:{assessment}, appState} = this.props;
        const riskAssessment = assessment.riskAssessment
        const labels = appState.codeLabels
        const koder = appState.koder
        const disabled = appState.userContext.readonly
        const ntLabels = labels.NatureTypes
        const critC = getCriterion(riskAssessment, 0, "C")
        const critF = getCriterion(riskAssessment, 1, "F")
        const critG = getCriterion(riskAssessment, 1, "G")
        action(() => {
            critC.auto = false
            critF.auto = false
            critG.auto = false
        })
        const nts = appState.naturtyper
        const doms = appState.dominansSkog
        var hasImpactAbroad = false 
        if (assessment.impactedNatureTypes.length > 0) {
            for (var i = 0; i < assessment.impactedNatureTypes.length; i++) {
                if (assessment.impactedNatureTypes[i].background.indexOf("ObservationAbroad") > -1 || assessment.impactedNatureTypes[i].background.indexOf("WrittenDocumentationAbroad") > -1){
                    hasImpactAbroad = true;
                }
            }
        }
        const canRenderTable = !!appState.naturtypeLabels
        return (
            <div>
                <fieldset className="well"> 
                <h2>{ntLabels.heading}</h2>   
                <div>
                    {appState.trueteogsjeldneCodes
                        ? <NewNaturetype
                            mode="truet"
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
                    addNaturtype={this.addNaturtype}
                    labels={labels}
                    codes={appState.naturtyperNIN2}
                    header={ntLabels.chooseNT}
                    superheader={ntLabels.effectsNiN23} >
                </NewNaturetype>
                
                {assessment.impactedNatureTypes.length > 0 && 
                <>
                <h4>{ntLabels.chosenNatureTypes}</h4>
                <NaturtypeTable
                    naturetypes={assessment.impactedNatureTypes}
                    appState={appState}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    codes={koder}
                    appState={appState}
                    disabled={disabled}
                    desc={ntLabels.colonizedAreaDescription}/>
                </>
                }

                {assessment.redlistedNatureTypes.length > 0 && <div className="previousAssessment">
                <hr></hr>
                <h4>{ntLabels.dataFromPreviousAssessment}</h4>
                <p>{ntLabels.redlistedNaturetypes2011}</p>
                <RedlistedNaturetypeTable
                    naturetypes={assessment.redlistedNatureTypes}
                    canRenderTable={canRenderTable}
                    labels={labels}
                    fabModel={appState}/>
                </div>}
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
                    {hasImpactAbroad ? 
                    <div>
                        <p>{ntLabels.natureAffectedAbroad}</p>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'natureAffectedAbroadF']}/>
                        </div> : null}
                </fieldset>
                
                <fieldset className="well">
                    <h4>{ntLabels.critGHeading}</h4>
                    <p>{ntLabels.criteriumG}</p>
                    <Criterion criterion={critG} mode="noheading" disabled={disabled}/>
                   { hasImpactAbroad ? 
                    <div>
                        <p>{ntLabels.natureAffectedAbroad}</p>
                        <Xcomp.HtmlString observableValue={[riskAssessment, 'natureAffectedAbroadG']}/>
                        </div> : null }
                        <Xcomp.HtmlString
                            observableValue={[riskAssessment, 'commonNatureTypesAffectedDomesticDescription']}/>
                </fieldset>
            {true || appState.livsmediumEnabled
                ? <fieldset className="well">
                    {appState.livsmediumCodes
                        ? <NewNaturetype
                        mode="livsmedium"
                        appState={appState}
                        addNaturtype={this.addLivsmedium}
                        labels={labels}
                        codes={appState.livsmediumCodes}
                        header={labels.NatureTypes.chooseLM}
                        hideStateChange={true}
                        superheader={"Livsmedium"}
                         >
                        </NewNaturetype>
                        
                        : null}
                {assessment.habitats.length > 0 && 
                    <HabitatTable
                    canRenderTable={canRenderTable}
                    naturetypes={assessment.habitats}
                    labels={labels}
                    fabModel={appState}
                    />
                }
                </fieldset>
                : null}
                <br/>
            </div>
        );
    }
}
