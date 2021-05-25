import "./style/cleanstyle.less"
import React from 'react';
import {inject, observer} from 'mobx-react'

import * as Xcomp from './components/observableComponents'
// import Assessment from './components/assessment'
// import SelectAssessment from './components/selectAssessment'
import AppView from './components/appView'

const mainView = ({appState, appState:{assessment, isServicesReady}, appState:{router}}) => (
  <div className="page_padding">
    <div className="header_background">
        <div className="header_padding" style={{display: 'flex'}}>
          <img src="https://artsdatabanken.no/Files/7809" className="top_image"/>
{(assessment && assessment.evaluatedVernacularName) ? <h1 className="header_title" style={{width: '90%'}}>Fremmede arter 2023{assessment && ": "+ assessment.evaluatedScientificName + ", " + assessment.evaluatedVernacularName +". Kategori: " + assessment.riskAssessment.riskLevelCode}</h1>  : 
<h1 className="header_title" style={{width: '90%'}}>Fremmede arter 2023{assessment && ": "+ assessment.evaluatedScientificName + ". Kategori: " + assessment.riskAssessment.riskLevelCode}</h1>}

           {assessment && assessment.evaluationStatus !== 'finished' &&      <Xcomp.Button primary onClick= {() => {
                    console.log("Save assessment")
                    appState.saveCurrentAssessment();
                  }}>Lagre</Xcomp.Button> }
      </div>
    </div>
    {/* {isServicesReady ? <SelectAssessment /> : null }
    {(assessment && isServicesReady) ? <Assessment /> : null } */}
    <AppView isServicesReady={isServicesReady}/>
  </div>)
  export default inject('appState')(observer(mainView));
