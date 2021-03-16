import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents';
import LoadingHoc from './LoadingHoc'
import {action} from "mobx"

@observer
export default class AssessmentReport extends React.Component {
    @action handleSetEkspertgruppe(e) {
        this.props.appState.ekspertgruppe = e.target.value
    }
    update() {
        console.log("refreshReport")
        this
            .props
            .appState
            .refreshReport()
    }

    render() {
        const {appState, viewModel} = this.props
        const labels = appState.kodeLabels
        const ekspertgruppeReport = appState.ekspertgruppeReport
        
        // const {velgVurderingTabs} = viewModel
        return (
            <div>
                <div>
                    <div className="well">
                        <div className="row">
                            
                            <div className="col-md-6">
                                <h4>{labels.SelectAssessment.expertgroup}</h4>
                                <Xcomp.StringEnum
                                    observableValue={[appState, 'ekspertgruppe']}
                                    codes={appState.ekspertgrupper.map(eg => ({value: eg.Id, text: eg.Name}))} />
                            </div>
                            <div className="col-md-6">
                                <h4>{labels.SelectAssessment.filter}</h4>
                                <Xcomp.String
                                    observableValue={[appState, "speciesNameFilter"]}
                                    placeholder="Søk"/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <Xcomp.Button primary onClick={() => this.update()}>{"Vis rapport"}</Xcomp.Button>
                            </div>
                        </div>
                    </div>

                    <ReportTable {...this.props} ekspertgruppeReport={ekspertgruppeReport}/>
                </div>
            </div>
        )
    }
}

AssessmentReport.propTypes = {
    appState: PropTypes.object.isRequired
}

@LoadingHoc('ekspertgroupReport')
@observer
export class ReportTable extends React.Component {
    render() {
        const {appState, ekspertgruppeReport} = this.props

        const labels = appState.kodeLabels
        if (ekspertgruppeReport.error) 
            return (
                <div style={{
                    color: "red"
                }}>{ekspertgruppeReport.error}</div>
            )
        let filter = appState.speciesNameFilter
            ? appState.speciesNameFilter
            : ''
        filter = filter.toLowerCase()
        return (
            <div>
                <table className="table table-striped vurderinger">
                    <thead>
                        <tr>
                            <th>{labels.SelectAssessment.scientificName}</th>
                            <th></th>
                            <th>Besk</th>
                            <th>Utbr</th>
                            <th>Spred</th>
                            <th>Inv</th>
                            <th>Konk</th>
                            <th>A</th>
                            <th>B</th>
                            <th>C</th>
                            <th>D</th>
                            <th>E</th>
                            <th>F</th>
                            <th>Ref</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ekspertgruppeReport.filter(ega => {
                            return filter === "" || ega
                                .ScientificName
                                .toLowerCase()
                                .indexOf(filter) > -1 || (ega.VernacularName && ega.VernacularName.toLowerCase().indexOf(filter) > -1)
                        }).map(ega => <ReportRow
                            key={ega.ScientificName}
                            vurdering={ega}
                            labels={labels}
                            />)}
                    </tbody>
                </table>
            </div>
        )
    }
}

@observer
class ReportRow extends React.Component {
    render() {
        const vurdering = this.props.vurdering
        const r = vurdering
        const labels = this.props.labels
        const style = {
                cursor: "pointer"
            }
        return (
            <tr key={vurdering.VurderingId}>
                <td>
                    <span>{vurdering.ScientificName}</span>
                </td>
                <td>
                    Ping
                </td>
                <td>Pang</td>
            </tr>
        )
    }
}