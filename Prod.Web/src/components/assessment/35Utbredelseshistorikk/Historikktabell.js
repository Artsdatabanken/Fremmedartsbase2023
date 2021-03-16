import React from 'react'
import {observer} from 'mobx-react'
import KollapsetSpredningsrad from './KollapsetSpredningsrad'
import EkspandertSpredningsrad from './EkspandertSpredningsrad'

@observer
export default class HistorikkTabell extends React.Component {
    render() {
        const {historikk: list, fabModel} = this.props
        const labels = fabModel.kodeLabels.DistributionHistory
        const vurdering = fabModel.vurdering
        const scientificNameId = vurdering.EvaluatedScientificNameId
        const taxonId = vurdering.TaxonId
        return (
            <table className="table table-striped table-hover">
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
                        <th>{labels.historyCounty}</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {HistorikkTabell.renderRows(list, fabModel, taxonId, scientificNameId)}
                </tbody>
            </table>
        )
    }

    static renderRows(list, fabModel, taxonId, scientificNameId) {
        const rows = []
        list.forEach((sh) => {
            const expanded = fabModel.artskartModel.expandedSpreadHistory == sh
            rows.push(<KollapsetSpredningsrad
                id={sh.Id}
                key={sh.Id}
                detaljer={sh}
                expanded={expanded}
                fabModel={fabModel} />)
            if (expanded) 
                rows.push(<EkspandertSpredningsrad
                    id={sh.Id}
                    key={`Expanded${sh.Id}`}
                    detaljer={sh}
                    fabModel={fabModel}
                    taxonId={taxonId}
                    scientificNameId={scientificNameId} />)
        })
        return rows
    }
}
