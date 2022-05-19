import React from 'react'
import {observer, inject} from 'mobx-react'
import * as Xcomp from './observableComponents'
import errorhandler from '../errorhandler';
@inject('appState')
@observer
export default class DistributionTable extends React.Component {
    render() {
    
    const {appState:{assessment}, appState, appState:{infoTabs}} = this.props
        const koder = appState.koder
        const labels = appState.codeLabels.DistributionHistory
        const disabled = appState.userContext.readonly
    return (
    <>
    {!assessment.isDoorKnocker && <h5>Antatt</h5> }
    <table className="table distribution">
    {!assessment.isDoorKnocker ?
        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "17%"}} />
            <col style={{width: "17%"}} />
        </colgroup>: 
        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "34%"}} />
        </colgroup>}
        {!assessment.isDoorKnocker ?
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
                    observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "occurrences1Low"] : [assessment.riskAssessment, "AOOtotalLowInput"]}
                    observableErrors={assessment.isDoorKnocker ? [errorhandler, "(b)err1"] : [errorhandler, "(a)err2", "(a)err12" ]}
                    disabled={disabled}
                    integer />   
                </td>                
                <td>
                <Xcomp.Number                            
                    observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "occurrences1Best"] :[assessment.riskAssessment, "AOOtotalBestInput"]}
                    observableErrors={assessment.isDoorKnocker ? [errorhandler, "(b)err1", "(b)err2"] : [errorhandler, "(a)err1", "(a)err2", "(a)err3", "(a)err6", "(a)err13" ]}
                    disabled={disabled}
                    integer
                   />   

                </td>
               <td>
               <Xcomp.Number                            
                    observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "occurrences1High"] :[assessment.riskAssessment, "AOOtotalHighInput"]}
                    observableErrors={assessment.isDoorKnocker ? [errorhandler, "(b)err2"] : [errorhandler, "(a)err3", "(a)err14" ]}
                    disabled={disabled}
                    integer />   
                </td>
                {!assessment.isDoorKnocker &&
                    <td>km<sup>2</sup></td>
                }
                           
            </tr>
            {/* Styling of the table for door knockers because of large amount of text to the left*/}
            <tr style={assessment.isDoorKnocker ? {marginTop: "30px" } : {marginTop: "5px"}}>
                <td>
                <Xcomp.Number                            
                    observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "introductionsLow"] : [assessment.riskAssessment, "AOOdarkfigureLow"]}
                    disabled={disabled}
                    integer />   
                </td>                
                <td>
                <Xcomp.Number                            
                    observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "introductionsBest"] : [assessment.riskAssessment, "AOOdarkfigureBest"]}
                    disabled={disabled}
                    integer />   
                </td>
               <td>
               <Xcomp.Number                            
                    observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "introductionsHigh"] : [assessment.riskAssessment, "AOOdarkfigureHigh"]}
                    disabled={disabled}
                    integer />   
              </td>
              {!assessment.isDoorKnocker &&
                    <td>mørketall</td>
             }
            </tr>           
        </tbody>
    </table>
    
     {assessment.isDoorKnocker && <h5>Antatt</h5> }
    <table className="table distribution">
    {!assessment.isDoorKnocker ?
        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "17%"}} />
            <col style={{width: "17%"}} />
        </colgroup>: 
        <colgroup>
            <col style={{width: "33%"}} />
            <col style={{width: "33%"}} /> 
            <col style={{width: "34%"}} />
        </colgroup>}
    <thead>
        <tr>
            <th>Lavt anslag (25-prosentil)</th>
            <th>Beste anslag (median) </th>
            <th> Høyt anslag (75-prosentil)</th>
            {!assessment.isDoorKnocker && 
                    <th>&nbsp;</th>
            }
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
            <Xcomp.Number                            
                observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "AOO10yrLow"] : [assessment.riskAssessment, "AOO50yrLowInput"]}
                observableErrors={assessment.isDoorKnocker ? [errorhandler, "B1err1"] : [errorhandler, "(a)err4", "(a)err15"]}
                disabled={disabled || assessment.isDoorKnocker}
                integer 
                />   
            </td>            
            <td>
            <Xcomp.Number                            
                observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "AOO10yrBest"] : [assessment.riskAssessment, "AOO50yrBestInput"]}
                observableErrors={assessment.isDoorKnocker ? [errorhandler, "B1err1", "B1err2"] : [errorhandler, "(a)err4", "(a)err5", "(a)err16"]}
                disabled={disabled || assessment.isDoorKnocker}
                integer 
                />   
            </td>
           <td>
           <Xcomp.Number                            
                observableValue={assessment.isDoorKnocker ? [assessment.riskAssessment, "AOO10yrHigh"] :[assessment.riskAssessment, "AOO50yrHighInput"]}
                observableErrors={assessment.isDoorKnocker ? [errorhandler, "B1err2"] : [errorhandler, "(a)err5", "(a)err17"]}
                disabled={disabled || assessment.isDoorKnocker}
                integer 
                />   
          </td>
          {!assessment.isDoorKnocker && 
            <td>km<sup>2</sup></td>
          }
        </tr>  
    </tbody>
</table></>)
    }
}

