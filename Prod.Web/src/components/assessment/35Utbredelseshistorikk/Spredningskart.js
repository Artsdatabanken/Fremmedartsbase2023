import React from 'react'
import Fylkeskart from '../Fylkeskart'
import {observer} from 'mobx-react'

@observer
export default class Spredningskart extends React.Component {
    render() {
        const styles = {
            none: {
                normal: {
                    stroke: "#777",
                    fill: "#ffffd4"
                },
                highlight: {
                    stroke: "#000",
                    fill: "#cc4c02"
                }
            },
            potential: {
                normal: {
                    stroke: "#777",
                    fill: "#fed98e"
                },
                highlight: {
                    stroke: "#000",
                    fill: "#ffffd4"
                }
            },
            assumed: {
                normal: {
                    stroke: "#555",
                    fill: "#fe9929"
                },
                highlight: {
                    stroke: "#000",
                    fill: "#ffffd4"
                }
            },
            known: {
                normal: {
                    stroke: "#555",
                    fill: "#cc4c02"
                },
                highlight: {
                    stroke: "#000",
                    fill: "#fe9929"
                }
            }
        }
        const {map, countyListLand, states, showLegend} = this.props
        const fylkerArray = countyListLand.map((fylke) => {
            const active = Spredningskart.getCurrentState(fylke.Value, states)
            return {id: fylke.Value, title: `${fylke.Text}: ${active.title}`, style: active.key}
        })

        const fylker = fylkerArray.reduce((o, currentArray) => {
            const key = currentArray.id,
                value = currentArray
            o[key] = value
            return o
        }, {})
        return (
            <div>
                <div style={{position:"absolute", top:0, bottom:0}}
                    onMouseLeave={() => {
                    this.paintWithState = null
                }}>
                    <Fylkeskart
                        language={
                            this.context.language === "EN" ? "NB" : this.context.language // todo: change this... ( this is done for the English language demo)
                        }
                        map={map}
                        readonly={this.props.readonly}
                        styles={styles}
                        width={this.props.width}
                        height={this.props.height}
                        onMouseLeave={() => {
                            this.paintWithState = null
                        }}
                        onMouseDown={(e, fylke) => this.handleMouseDown(e, fylke)}
                        onMouseUp={(e) => this.handleMouseUp(e)}
                        onMouseOver={(e, fylke) => this.handleMouseOver(e, fylke)}
                        fylker={fylker}/>
                </div>
                {showLegend &&
                  <Legend states={states} styles={styles} />
                }
            </div>
        )
    }

    static getCurrentState(fylke, states) {
        let defaultState = null
        for (let i = 0; i < states.length; i++) {
            const state = states[i]
            if (!state.values)
                defaultState = state
            else if (state.values[fylke])
                return state
        }
        return defaultState
    }
    getNextState(curState) {
        const currentIndex = this.getStateIndex(curState.key)
        return (currentIndex + 1) % this.props.states.length
    }
    getStateIndex(key) {
        const states = this.props.states
        for (let i = 0; i < states.length; i++)
            if (key == states[i].key)
                return i

    throw new Error(`Unknown map state ${key}`)
    }

    handleMouseOver(e, fylke) {
        e.stopPropagation()
        if (this.paintWithState == null)
            return
        this.check(fylke, this.paintWithState)
    }
    handleMouseUp(e) {
        e.stopPropagation()
        this.paintWithState = null
    }
    handleMouseDown(e, fylke) {
        e.stopPropagation()
        const states = this.props.states
        const curState = Spredningskart.getCurrentState(fylke, states)
        this.paintWithState = this.getNextState(curState)
        this.check(fylke, this.paintWithState)
    }
    check(fylke, state) {
        const states = this.props.states
        for (let i = 0; i < states.length; i++)
            if (states[i].values)
                states[i].values[fylke] = state == i
    }
}

Spredningskart.contextTypes = {
    language: React.PropTypes.string,
    readonly: React.PropTypes.bool
}

const Legend = ({states, styles})=>
    <div style={{position: 'absolute', display: 'inline-block', bottom: 50}}>
        {states.map(x => <LegendItem key={x.key} title={x.title} fill={styles[x.key].normal.fill} />)}
    </div>

const LegendItem = ({title, fill}) =>
    <div style={{display: 'inline-block', marginRight: '10px'}}>
        <span style={{
            display: 'inline-block',
            borderWidth: '1px',
            borderStyle: 'solid',
            width: '16px',
            height: '16px',
            backgroundColor: fill}} />
        <span style={{
            display: 'inline-block',
            verticalAlign: 'text-bottom'}}>
            &nbsp;{title}
        </span>
    </div>

