import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import * as Xcomp from './observableComponents';
import Tabs from '../tabs'
import Criterion from './criterion'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
import Assessment61Invasjonspotensiale from './assessment61Invasjonspotensiale'
import ScoreUnsure from './51Naturtyper/scoreUnsure';
import config from '../../config'
import {codes2labels, getCriterion} from '../../utils'
import Filliste from './35Utbredelseshistorikk/Filliste'
import { KeyboardHideSharp } from '@material-ui/icons';

@observer
class SelectableRadio extends React.Component {
    // shouldComponentUpdate() {
    //     return true
    // }
    render() {
        
        const [obj, prop] = this.props.observableValue
        // console.log("Selectable" + this.props.value) console.log(" - - " +
        // obj["Selectable" + this.props.value])
        const val = this.props.value
        // const activeVal =  disabled ? "" : val
        const disabled = !obj["Selectable" + val] || this.context.readonly
        const label = this.props.label + (obj[val]
            ? "  (" + obj[val] + ")"
            : "")
        const dummy = obj[prop]
        // console.log("dummy:" + dummy) console.log(">" + prop + " (" + obj[prop] + ")
        // " + val  )
        return <div className="radio" key={val}>
            <label className={disabled
                ? "disabled"
                : ""}><input
                type="radio"
                name={"radio" + prop}
                value={val}
                checked={obj[prop] === val}
                disabled={disabled}
                onChange={(e) => obj[prop] = e.currentTarget.value}/>{label}</label>
        </div>
    }
}

// SelectableRadio.contextTypes = {
//     readonly: PropTypes.bool
// }

// return <Xcomp.Radio         label={this.props.label + (obj[val] ? "  (" +
// obj[val] + ")" : "")}         value={val}         observableValue={[obj,
// prop]}         disabled={disabled}         dummy={dummy} />

@inject("appState")
@observer
export default class AssessmentRisikovurdering extends React.Component {
    // getCriterion(riskAssessment, akse, letter) {     const result =
    // riskAssessment.criteria.filter(c => c.akse === akse && c.criteriaLetter ===
    // letter)[0];     return result; }
    render() {
        const {appState:{assessment, assessment:{riskAssessment}}, appState:{riskAssessmentTabs}, appState, } = this.props;

        // const labels = appState.kodeLabels
        const labels = appState.codeLabels
        const koder = appState.koder

        const ntLabels = labels.NatureTypes

        const existenceArea35 = assessment.CurrentExistenceAreaCalculated


        // const bassertpaValues = [
        //     {
        //         Value: "Counting",
        //         Text: "Telling"
        //     }, {
        //         Value: "Estimated",
        //         Text: "Estimert"
        //     }, {
        //         Value: "MinimumEstimate",
        //         Text: "Minimumsanslag"
        //     }
        // ];
        const crit51A = getCriterion(riskAssessment, 0, "A")
        const crit51B = getCriterion(riskAssessment, 0, "B")
        const critC = getCriterion(riskAssessment, 0, "C")

        const nbsp = "\u00a0"

        const presentValue = (f) => f === "" ? <span>᠆᠆᠆᠆᠆</span> : f

        // &#11834;
        // <h5>** Invasjonspotensiale nivå: {appState.invasjonspotensialeLevel.level + 1}
        // **</h5> <h5>** Utslagsgivende kriterier:
        // {appState.invasjonspotensialeLevel.decisiveCriteria.map(crit =>
        // crit.criteriaLetter).sort().join()} **</h5> <h5>** usikkerhet:
        // {appState.invasjonspotensialeLevel.uncertaintyLevels.slice().join(';')}
        // **</h5>**</h5>

        return (
            <div>
                {config.showPageHeaders
                    ? <h3>Invasjonspotensiale</h3>
                    : <br/>}
                    <Tabs clName={"nav_menu submenu"} tabData={riskAssessmentTabs}/>
                {
                riskAssessmentTabs.activeTab.id === 2  ?
                <Assessment62Okologiskeffekt/> :
                <Assessment61Invasjonspotensiale/>
                }
            </div>
        );
    }
}
// Vurdering51Invasjonspotensiale.propTypes = {
//     viewModel: PropTypes.object.isRequired,
//     riskAssessment: PropTypes.object.isRequired
// }
