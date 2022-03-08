import React from 'react';
import PropTypes from 'prop-types'
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
                const elem1 = <rect key={"uncertain" + inv + eco} x={xoffset} y={yoffset} width={rutesize-2} height={rutesize-2} style={{fill:"none", strokeWidth:5, strokeDasharray:"7,0", stroke:strokeColor}} />
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
        const textStyle = { fontSize: 12}
        const headingStyle = { fontSize: 16, fontWeight: "bolder"}
        return(
            <svg width={size+2*size/3} height={size+size/6}>
                <g transform="translate(80,0)">
                    {this.renderRisikomatrise(size - 28, invasjonspotensiale, ecoeffect, invasjonUncertaintyLevels, ecoeffectUncertaintyLevels)}
                </g>
                <text 
                    transform={"translate(12," + (size - 100) + ")rotate(270)"}
                    style={headingStyle}>
                    {labels.ecologicalEffect }
                </text>
                <text 
                    transform={"translate(60," + (size - 270) + ")"}
                    style={textStyle}>
                    {labels.four}
                </text>
                <text 
                    transform={"translate(50," + (size - 255) + ")"}
                    style={textStyle}>
                    {labels.high}                    
                </text>
                <text 
                    transform={"translate(60," + (size - 200) + ")"}
                    style={textStyle}>
                    {labels.three}
                </text>
                <text 
                    transform={"translate(30," + (size - 185) + ")"}
                    style={textStyle}>
                    {labels.medium}
                </text>
                <text 
                    transform={"translate(60," + (size - 130) + ")"}
                    style={textStyle}>
                    {labels.two}
                </text>
                <text 
                    transform={"translate(50," + (size - 115) + ")"}
                    style={textStyle}>
                    {labels.low}
                </text>
                <text 
                    transform={"translate(60," + (size - 70) + ")"}
                    style={textStyle}>
                    {labels.one}
                </text>
                <text 
                    transform={"translate(40," + (size - 55) + ")"}
                    style={textStyle}>
                    {labels.notKnown1 }
                </text>
                <text 
                    transform={"translate(40," + (size - 40) + ")"}
                    style={textStyle}>
                    {labels.notKnown2 }
                </text>
                <text 
                    transform={"translate(150," + (size+ size/8) + ")"}
                    style={headingStyle}>
                    {labels.invationPotential } 
                </text>
                <text 
                    transform={"translate(110," + (size - 10) + ")"}
                    style={textStyle}>
                    {labels.one}
                </text>
                <text 
                    transform={"translate(110," + (size + 5) + ")"}
                    style={textStyle}>
                    {labels.invLow}
                </text>
                <text 
                    transform={"translate(180," + (size - 10) + ")"}
                    style={textStyle}>
                    {labels.two}
                </text>
                <text 
                    transform={"translate(160," + (size + 5) + ")"}
                    style={textStyle}>
                    {labels.limited}
                </text>
                <text 
                    transform={"translate(250," + (size - 10) + ")"}
                    style={textStyle}>
                    {labels.three}
                </text>
                <text 
                    transform={"translate(230," + (size + 5) + ")"}
                    style={textStyle}>
                    {labels.moderate}
                </text>
                <text 
                    transform={"translate(310," + (size - 10) + ")"}
                    style={textStyle}>
                    {labels.four}
                </text>
                <text 
                    transform={"translate(300," + (size + 5) + ")"}
                    style={textStyle}>
                    {labels.invHigh}
                </text>
            </svg>
        );
	}
}

Risikomatrise.propTypes = {
    invasjonspotensiale: PropTypes.number.isRequired,
    ecoeffect: PropTypes.number.isRequired,
}


