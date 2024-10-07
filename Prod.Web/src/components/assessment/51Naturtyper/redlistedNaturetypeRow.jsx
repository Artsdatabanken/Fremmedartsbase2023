import { extendObservable, action } from 'mobx';
import { observer, inject } from 'mobx-react';


const kodeTekst = (koder, verdi) => koder.filter(item => item.Value === verdi).map(item => item.Text)[0] || verdi

export class RedlistedNaturetypeRad extends React.Component {
    constructor(props) {
        super()
        const { naturtype } = props;
        extendObservable(this, {
            showModal: false,
            hideStateChange: false
        })
        this.updateNaturetype = action((upd) => {
            const nt = naturtype
            nt.TimeHorizon = upd.TimeHorizon
            nt.ColonizedArea = upd.ColonizedArea
            nt.StateChange.replace(upd.StateChange)
            nt.AffectedArea = upd.AffectedArea
            nt.Background = upd.Background
            this.showModal = false
        })
    }

    render() {
        const { naturtype, appState } = this.props;
        const nt = naturtype
        const koder = appState.koder
        const stateChangLabel = nt.stateChange.map(sc => kodeTekst(koder.tilstandsendringer, sc)).join('\n')
        return (
            <tr>
                <td>{nt.redlistedNatureTypeName}</td>
                <td>{nt.category}</td>
                <td>{kodeTekst(koder.timeHorizon, nt.timeHorizon)}</td>
                <td>{kodeTekst(koder.colonizedArea, nt.colonizedArea)}</td>
                <td>{stateChangLabel}</td>
                <td>{kodeTekst(koder.affectedArea, nt.affectedArea)}</td>
            </tr>
        );
    }
}

export default inject("appState")(observer(RedlistedNaturetypeRad));
