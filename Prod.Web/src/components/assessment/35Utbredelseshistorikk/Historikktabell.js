import React from 'react'
import {observer} from 'mobx-react'
import KollapsetSpredningsrad from './KollapsetSpredningsrad'
import EkspandertSpredningsrad from './EkspandertSpredningsrad'

@observer
export default class HistorikkTabell extends React.Component {
    render() {
        const {historikk, fabModel} = this.props
        const labels = fabModel.codeLabels.DistributionHistory
        const vurdering = fabModel.assessment
        const scientificNameId = vurdering.evaluatedScientificNameId
        const taxonId = vurdering.taxonId
        const list = historikk
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
            console.log(sh)
            const expanded = fabModel.artskartModel.expandedSpreadHistory == sh
           /* rows.push(<KollapsetSpredningsrad
                id={sh.id}
                key={sh.id}
                detaljer={sh}
                expanded={expanded}
                fabModel={fabModel} />)*/
            if (!expanded) 
                rows.push(<EkspandertSpredningsrad
                    id={sh.id}
                    key={`Expanded${sh.id}`}
                    detaljer={sh}
                    fabModel={fabModel}
                    taxonId={taxonId}
                    scientificNameId={scientificNameId} />)
        })
        return rows
    }
}
