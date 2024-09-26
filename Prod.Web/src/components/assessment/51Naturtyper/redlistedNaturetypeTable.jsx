import React from 'react';
import { observer } from 'mobx-react';
import RedlistedNaturetypeRad from './naturtypeRad'


class RedlistedNaturetypeTable extends React.Component {
    render() {
        const {naturetypes, labels, canRenderTable, appState} = this.props;
        const ntLabels = labels.NatureTypes
        console.log(naturetypes)
        return(
            <table className="table">
                <colgroup>
                    <col  style={{width: "20%"}}/>
                    <col  style={{width: "10%"}}/>
                    <col  style={{width: "10%"}}/>
                    <col  style={{width: "12%"}}/>
                    <col  style={{width: "20%"}}/>
                    <col  style={{width: "12%"}}/>
                    <col  style={{width: "5%"}}/>
                </colgroup>
                <thead>
                    <tr>
                        <th>{ntLabels.redlistName}</th>
                        <th>{ntLabels.category}</th>
                        <th>{ntLabels.timeHorizon}</th>
                        <th>{ntLabels.colonizedArea}</th>
                        <th>{ntLabels.stateChange}</th>
                        <th>{ntLabels.affectedArea}</th>
                        {/*<th>&nbsp;</th>*/}
                    </tr>
                </thead>
                <tbody>
                    {canRenderTable 
                    ? naturetypes.map(nt => { 
                        const deleteRow = () => naturetypes.remove(nt)
                        const key = nt.redlistedNatureTypeName + nt.timeHorizon + nt.colonizedArea + nt.stateChange.join(';') + nt.affectedArea
                        return <RedlistedNaturetypeRad key={key} naturtype={nt} appState={appState} /> }) 
                    : null}
                </tbody>
            </table>
        )
    }
}

export default (observer(RedlistedNaturetypeTable));