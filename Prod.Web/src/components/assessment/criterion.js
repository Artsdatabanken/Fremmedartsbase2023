import React from 'react';
import PropTypes from 'prop-types'
import {observer} from 'mobx-react';
import {autorun , observable} from 'mobx';

@observer
export default class Criterion extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {criterion, mode} = this.props;
        console.log("keys: " + JSON.stringify(Object.keys(criterion)))

        const {Id, Value, UncertaintyValues, auto, codes, heading, info, uncertaintyDisabled } = criterion;
        const showHeading = !mode || mode.indexOf("noheading") < 0
        const setUncertainty = e => {
            // console.log("setUncertainty check: " + e.target.value + " | checked: " + e.target.checked)
            if( e.target.checked) {
                UncertaintyValues.push(parseInt(e.target.value))
            } else {
                UncertaintyValues.remove(parseInt(e.target.value))
            }
        }

        // consol.log("##info:" + JSON.stringify(criterion))

        // console.log("head " + heading)
        // console.log("val " + Value) // + "|" + Id)
        // console.log("udis " + JSON.stringify(uncertaintyDisabled))
        // console.log("uval " + JSON.stringify(UncertaintyValues))
        // console.log("auto " + auto)


        // const logthis = criterion.CriteriaLetter === "A"

        return(
            <div className="criterion">
            {showHeading ? <div><h4>{heading}</h4><p>{info}</p></div> : null}
              
            {/* {codes.map(kode => {  
                const onChangeRadio = e => {
                    // console.log("radio2 change")
                    if (!auto) {
                        criterion.Value = parseInt(e.target.value)
                    }
                } 
                const onChangeCheckbox = e => {
                    // console.log("check2 change")
                    setUncertainty(e)
                }
                const radiooptional = {};
                const checkboxoptional = {};
                const disabled = kode.Text === null
                if(Value !== undefined) {
                    radiooptional.checked = (kode.Value === Value)
                }
                if(UncertaintyValues !== undefined) {
                    checkboxoptional.checked = UncertaintyValues.indexOf(kode.Value) > -1;
                }

                // console.log("VVV " + value + " " + Value + " # " + radiooptional.checked)
                // console.log("name " + name)
                checkboxoptional.disabled = this.context.readonly || disabled || uncertaintyDisabled.indexOf(kode.Value) > -1 
                radiooptional.disabled = this.context.readonly || disabled || auto


                // if (logthis) {
                //     console.log("level " + kode.Value + "/\\" + Value + "#" + radiooptional.checked)
                // }


                return <div key={kode.Value} className="uncertainty">      
                    <div>
                        {auto ?
                            <div className={"criteriaCheck" + (radiooptional.checked ? " glyphicon glyphicon-ok" : "")}>&nbsp;</div> :
                            <input
                            value={kode.Value}
                            type="radio"
                            onChange={onChangeRadio}
                            {...radiooptional} />
                        }
                        <input
                        value={kode.Value}
                        type="checkbox"
                        onChange={onChangeCheckbox}
                        {...checkboxoptional} />
                        {kode.Text}
                    </div>
                </div>})}  */}
            </div>
        );
	}
}

Criterion.propTypes = {
    criterion: PropTypes.object,
}


Criterion.contextTypes = {
    readonly: PropTypes.bool
}

