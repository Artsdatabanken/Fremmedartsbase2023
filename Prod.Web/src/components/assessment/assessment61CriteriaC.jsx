import React from 'react';
import {observer, inject} from 'mobx-react';
import * as Xcomp from './observableComponents';
import Criterion from './criterion'

@inject("appState")
@observer
export default class Assessment61CriteriaC extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        const {appState:{assessment:{riskAssessment}}, appState, } = this.props;
        const critC = riskAssessment.critC

        return (
            <fieldset className="well">
                <h4>{critC.heading}</h4>
                <p>{critC.info}</p>
                <Criterion criterion={critC} mode="noheading" disabled={true} appState={appState}/>
            </fieldset>
        );
    }
}
