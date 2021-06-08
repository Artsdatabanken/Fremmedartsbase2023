import React from 'react';
import {autorun, extendObservable, observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

@observer
export default class ScoreUnsure extends React.Component {
    constructor(props) {
        super()
        const {appState, critScores, firstValue, secondValue} = props;
       
    }
    render() {
        const {appState:{assessment}, appState, critScores, firstValue, secondValue} = this.props;
        const riskAssessment = assessment.riskAssessment    
        //const nts = appState.naturtyper
       
       // const doms = appState.dominansSkog
        const koder = appState.koder
       // const firstValue = firstValue
        //const secondValue = secondValue
        // console.log("labels " + JSON.stringify(labels))

        return <div style={{display: 'flex'}}>
            
            <Xcomp.MultiselectArray
                                className={"scores"}
                                observableValue={[riskAssessment, firstValue]} 
                                codes={koder.scores}
                                mode="check"/>

            <Xcomp.MultiselectArray
                                observableValue={[riskAssessment, secondValue]} 
                                codes={critScores}
                                mode="check"/>

        </div>
    }
}
