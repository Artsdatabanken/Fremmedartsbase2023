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
        const labels = appState.codeLabels; 
        const userName = auth.userName

        //console.log("ROLLE" + JSON.stringify(rolle))
        //console.log("* * * * USERNAME: " + userName + " * * * * *")

        // if (ekspertgruppeArter.error)
        //     return (
        //         <div style={{
        //             color: "red"
        //         }}>{ekspertgruppeArter.error}</div>
        //     )
        // let filter = appState.speciesNameFilter
        //     ? appState.speciesNameFilter
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
                                width: '1%'
                            }}/>
                            <th>{labels.SelectAssessment.scientificName}</th>
                            <th>Populærnavn</th>
                            <th>Horisontskannes</th>
                            <th>Kategori 2018</th>
                            <th>Kategori 2023</th>
                            {/*<th>{labels.SelectAssessment.duration}</th>*/}
                            <th>{labels.SelectAssessment.lastSaved}</th>
                            
                            <th>Kommentar</th>
                            <th>Vurderingsstatus</th>
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
                            onOpen={v => appState.open(v)}
                            onLock={action(v => appState.lockFraHode(v))}
                            onUnlock={action(v => appState.unlockFraHode(v))}/>)}
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
