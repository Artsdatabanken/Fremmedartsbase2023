import React from 'react';
import {observer} from 'mobx-react';
import * as Xcomp from '../observableComponents';

class ReferenceDbRow extends React.Component {
    constructor() {
        super()
    }
    render() {
        const {reference, addReference, visDetalj, labels} = this.props
        const gLabels = labels.General
        const nbsp = "\u00a0"
        return (
            <tr>
                <td>
                    <Xcomp.Button primary xs
                        disabled={this.context.readonly}
                        onClick={() => addReference(reference)}
                    >{gLabels.add}</Xcomp.Button>
                </td>
                <td>
                    <span>{reference.referenceString}</span>
                </td>
                <td>
                    <span>{reference.type}</span>
                </td>
                <td>
                    <Xcomp.Button primary xs 
                        disabled={this.context.readonly}
                        onClick={() => visDetalj(reference)}
                    >{gLabels.showDetails}</Xcomp.Button>
                </td>
            </tr>
        )
    }
}

export default observer(ReferenceDbRow);
