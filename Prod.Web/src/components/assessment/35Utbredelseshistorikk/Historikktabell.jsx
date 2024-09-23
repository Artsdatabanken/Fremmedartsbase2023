import React from 'react'
import {observer} from 'mobx-react'
import KollapsetSpredningsrad from './KollapsetSpredningsrad'
import EkspandertSpredningsrad from './EkspandertSpredningsrad'

@observer
export default class HistorikkTabell extends React.Component {
    render() {
        const {historikk, appState, disabled} = this.props
        const labels = appState.codeLabels.DistributionHistory
        const vurdering = appState.assessment
        const scientificNameId = vurdering.evaluatedScientificNameId
        const taxonId = vurdering.taxonId
        const list = historikk
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th />
                        <th>{labels.historyFrom}</th>
                        <th>{labels.historyTo}</th>
                        <th>{labels.historyLocation}</th>
                        <th>{labels.historyCount}</th>
                        <th>{labels.historyAreaOccupancy}<br />km&#178;</th>
                        <th>{labels.historyExtentOfOccurrence}<br />km&#178;</th>
                        <th>{labels.historyComment}</th>
                        <th style={{textAlign: "center"}}>{labels.historyCounty}</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {HistorikkTabell.renderRows(list, appState, taxonId, scientificNameId, vurdering, disabled)}
                </tbody>
            </table>
        )
    }

    static renderRows(list, appState, taxonId, scientificNameId, vurdering, disabled) {
        const rows = []
        list.forEach((sh) => {
            rows.push(<EkspandertSpredningsrad
                id={sh.id}
                key={`Expanded${sh.id}`}
                detaljer={sh}
                appState={appState}
                taxonId={taxonId}
                scientificNameId={scientificNameId}
                assessment={vurdering}
                disabled={disabled} />)
        })
        return rows
    }
}
