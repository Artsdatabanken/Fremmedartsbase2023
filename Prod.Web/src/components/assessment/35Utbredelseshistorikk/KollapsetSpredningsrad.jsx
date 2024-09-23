import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {toJS} from "mobx"
import Spredningskart from './Spredningskart'

class KollapsetSpredningsrad extends React.Component {
    render() {
        const expanded = this.props.expanded
        const style = expanded
            ? {
                backgroundColor: '#fff',
                borderTopColor: "transparent !important",
                paddingTop: "4px",
                paddingBottom: "0px"
            }
            : {
                paddingTop: "4px",
                paddingBottom: "0px"

            };
        const e = this.props.detaljer
        let regionalPresence = e.RegionalPresence;
        if (regionalPresence == null) 
            regionalPresence = []
        const appState = this.props.appState;
        const classNames = `${expanded
            ? "clickable-row tr.highlight"
            : "clickable-row"}`;
        const buttonStyle = {
            padding: 0,
            border: 'none',
            background: 'none'
        }
        Object.assign(buttonStyle, style)
        const rowStyle = {
            cursor: "pointer",
            height: "80px"
        }
        if (expanded) 
            rowStyle.boxShadow = "rgba(0, 0, 0, 0.0470588) 6px 6px 4px 0px"
        return (
            <tr
                className={classNames}
                style={rowStyle}
                key={e.id}
                onClick={() => {
                KollapsetSpredningsrad.redigerSpreadhistory(appState, e)
            }}>
                <td style={style}>
                    <span
                        className={`glyphicon glyphicon-chevron-${expanded
                        ? "down"
                        : "right"}`}/>
                </td>
                <td style={e.observationFromYear.toString().length === 0 ? {backgroundColor: "#F00" } :  style}>
                    <span>{e.observationFromYear}</span>
                </td>
                <td style={e.observationYear.toString().length === 0 ? {backgroundColor: "#F00" } :  style}>
                    <span>{e.obbservationYear}</span>
                </td>
                <td style={style}>
                    <span>{e.Location}</span>
                </td>
                <td style={style}>
                    <span>{KollapsetSpredningsrad.produkt(e.SpeciesCount, e.SpeciesCountDarkFigure)}</span>
                </td>
                <td style={style}>
                    <span>{KollapsetSpredningsrad.produkt(e.ExistenceArea, e.ExistenceAreaCountDarkFigure)}</span>
                </td>
                <td style={style}>
                    <span>{e.SpreadAreaCalculated}</span>
                </td>
                <td style={style}>
                    <span>{e.Comment}</span>
                </td>
                <td style={{position: "relative"}}>
                    {this.props.appState.evaluationContext.map == 'norge'
                        ? <Spredningskart
                                readonly
                                height="77px"
                                width="60px"
                                states={[
                                {
                                    key: 'none',
                                    title: 'ingen'
                                }, {
                                    key: 'known',
                                    title: 'kjent',
                                    values: e.regionalPresenceKnown
                                }, {
                                    key: 'assumed',
                                    title: 'antatt',
                                    values: e.regionalPresenceAssumed
                                }
                            ]}
                                countyListLand={this.props.appState.artskartModel.koder.countyListLand}/>
                        : <span>{e.Regions}</span>}
                </td>
                <td style={style}>
                    <button
                        style={buttonStyle}
                        disabled={this.context.readonly}
                        className="glyphicon glyphicon-trash"
                        onClick={() => {
                        KollapsetSpredningsrad.fjernSpreadhistory(appState.vurdering, e)
                    }}/>
                </td>
            </tr>
        )
    }

    static produkt(a, b) {
        if (!a) 
            return ''
        if (!b) 
            b = 1
        return (
            <div>
                <b>{a * b}</b><br/>({a}&nbsp;*&nbsp;{b})</div>
        )
    }

    static overførTilNåværendeOgPotensiell(event, vurdering, rad) {
        event.stopPropagation()

        vurdering.CurrentIndividualCount = rad.SpeciesCount
        vurdering.CurrentIndividualCountLowMultiplier = null //rad.CurrentIndividualCountMultiplier
        vurdering.CurrentIndividualCountMultiplier = rad.SpeciesCountDarkFigure
        vurdering.CurrentIndividualCountHighMultiplier = null //rad.CurrentIndividualCountMultiplier

        vurdering.CurrentExistenceArea = rad.ExistenceArea
        vurdering.CurrentExistenceAreaLowMultiplier = null //rad.ExistenceAreaCountDarkFigure
        vurdering.CurrentExistenceAreaMultiplier = rad.ExistenceAreaDarkFigure
        vurdering.CurrentExistenceAreaHighMultiplier = null //rad.ExistenceAreaCountDarkFigure

        vurdering.CurrentRegionalPresence = toJS(rad.RegionalPresence)

        vurdering.CurrentSpreadArea = rad.SpreadAreaCalculated
    }

    static fjernSpreadhistory(vurdering, value) {
        vurdering
            .SpreadHistory
            .remove(value)
    }

    static redigerSpreadhistory(appState, rad) {
        appState
            .artskartModel
            .expandSpreadHistory(rad)
    }
}

export default observer(KollapsetSpredningsrad);
KollapsetSpredningsrad.contextTypes = {
    readonly: PropTypes.bool
}