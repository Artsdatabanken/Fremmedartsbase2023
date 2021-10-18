import React from 'react'
import config from '../../config';
import {observer, inject} from 'mobx-react'
import {action} from 'mobx'
import * as Xcomp from './observableComponents'
import Tabs from '../tabs'
import Assessment51Naturtyper from './assessment51Naturtyper'
import UtbredelseshistorikkInnenlands from './35Utbredelseshistorikk/UtbredelseshistorikkInnenlands'
@inject('appState')
@observer
export default class DistributionTable extends React.Component {

    render() {
    
    const {appState:{assessment}, appState, appState:{infoTabs}} = this.props
        // const {appState:{assessment}, vurdering, fabModel} = this.props
        //const labels = fabModel.kodeLabels.DistributionHistory
        
        // const labels = fabModel.codeLabels.DistributionHistory
        const koder = appState.koder
        const labels = appState.codeLabels.DistributionHistory

    if (assessment.horizonEstablismentPotential == 1){
        assessment.riskAssessment.AOOtotalBest = 1;
    }
    if (assessment.alienSpeciesCategory != "DoorKnocker" && assessment.riskAssessment.AOOtotalBest == 0) {
        alert("En selvstending reproduserende art må ha et forekomstareal på minst 4 km2!")
    }
       
    return (
    <>
    {assessment.alienSpeciesCategory != "DoorKnocker" && <h5>Antatt</h5> }
    <table className="table distribution">
    {assessment.alienSpeciesCategory != "DoorKnocker" ?
        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "17%"}} />
            <col style={{width: "17%"}} />
            {/*<col style={{width: "5%"}} />
            <col style={{width: "8%"}} />*/}
        </colgroup>: 

        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "34%"}} />
            {/*<col style={{width: "5%"}} />
            <col style={{width: "8%"}} />*/}
        </colgroup>}

        {assessment.alienSpeciesCategory != "DoorKnocker" ?
            <thead>
                <tr>
                    <th>Lavt anslag (25-prosentil)</th>
                    
                    <th>Beste anslag (median) </th>
                
                    <th> Høyt anslag (75-prosentil)</th>
                    <th>&nbsp;</th>
                    
                </tr>
            </thead> : 
            <thead>
            <tr>
                <th>Lavt anslag (25-prosentil)</th>
                
                <th>Beste anslag (median) </th>
            
                <th> Høyt anslag (75-prosentil)</th>
            </tr>
        </thead> }

        <tbody>            
            <tr>
                <td>
                <Xcomp.Number                            
                    observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "Occurences1Low"] : [assessment.riskAssessment, "AOOtotalLow"]}
                    integer />   
                </td>                
                <td>
                <Xcomp.Number                            
                    observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "Occurences1Best"] :[assessment.riskAssessment, "AOOtotalBest"]}
                    integer
                   // onChange={action (() => assessment.horizonEstablismentPotential == 1 && assessment.riskAssessment.AOOtotalBest != 1 ? alert("Dette stemmer ikke overens med vurdering på horisontskanningen. Er du sikker på at du vil endre?") : null)} 
                   />   

                </td>
               <td>
               <Xcomp.Number                            
                    observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "Occurences1High"] :[assessment.riskAssessment, "AOOtotalHigh"]}
                    integer />   
                </td>
                {assessment.alienSpeciesCategory != "DoorKnocker" &&
                    <td>km<sup>2</sup></td>
                }
                           
            </tr>
            <tr>
                <td>
                <Xcomp.Number                            
                    observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "IntroductionsLow"] : [assessment.riskAssessment, "AOOdarkfigureLow"]}
                    integer />   
                </td>                
                <td>
                <Xcomp.Number                            
                    observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "IntroductionsBest"] : [assessment.riskAssessment, "AOOdarkfigureBest"]}
                    integer />   
                </td>
               <td>
               <Xcomp.Number                            
                    observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "IntroductionsHigh"] : [assessment.riskAssessment, "AOOdarkfigureHigh"]}
                    integer />   
              </td>
              {assessment.alienSpeciesCategory != "DoorKnocker" &&
                    <td>mørketall</td>
             }
            
            </tr>           
           
        </tbody>
    </table>
    
     {assessment.alienSpeciesCategory == "DoorKnocker" && <h5>Antatt</h5> }
    <table className="table distribution">
    {assessment.alienSpeciesCategory != "DoorKnocker" ?
        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "17%"}} />
            <col style={{width: "17%"}} />
            {/*<col style={{width: "5%"}} />
            <col style={{width: "8%"}} />*/}
        </colgroup>: 

        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "34%"}} />
            {/*<col style={{width: "5%"}} />
            <col style={{width: "8%"}} />*/}
        </colgroup>}

    <thead>
        <tr>
            <th>Lavt anslag (25-prosentil)</th>
            
            <th>Beste anslag (median) </th>
           
            <th> Høyt anslag (75-prosentil)</th>

            {assessment.alienSpeciesCategory != "DoorKnocker" && 
                    <th>&nbsp;</th>
            }
            
        </tr>
    </thead>
    <tbody>
        
        <tr>
            <td>
            <Xcomp.Number                            
                observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "AOO10yrLow"] : [assessment.riskAssessment, "AOO50yrLow"]}
                integer />   
            </td>            
            <td>
            <Xcomp.Number                            
                observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "AOO10yrBest"] : [assessment.riskAssessment, "AOO50yrBest"]}
                integer />   
            </td>
           <td>
           <Xcomp.Number                            
                observableValue={assessment.alienSpeciesCategory == "DoorKnocker" ? [assessment.riskAssessment, "AOO10yrHigh"] :[assessment.riskAssessment, "AOO50yrHigh"]}
                integer />   
          </td>
          {assessment.alienSpeciesCategory != "DoorKnocker" && 
                    <td>km<sup>2</sup></td>
                }
        </tr>  
    </tbody>
</table></>)
    }
}

