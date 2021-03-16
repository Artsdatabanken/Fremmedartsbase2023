import React, {Component} from 'react'
import {inject, observer} from 'mobx-react';
//import * as Xcomp from './observableComponents';
import {action} from "mobx"
import SelectAssessmentRow from './selectAssessmentRow'
import auth from './authService'

@inject('appState')
@observer
export default class SelectAssessmentTable extends Component {
    render() {
        const {assessmentList, rolle, appState} = this.props
        const assessmentModel = appState
        //console.log("ROLLE" + JSON.stringify(rolle))
        const labels = appState.codeLabels; // assessmentModel.kodeLabels
        const userName = auth.userName
        // if (ekspertgruppeArter.error)
        //     return (
        //         <div style={{
        //             color: "red"
        //         }}>{ekspertgruppeArter.error}</div>
        //     )
        // let filter = assessmentModel.speciesNameFilter
        //     ? assessmentModel.speciesNameFilter
        //     : ''
        // filter = filter.toLowerCase()
        return (
            <div>
                {appState.loadingExpertGroup === true && <div className="loader"></div>}
                <table className="table table-striped vurderinger">
                    <thead>
                        <tr>
                            <th
                                style={{
                                width: '5%'
                            }}/>
                            <th>{labels.SelectAssessment.scientificName}</th>
                            <th>Populærnavn</th>
                            <th>Kategori</th>
                            <th></th>
                            {/*<th>{labels.SelectAssessment.duration}</th>*/}
                            <th>{labels.SelectAssessment.lastSaved}</th>
                            <th></th>
                            <th>Kommentar</th>
                            <th>Status</th>
                            <th>&nbsp;</th>
                            <th>&nbsp;</th>
                            {/*<th>&nbsp;</th>
                            <th>&nbsp;</th>*/}
                        </tr>
                    </thead>
                    <tbody>                        
                        {assessmentList.
                        
                        
                        // filter(ega => {
                        //     return filter === "" || ega
                        //         .ScientificName
                        //         .toLowerCase()
                        //         .indexOf(filter) > -1 || (ega.VernacularName && ega.VernacularName.toLowerCase().indexOf(filter) > -1)
                        // }).
                        
                        map(ega => <SelectAssessmentRow
                            key={ega.id} userName={userName}
                            assessment={ega}
                            updatedAt={ega.lastUpdatedAt}
                            updatedBy={ega.lastUpdatedBy}
                            labels={labels}
                            rolle={rolle}
                            onOpen={v => assessmentModel.open(v)}
                            onLock={action(v => assessmentModel.lockFraHode(v))}
                            onUnlock={action(v => assessmentModel.unlockFraHode(v))}/>)}
                    </tbody>
                </table>
            </div>
        )
    }

    // componentDidMount() {
    //     this.timerId = setInterval(() => this.update(), 20000)
    // }

    // componentWillUnmount() {
    //     clearInterval(this.timerId)
    // }

    // update() {
    //     this
    //         .props
    //         .appState
    //         .loadCurrentExpertgroupAssessmentList()
            
    // }
}
