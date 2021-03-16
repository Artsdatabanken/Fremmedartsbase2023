import React from 'react';
import riskLevel from './riskLevel';
import {observer} from 'mobx-react';

@observer
export default class Risikomatrise extends React.Component {
    renderRisikomatrise(size, invasjonspotensiale, ecoeffect, invasjonUncertainty, ecoeffectUncertainty ) {
        const grid = []
        const rutesize = size/4;
        const getColor = lev => riskLevel.riskColors[lev]
        //matrise
        for(let x = 0; x < 4; x++) {
            for(let y = 0; y < 4; y++) {
                let lev = riskLevel.riskLevelMatrise[y][x]
                let xoffset = x * rutesize
                let yoffset = y * rutesize
                let elem = <rect key={y*10 + x} x={xoffset} y={yoffset} width={rutesize-2} height={rutesize-2} style={{fill:getColor(lev), strokeWidth:2, stroke:"#EEE"}} />
                grid.push(elem)
            }
        }
        
        //uncertainty markers
        for(let inv of invasjonUncertainty) {
            for(let eco of ecoeffectUncertainty) {
                const xoffset = inv * rutesize
                const yoffset = (3 - eco) * rutesize
                const isDiagonal = inv != invasjonspotensiale && eco != ecoeffect
                const strokeColor = isDiagonal ? "#FCA" : "#D84"
                const elem1 = <rect key={"uncertain" + inv + eco} x={xoffset} y={yoffset} width={rutesize-2} height={rutesize-2} style={{fill:"none", strokeWidth:2, strokeDasharray:"7,0", stroke:strokeColor}} />
                grid.push(elem1)
            }
        }

        //risklevel marker 
        const xoffset = invasjonspotensiale * rutesize
        const yoffset = (3 - ecoeffect) * rutesize
        const elem = <rect key={"risk"} x={xoffset} y={yoffset} width={rutesize-2} height={rutesize-2} style={{fill:"none", strokeWidth:4, stroke:"#C42"}} />
        grid.push(elem)

        return grid
    }

    render() {
        const {invasjonspotensiale, ecoeffect, invasjonUncertaintyLevels, ecoeffectUncertaintyLevels, elementsize, labels} = this.props;
        const size = elementsize ? elementsize : 200 
        const textStyle = { fontSize: 16}
        return(
            <svg width={size} height={size}>
                <g transform="translate(28,0)">
                    {this.renderRisikomatrise(size - 28, invasjonspotensiale, ecoeffect, invasjonUncertaintyLevels, ecoeffectUncertaintyLevels)}
                </g>
                <text 
                    transform={"translate(20," + (size - 28) + ")rotate(270)"}
                    style={textStyle}>
                    {labels.ecologicalEffect} -->
                </text>
                <text 
                    transform={"translate(28," + (size - 9) + ")"}
                    style={textStyle}>
                    {labels.invationPotential} -->
                </text>
            </svg>
        );
	}
}

Risikomatrise.propTypes = {
    invasjonspotensiale: React.PropTypes.number.isRequired,
    ecoeffect: React.PropTypes.number.isRequired,
}


