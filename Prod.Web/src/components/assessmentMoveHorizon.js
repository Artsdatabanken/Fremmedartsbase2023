
import React from 'react';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents';
import {action, autorun, extendObservable, observable, toJS} from "mobx"
import auth from './authService'


const  state = observable({
    potensiellDørstokkart: "",
})


@observer
export default class AssessmentMoveHorizon extends React.Component {
    constructor(props) {
        super(props)
        const {evaluationContext} = props
        this.onMoveAssessmentHorizon = () => {
            const stateclone = toJS(state)
            props.onMoveAssessmentHorizon(stateclone)
        }
    }

    @action onSetEkspertgruppe(e) {
        this.props.appState.ekspertgruppe = e.target.value
    }

    render(props) {
        const {appState} = this.props
        const codes = appState.koder
        const labels = appState.codeLabels
        if (window.appInsights) {
            window.appInsights.trackPageView({name: 'MoveAssessmentHorizon'});
        }
        const rolle = appState.roleincurrentgroup
        return (
            <div>             
                <fieldset className="well">
                    <div className="row">
                        <div className="col-md-12">
                            <h3>Flytt mellom horisontskanning og risikovurdering</h3>
                        </div>
                    </div>
                    <div className="row">                            
                        <div className="col-md-6">
                            <Xcomp.StringEnum observableValue={[state, "potensiellDørstokkart"]} mode="radio" codes={codes.SpeciesStatus}/>
                        </div>
                    </div>
                    <div className="row">                            
                        <div className="col-md-6" style={{display: 'flex'}}>
                            {/* <div>{labels.SelectAssessment.NBWritingAccess}</div> */}
                            <Xcomp.Button primary onClick={this.onMoveAssessmentHorizon} disabled={!rolle.writeAccess || !state.potensiellDørstokkart}>Flytt vurdering</Xcomp.Button>
                            {state.potensiellDørstokkart
                                ? !rolle.writeAccess 
                                    ? <div style={{color: 'red'}}>{labels.SelectAssessment.accessDenied}</div> 
                                    : null
                                : null}
                        </div>
                    </div>
                </fieldset>
            </div>
        )
    }
}



