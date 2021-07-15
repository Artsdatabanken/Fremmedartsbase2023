import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {autorun , observable} from 'mobx';
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
        const labels = appState.codeLabels
        const ntLabels = labels.NatureTypes
        const {id, value, uncertaintyValues, auto, codes, heading, info, uncertaintyDisabled } = criterion;
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

        console.log("##info:" + JSON.stringify(criterion))


        // console.log("head " + heading)
        // console.log("val " + value) // + "|" + Id)
        // console.log("udis " + JSON.stringify(uncertaintyDisabled))
        // console.log("uval " + JSON.stringify(uncertaintyValues))
        // console.log("auto " + auto)


        // const logthis = criterion.criteriaLetter === "A"

        return(
            <>
            {showHeading ? <div><h4>{heading}</h4> {!hideInfo ? <p>{info}</p> : null}</div> : null}
            {disabled ?  <p>{ntLabels.scoreSummary}</p> :  <p>{ntLabels.score}</p>}
            <div className= {disabled ? "criterion disabled" : "criterion" }>
            
            {codes.map(kode => {  
                const onChangeRadio = e => {
                    // console.log("radio2 change")
                    if (!auto) {
                        criterion.value = parseInt(e.target.value)
                    }
                } 
                const onChangeCheckbox = e => {
                    // console.log("check2 change")
                    setUncertainty(e)
                }
                const radiooptional = {};
                const checkboxoptional = {};
                const disabled = (kode.Text === null || this.props.disabled)
                
                console.log(disabled)
                if(value !== undefined) {
                    radiooptional.checked = (kode.value === value)
                }
                if(uncertaintyValues !== undefined) {
                    checkboxoptional.checked = uncertaintyValues.indexOf(kode.value) > -1;
                }

                // console.log("VVV " + value + " " + value + " # " + radiooptional.checked)
                // console.log("name " + name)
                checkboxoptional.disabled = this.context.readonly || disabled || uncertaintyDisabled.indexOf(kode.value) > -1 
                radiooptional.disabled = this.context.readonly || disabled || auto


                // if (logthis) {
                //     console.log("level " + kode.value + "/\\" + value + "#" + radiooptional.checked)
                // }


                return <div key={kode.value} className="uncertainty">      
                    <div>
                        
                        {auto ?
                            <div className={"criteriaCheck" + (radiooptional.checked ? " glyphicon glyphicon-ok" : "")}>&nbsp;</div> :
                            <>{parseInt(kode.value)+1}
                            <input                            
                            disabled={disabled}
                            value={kode.value}
                            type="radio"
                            onChange={onChangeRadio}
                            {...radiooptional} />
                            </>
                        }
                        <input
                        disabled={disabled}
                        value={kode.value}
                        type="checkbox"
                        onChange={onChangeCheckbox}
                        {...checkboxoptional} />
                        {kode.Text}
                    </div>
                   
                
                </div>})} 
                <br/>
                <Xcomp.Button primary onClick= {() => {
                    //console.log("Save assessment")
                        appState.saveCurrentAssessment();
                    }}>{labels.AppHeader.assessmentSave}</Xcomp.Button> 
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

