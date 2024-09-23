import React from 'react';
// import ReactDOM from 'react-dom';
import {observer, inject} from 'mobx-react';

class ArrivedCountryFrom extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {appState:{assessment}, appState} = this.props;
        const vurdering = assessment
        // const labels = appState.codeLabels
        const koder = appState.koder
        const values = vurdering.arrivedCountryFrom
        const codes = koder.ArrivedCountryFrom
        const originCode = codes.find(code => code.Value === "origin")
        const otherCode = codes.find(code => code.Value === "other")
        const otherRegionCode = codes.find(code => code.Value === "otherRegion")
        const unknownCode = codes.find(code => code.Value === "unknown")
        return(
            <ul style={{paddingLeft: "0px"}}>
                {vurdering.alienSpeciesCategory === 'RegionallyAlien' 
                ? <li className="checkbox">
                    <label>
                        <input type="checkbox" label={otherRegionCode.Text} checked={values.indexOf(otherRegionCode.Value) !== -1}
                            disabled={this.context.readonly}
                            onChange={e => {
                                if(e.target.checked) {
                                    if(values.indexOf(otherRegionCode.Value) === -1) {
                                        values.push(otherRegionCode.Value)
                                        if(values.indexOf(unknownCode.Value) > -1) {
                                            values.remove(unknownCode.Value)
                                        } 
                                    } 
                                }
                                else {
                                    values.remove(otherRegionCode.Value)
                                }
                            }}

                        />{otherRegionCode.Text}
                    </label>
                </li>
                : null}
                <li className="checkbox">
                    <label>
                        <input type="checkbox" label={originCode.Text} checked={values.indexOf(originCode.Value) !== -1}
                            disabled={this.context.readonly}
                            onChange={e => {
                                if(e.target.checked) {
                                    if(values.indexOf(originCode.Value) === -1) {
                                        values.push(originCode.Value)
                                        if(values.indexOf(unknownCode.Value) > -1) {
                                            values.remove(unknownCode.Value)
                                        } 
                                    } 
                                }
                                else {
                                    values.remove(originCode.Value)
                                }
                            }}
                        />{originCode.Text}
                    </label>
                </li>
                <li className="checkbox">
                    <label>
                        <input type="checkbox" label={otherCode.Text} checked={values.indexOf(otherCode.Value) !== -1}
                            disabled={this.context.readonly}
                            onChange={e => {
                                if(e.target.checked) {
                                    if(values.indexOf(otherCode.Value) === -1) {
                                        values.push(otherCode.Value)
                                        if(values.indexOf(unknownCode.Value) > -1) {
                                            values.remove(unknownCode.Value)
                                        } 
                                    } 
                                }
                                else {
                                    values.remove(otherCode.Value)
                                }
                            }}
                        />{otherCode.Text}
                    </label>
                </li>
                <li className="checkbox">
                    <label>
                        <input type="checkbox" label={unknownCode.Text} checked={values.indexOf(unknownCode.Value) !== -1}
                            disabled={this.context.readonly}
                            onChange={e => {
                                if(e.target.checked) {
                                    if(values.indexOf(unknownCode.Value) === -1) {
                                        values.push(unknownCode.Value)
                                    }
                                }
                                else {
                                    values.remove(unknownCode.Value)
                                }
                            }}
                        />{unknownCode.Text}
                    </label>
                </li>
            </ul>)
    }
}

export default inject("appState")(observer(ArrivedCountryFrom));
