import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {observable, autorun} from 'mobx';
import Tabs from '../tabs';
import Assessment41Import from './assessment41Import';
@inject("appState")
@observer
export default class Assessment40Spredningsveier extends React.Component {
    render() {
        console.log("Vurdering: " + JSON.stringify(Object.keys(this.props)))
        const {appState, appState:{assessment}, appState:{spredningsveierTabs}} = this.props
        const rolle = appState.roleincurrentgroup
        // const isSuperUser = rolle.admin
        const isFinished = assessment.evaluationStatus && assessment.evaluationStatus === "finished"
        // const canEdit = !isFinished && appState.roleincurrentgroup.skriver && assessment.lockedForEditByUser == null    
        return(
            <div> 
                <Tabs clName={"nav_menu submenu"} tabData={spredningsveierTabs} />
                <br></br>
                <div className="content">
                    
                    {
                    spredningsveierTabs.activeTab.id === 1  ?
                    <Assessment41Import  />
                    :<h1>Oooops?? artinfotab:{spredningsveierTabs.activeTab.id}</h1>}
                </div>
            </div>
        );
    }
}
