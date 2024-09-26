import React from 'react';
import PropTypes from 'prop-types';
import { observer, Observer } from 'mobx-react';
import * as Xcomp from './observableComponents';
import LoadingHoc from './LoadingHoc'
import Loading from './Loading';
import { action } from "mobx"


class AssessmentReport extends React.Component {
    handleSetEkspertgruppe = action((e) => {
        this.props.appState.ekspertgruppe = e.target.value
    })
    update() {
        console.log("refreshReport")
        this.props.appState.refreshReport()
    }

    render() {
        const { appState, viewModel } = this.props
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
                                    codes={appState.ekspertgrupper.map(eg => ({ value: eg.Id, text: eg.Name }))} />
                            </div>
                            <div className="col-md-6">
                                <h4>{labels.SelectAssessment.filter}</h4>
                                <Xcomp.String
                                    observableValue={[appState, "speciesNameFilter"]}
                                    placeholder="Søk" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <Xcomp.Button primary onClick={() => this.update()}>{"Vis rapport"}</Xcomp.Button>
                            </div>
                        </div>
                    </div>

                    {ekspertgruppeReport ? <ReportTable {...this.props} ekspertgruppeReport={ekspertgruppeReport} /> : <Loading />}
                </div>
            </div>
        )
    }
}

AssessmentReport.propTypes = {
    appState: PropTypes.object.isRequired
}

const ReportTable = (props) => <Observer>{() => {
    const { appState, ekspertgruppeReport } = props

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
}}</Observer>

const ReportRow = (props) => <Observer> {() => {
    const vurdering = props.vurdering
    const r = vurdering
    const labels = props.labels
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
}}</Observer>

export default (observer(AssessmentReport));