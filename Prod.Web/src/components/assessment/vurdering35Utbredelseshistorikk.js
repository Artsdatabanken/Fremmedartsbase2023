import config from '../../config';
import React from 'react'
import {observer} from 'mobx-react'
import Utbredelseshistorikk from './35Utbredelseshistorikk/Utbredelseshistorikk'
import UtbredelseIDag from './35Utbredelseshistorikk/UtbredelseIDag'
import UtbredelseshistorikkInnenlands from './35Utbredelseshistorikk/UtbredelseshistorikkInnenlands'

@observer
export default class Vurdering35Utbredelseshistorikk extends React.Component {
    render() {
        const {vurdering, fabModel} = this.props
        return (
            <div>
                <ul className="nav_menu">
                    <li><b>Utbredelse</b></li>
                    <li><b>Naturtyper</b></li>                    
                </ul>
                {config.showPageHeaders
                    ? <h3>{fabModel.kodeLabels.DistributionHistory.heading}</h3>
                    : <br/>}
                {/*<UtbredelseshistorikkInnenlands vurdering={vurdering} fabModel={fabModel}/>
                <UtbredelseIDag vurdering={vurdering} fabModel={fabModel}/>
                <Utbredelseshistorikk vurdering={vurdering} fabModel={fabModel}/>*/}
            </div>
        )
    }
}
