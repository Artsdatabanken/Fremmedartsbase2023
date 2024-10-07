import React, { Component } from 'react'
import { inject, observer } from 'mobx-react';
import * as Xcomp from './observableComponents'
import { action } from "mobx"
import config from '../config';

class SelectAssessmentStatistics extends Component {
    render() {
        const { appState, assessmentsStatistics, appState: { assessment, koder } } = this.props
        const as = assessmentsStatistics

        return (
            <div>
                {/*<div style={{border: '1px solid rgb(221, 221, 221)', padding: '5px', marginTop: '50px', marginBottom: '20px'}}>
                <div>
                   <Xcomp.Bool label="Inkluder LC-, NE- og NA-arter" observableValue={[appState, "includeLC"]} />
                </div>*/}

                {/*Ikke&nbsp;påbegynt:&nbsp;{as.initial}
                            <br/>
                            Påbegynt:&nbsp;{as.inprogress}&nbsp;&nbsp;-&nbsp;&nbsp;{Math.round((as.inprogress/as.total)*100)}%
                            <br/>
                            Ferdigstilt:&nbsp;{as.finished}&nbsp;&nbsp;-&nbsp;&nbsp;{Math.round((as.finished/as.total)*100)}%
                            <br/>
                            Totalt:&nbsp;{as.total}*/}
                <ul style={{ paddingLeft: '10px' }}>
                    <li>({as.initial})&nbsp;-&nbsp;{Math.round((as.initial / as.total) * 100)}%</li>
                    <li>({as.inprogress})&nbsp;-&nbsp;{Math.round((as.inprogress / as.total) * 100)}%</li>
                    <li>({as.finished})&nbsp;-&nbsp;{Math.round((as.finished / as.total) * 100)}%</li>
                </ul>
                <span style={{ marginLeft: 0 }}>Total: {as.total}</span>
                {/*<br/>
                            {as.total}*/}


            </div>

        )
    }
}

export default inject('appState')(observer(SelectAssessmentStatistics));
