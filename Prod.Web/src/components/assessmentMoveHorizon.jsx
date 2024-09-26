
import React from 'react';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents';
import { action, autorun, extendObservable, observable, toJS, makeObservable } from "mobx";
import auth from './authService'
import catimg from '../cat.gif';
// import catimg from 'url:../cat.gif';
// const catimg = require('../cat.gif') 

const  state = observable({
    potensiellDørstokkart: "",
})


class AssessmentMoveHorizon extends React.Component {
    constructor(props) {
        super(props)

        makeObservable(this, {
            onSetEkspertgruppe: action
        });

        this.onMoveAssessmentHorizon = () => {
            const stateclone = toJS(state)
            props.onMoveAssessmentHorizon(stateclone)
        }
    }

    onSetEkspertgruppe(e) {
        this.props.appState.ekspertgruppe = e.target.value
    }

    render(props) {
        const {appState} = this.props
        const codes = appState.koder
        const labels = appState.codeLabels
        console.log(appState.showTheCat)
        if (window.appInsights) {
            window.appInsights.trackPageView({name: 'MoveAssessmentHorizon'});
        }
        const rolle = appState.roleincurrentgroup
        return (
            <div>             
                <fieldset className="well">
                <div>
                        <img src={catimg} style={{width: '666px'}}></img>
                    </div>
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
                    {appState.showTheCat ? 
                    <div>
                        <img src={catimg} style={{width: '666px'}}></img>
                    </div> : null}
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

export default observer(AssessmentMoveHorizon);



