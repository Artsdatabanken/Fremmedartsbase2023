﻿import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {runInAction} from 'mobx';
import * as Xcomp from './observableComponents';

@inject("appState")
@observer
export default class Criterion extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {criterion, appState, mode, hideInfo, disabled} = this.props;
        
        console.log("keys: " + JSON.stringify(Object.keys(criterion)))
        const assessment = appState.assessment
        const riskAssessment = assessment.riskAssessment
        const labels = appState.codeLabels
        const ntLabels = labels.NatureTypes
        const {id, value, uncertaintyValues, auto, codes, heading, info, valueDisabled, uncertaintyDisabled, errors } = criterion;
        
        const letter = criterion.criteriaLetter
        //console.log(heading)
        //console.log(codes)
        
        const showHeading = !mode || mode.indexOf("noheading") < 0
        const setUncertainty = e => {
            // console.log("setUncertainty check: " + e.target.value + " | checked: " + e.target.checked)
            runInAction(() => {
                if( e.target.checked) {
                    uncertaintyValues.push(parseInt(e.target.value))
                } else {
                    uncertaintyValues.remove(parseInt(e.target.value))
                }
            })
        }
        // const setLevel = e => {
        //     console.log("setLevel: " + e.target.value)
        //     runInAction(() => {
        //         criterion.value = parseInt(e.target.value)
        //         console.log("setLevel value: " + criterion.value)

        //     })
        //     console.log("setLevel2: " + e.target.value)
        // }

        // console.log("##info:" + JSON.stringify(criterion))


        console.log("#!!head " + heading)
        console.log("#!!val " + value) // + "|" + Id)
        console.log("#!!udis " + JSON.stringify(uncertaintyDisabled))
        console.log("#!!uval " + JSON.stringify(uncertaintyValues))
        console.log("#!!auto " + auto)


        // const logthis = criterion.criteriaLetter === "A"

        return(
            <>
            {showHeading ? <div><h3>{heading}</h3> {!hideInfo ? <p>{info}</p> : null}</div> : null}
            {/*disabled ?  <p>{ntLabels.scoreSummary}</p>  :  <p>{scoreText}</p>*/}
            {disabled || (letter && letter == "B") ?  <p>{ntLabels.scoreSummary}</p>  : letter ? ((letter == "A" && (riskAssessment.chosenSpreadMedanLifespan == "SpreadRscriptEstimatedSpeciesLongevity" || riskAssessment.chosenSpreadMedanLifespan ==  "ViableAnalysis")) || (letter =="B" && riskAssessment.chosenSpreadYearlyIncrease == "b" && assessment.isDoorKnocker )) ? <p>{ntLabels.uncertainity}</p>: <p>{ntLabels.score}</p> : null}
            <div className= {disabled ? "criterion disabled" : "criterion" }>
            
            {codes.map(kode => {  
                const onChangeRadio = e => {
                    // console.log("radio2 change")
                    if (!auto) {
                        // setLevel(e)

                        runInAction(() => {
                            criterion.value = parseInt(e.target.value)
                        })
                    }
                } 
                const onChangeCheckbox = e => {
                    // console.log("check2 change")
                    setUncertainty(e)
                }
                const radiooptional = {};
                const checkboxoptional = {};
                const disabled = (kode.text === null || this.props.disabled)
                
                if(value !== undefined) {
                    radiooptional.checked = (kode.value === value)
                }
                if(uncertaintyValues !== undefined) {
                    checkboxoptional.checked = uncertaintyValues.indexOf(kode.value) > -1;
                }

                // console.log("VVV " + value + " " + value + " # " + radiooptional.checked)
                // console.log("name " + name)
                checkboxoptional.disabled = (this.context.readonly || disabled || uncertaintyDisabled.indexOf(kode.value) > -1 )
                radiooptional.disabled = (this.context.readonly || disabled || valueDisabled.indexOf(kode.value) > -1 || auto)


                // if (logthis) {
                //     console.log("level " + kode.value + "/\\" + value + "#" + radiooptional.checked)
                // }
                // console.log("unclevel " + kode.value + "/\\" + value + "#" + checkboxoptional.disabled)
                console.log("#!! radio disabled level " + kode.value + "/\\" + value + "#" + radiooptional.disabled +
                    " ¤¤ " + this.context.readonly + " # " + disabled + " % " +  (valueDisabled.indexOf(kode.value) > -1) + " # " +  auto)

                console.log("unclevel " + criterion.criteriaLetter + "&" + kode.value + "/" + this.context.readonly  + "/text: " + kode.text + "!props dis:" + this.props.disabled  + "#" + (uncertaintyDisabled.indexOf(kode.value) > -1))


                return <div key={kode.value} className="uncertainty">      
                    <div>
                        
                        {/*auto ?
                            <div className={"criteriaCheck" + (radiooptional.checked ? " glyphicon glyphicon-ok" : "")}>&nbsp;</div> :
                            <>{parseInt(kode.value)+1}
                            <input                            
                            value={kode.value}
                            type="radio"
                            onChange={onChangeRadio}
                            {...radiooptional} />
                            </>
                        */}
                        <>{parseInt(kode.value)+1}
                            <input                            
                            value={kode.value}
                            type="radio"
                            onChange={onChangeRadio}
                            {...radiooptional} />
                            </>
                        {/*<div className={"criteriaCheck" + (radiooptional.checked ? " glyphicon glyphicon-ok" : "")}>&nbsp;</div>*/}
                        <input
                        value={kode.value}
                        type="checkbox"
                        onChange={onChangeCheckbox}
                        {...checkboxoptional} 
                        />
                        {kode.text}
                    </div>
                    {/* <div>
                        <ul>
                        {Object.keys(errors).map(key =>
                            <li>{errors[key]}</li>
                        )}
                        </ul>
                    </div> */}
                
                </div>})} 
               {/*!hasImpactAbroad && <Xcomp.Button primary onClick= {() => {
                    //console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>{labels.AppHeader.assessmentSave}</Xcomp.Button> */}
            </div>
            </>
        );
	}
}

Criterion.propTypes = {
    criterion: PropTypes.object,
}


Criterion.contextTypes = {
    readonly: PropTypes.bool
}

