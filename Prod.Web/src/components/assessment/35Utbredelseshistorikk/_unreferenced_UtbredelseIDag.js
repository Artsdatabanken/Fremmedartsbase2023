import React from 'react'
import {observer} from 'mobx-react'
import * as Xcomp from '../observableComponents'
import Fylkesliste from './Fylkesliste'
import Spredningskart from './Spredningskart'

class UtbredelseIDag extends React.Component {
    render() {
        const {vurdering, appState} = this.props
        const labels=appState.codeLabels.DistributionHistory
        const artskartModel = appState.artskartModel
        const headerStyle = {
            textAlign: 'center',
            borderBottom: '1px solid #000'
        }
        return (
            <fieldset className="well" id="currentSpreadSituation">
                <h4>{labels.currentAndFutureSpreadSituation}</h4>

                <table className="formtable">
                    <colgroup>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                        <col className="col-md-1"/>
                    </colgroup>
                    <thead>
                        <tr>
                            <th/>
                            <th>{labels.currentKnown}</th>
                            <th colSpan='3' style={headerStyle}>{labels.currentDarkFigure}</th>
                            <th/>
                            <th colSpan='3' style={headerStyle}>{labels.currentTotal}</th>
                        </tr>
                        <tr>
                            <th/>
                            <th/>
                            <th>{labels.currentLow}</th>
                            <th>{labels.currentBest}</th>
                            <th>{labels.currentHigh}</th>
                            <th/>
                            <th>{labels.currentLow}</th>
                            <th>{labels.currentBest}</th>
                            <th>{labels.currentHigh}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{labels.currentPopulationCount}</td>
                            <td><Xcomp.Number integer observableValue={[vurdering, 'CurrentIndividualCount']}/></td>
                            <td><Xcomp.Number
                                observableValue={[vurdering, 'CurrentIndividualCountLowMultiplier']}/></td>
                            <td><Xcomp.Number
                                observableValue={[vurdering, 'CurrentIndividualCountMultiplier']}/></td>
                            <td><Xcomp.Number
                                observableValue={[vurdering, 'CurrentIndividualCountHighMultiplier']}/></td>
                            <td/>
                            <td>{vurdering.CurrentIndividualCountLowCalculated}</td>
                            <td>{vurdering.CurrentIndividualCountCalculated}</td>
                            <td>{vurdering.CurrentIndividualCountHighCalculated}</td>
                        </tr>
                        <tr>
                            <td>{labels.historyAreaOccupancy} (km&#178;)</td>
                            <td><Xcomp.Number integer observableValue={[vurdering, 'CurrentExistenceArea']} /></td>
                            <td><Xcomp.Number
                                observableValue={[vurdering, 'CurrentExistenceAreaLowMultiplier']}/></td>
                            <td><Xcomp.Number observableValue={[vurdering, 'CurrentExistenceAreaMultiplier']}/></td>
                            <td><Xcomp.Number
                                observableValue={[vurdering, 'CurrentExistenceAreaHighMultiplier']}/></td>
                            <td/>
                            <td>{vurdering.CurrentExistenceAreaLowCalculated}</td>
                            <td>{vurdering.CurrentExistenceAreaCalculated}</td>
                            <td>{vurdering.CurrentExistenceAreaHighCalculated}</td>
                        </tr>
                        <tr>
                            <td>{labels.historyExtentOfOccurrence} (km&#178;)</td>
                            <td><Xcomp.Number integer observableValue={[vurdering, 'CurrentSpreadArea']}/></td>
                        </tr>

                        <tr>
                            <th/>
                            <th colSpan='3' style={headerStyle}>{labels.futureAarea}</th>
                        </tr>
                        <tr>
                            <th/>
                            <th>{labels.currentLow}</th>
                            <th>{labels.currentBest}</th>
                            <th>{labels.currentHigh}</th>
                        </tr>
                        <tr>
                            <td>{labels.futureAreaOccupancy} (km&#178;)</td>
                            <td>
                                <Xcomp.Number
                                integer
                                observableValue={[vurdering, 'PotentialExistenceAreaLowQuartile']}
                                />
                            </td>
                            <td>
                                <Xcomp.Number
                                    integer
                                    observableValue={[vurdering, 'PotentialExistenceArea']}
                                />
                            </td>
                            <td>
                                <Xcomp.Number
                                    integer
                                    observableValue={[vurdering, 'PotentialExistenceAreaHighQuartile']}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table style={{
                    width: "100%"
                }}>
                    <tbody>
                        <tr>
                            <td
                                style={{
                                position: "relative",
                                width: "35%"
                            }}>
                                {appState.evaluationContext.map == 'norge' && (
                                    <span>
                                        <h4
                                            style={{
                                            position: "absolute",
                                            top: "7px"
                                        }}>{labels.currentDistribution}</h4>
                                        <Spredningskart
                                            map={appState.evaluationContext.map}
                                            showLegend
                                            states={[
                                            {
                                                key: 'none',
                                                title: labels.distributionNone
                                            }, {
                                                key: 'known',
                                                title: labels.distributionKnown,
                                                values: vurdering.knownRegionalPresence
                                            }, {
                                                key: 'assumed',
                                                title: labels.distributionAssumed,
                                                values: vurdering.assumedRegionalPresence
                                            }
                                        ]}
                                            countyListLand={artskartModel.koder.countyListLand}/></span>
                                )}
                            </td>
                            <td
                                style={{
                                position: "relative",
                                width: "35%"
                            }}>
                                {appState.evaluationContext.map == 'norge' && (
                                    <span>
                                        <h4
                                            style={{
                                            position: "absolute",
                                            top: "7px"
                                        }}>{labels.futureDistribution}</h4><Spredningskart
                                            map={appState.evaluationContext.map}
                                            showLegend
                                            states={[
                                        {
                                            key: 'none',
                                            title: labels.distributionNone
                                        }, {
                                            key: 'potential',
                                            title: labels.distributionPotential,
                                            values: vurdering.potentialRegionalPresence
                                        }
                                    ]}
                                            countyListLand={artskartModel.koder.countyListLand}/></span>
                                )}
                            </td>
                            <td>
                                <Fylkesliste
                                    countyLabel={labels.distributionCounty}
                                    columns={[
                                    {
                                        title: labels.distributionKnown + " ",
                                        values: vurdering.knownRegionalPresence
                                    }, {
                                        title: labels.distributionAssumed + " ",
                                        values: vurdering.assumedRegionalPresence
                                    }, {
                                        title: labels.distributionPotential+ " ",
                                        values: vurdering.potentialRegionalPresence
                                    }
                                ]}
                                    //rows={artskartModel.regionListe()}
                                    />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <label htmlFor="CurrentPresenceComment">{labels.describeAsumption}</label>
                <Xcomp.HtmlString observableValue={[vurdering, 'CurrentPresenceComment']}/>
                <p/>
                <Xcomp.Number
                    label={labels.currentPropotionMajorChangedNaturetypes + " (%)"}
                    width="4em"
                    observableValue={[vurdering, 'SpreadHistoryDomesticAreaInStronglyChangedNatureTypes']}/>
            </fieldset>
        )
    }
}

export default observer(UtbredelseIDag);
