
import React from 'react';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents';
import {action, autorun, extendObservable, observable, toJS} from "mobx"
import auth from './authService'



@observer
export default class AssessmentMoveHorizon extends React.Component {
    constructor(props) {
        super(props)
        const {evaluationContext} = props
        this.onMoveAssessment = () => {
            props.onMoveAssessment(clone)
        }
        // autorun(() => 
        //     newAssessment.ekspertgruppe = this.props.appState.expertgroup
        // )
    }

    @action onSetEkspertgruppe(e) {
        this.props.appState.ekspertgruppe = e.target.value
    }

    render(props) {
        const {appState} = this.props
        if (window.appInsights) {
            window.appInsights.trackPageView({name: 'MoveAssessmentHorizon'});
        }
        const labels = appState.codeLabels
        const rolle = appState.roleincurrentgroup
        return (
            <div>                
                <div className="well">                    
                    <div className="row">
                        <div className="col-md-12">
                            <h3>Flytt horisontskanning/risikovurdering</h3>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



