import React, { Component } from 'react'
import { inject, observer } from 'mobx-react';
import * as Xcomp from './observableComponents';
import { beskrivTidSiden } from '../formatting'

@inject('appState')
@observer
export default class selectAssessmentRow extends Component {
    render() {
        const { assessment, rolle, labels, userId, appState} = this.props
        const isLocked = !!assessment.lockedForEditByUser
        const isSuperUser = rolle.admin
        const isLockedByMe = assessment.lockedForEditByUser === userId

        // console.log("###" + assessment.lockedForEditByUser + "#" +  rolle.userName)
       
        // users with write access in groups "Fisker" and "Fugler" can unlock assessments - issue #202 FAB 3.0
        const canUnlock = isLocked && (isLockedByMe || isSuperUser || rolle.writeAccess)

        const canEdit = rolle.writeAccess && !isLocked

        // console.log("CANEDIT"+canEdit+rolle.skriver+isLocked)

        const isFinished = assessment.evaluationStatus && assessment.evaluationStatus === "finished"
        const color = isLockedByMe
            ? 'green'
            : isLocked
                ? 'red'
                : null

        const style = {
            cursor: "pointer"
        }
        var totalComments = assessment.commentClosed + assessment.commentOpen

        // console.log("------" + JSON.stringify(assessment))

        if (isLockedByMe)
            style.backgroundColor = '#90ffa0'
        else if (isLocked)
            style.backgroundColor = '#ff90a0 important'
        return (
            <tr
                key={assessment.VurderingId}
                onClick={() => this.props.onOpen(assessment)}>
                {/*<td>{isLocked && <span className='glyphicon glyphicon-lock'/>}</td>     */}           
                <td>
                    <span><i>{assessment.scientificName}</i> {assessment.scientificNameAuthor} {assessment.popularName}</span>
                </td>
                {/* <td>
                    <span>{assessment.popularName}</span>
                </td> */}
                {/*<td>{assessment.horizonDoScanning ? "Ja" : "Nei"}</td>*/}
                <td><span>{assessment.category2018}</span></td>
                {appState.assessmentTypeFilter == "riskAssessment" && <td><span>{assessment.horizontScanResult == 1 ? "HS" : ""}</span></td>} 
                {appState.assessmentTypeFilter == "riskAssessment" && <td><span>{assessment.category}</span></td>}
                <td>
                    <span>{assessment.lastUpdatedAt.substring(0, 10) + " av " + assessment.lastUpdatedBy}</span>
                </td>
                {/*<td>{isLocked && <span className='glyphicon glyphicon-lock'/>}</td> 
                <td>&nbsp;{isLocked && <span className='glyphicon glyphicon-lock'/>}</td>          
                
                <td>&nbsp;{isLocked && <span className='glyphicon glyphicon-lock'/>}</td>*/}   
                <td style={{width: '15%'}}>
                    <p>{labels.SelectAssessment.total} {totalComments}{ assessment.commentOpen > 0 ? (' Nyeste:' + assessment.commentDate) : ''}</p>
                   {assessment.commentOpen > 0 ? <p style={{color: 'red'}}>{labels.SelectAssessment.notSeen} {assessment.commentOpen}</p> : <p>{labels.SelectAssessment.notSeen} {assessment.commentOpen}</p>}
                </td> 
                <td style={{color}}>
                    <Status onLock={(e) => this.handleLock(e, assessment)}
                        onUnlock={(e) => this.handleUnlock(e, assessment)}
                        canEdit={canEdit}
                        isFinished={isFinished}
                        isLocked={isLocked}
                        canUnlock={canUnlock}
                        isLockedByMe={isLockedByMe}
                        assessment={assessment}
                        labels={labels} />

                </td>
                {/*<td>{ canUnlock &&
             <Button
                    style={{
                    backgroundColor: '#ccc',
                    color: 'black',
                    borderColor: '#999'
                }}
                    className='btn btn-primary'
                    onClick={(e) => this.handleUnlock(e, assessment)}>Frigi assessment
                </Button>}</td>*/}

                {/* <td>
                    // {isFinished
                    // ? <span style={{color:"red"}}>{labels.SelectAssessment.assessmentClosed}</span>
                    // : 
                    // canUnlock
                    // ? <Xcomp.Button disabled={!rolle.leder} onClick={e => this.handleUnlock(e, assessment)}>{labels.SelectAssessment.releaseAssessment}</Xcomp.Button>
                    // : null}
                    </td> */}
                {/* <td>&nbsp; HER {isLocked && beskrivTidSiden(assessment.LockedForEditTimeStamp, labels.Timing)}</td>
                <td>&nbsp; {beskrivTidSiden(assessment.SistOppdatert, labels.Timing)}</td> */}
                {/* <td>&nbsp; </td>
                <td>&nbsp; </td>*/}
            </tr>
        )
    }

    handleLock(e, assessment) {
        e.stopPropagation()
        this
            .props
            .onLock(assessment)
    }

    handleUnlock(e, assessment) {
        e.stopPropagation()
        this
            .props
            .onUnlock(assessment)
    }
}

const Status = ({ isLocked, isLockedByMe, canEdit, isFinished, assessment, onLock, onUnlock, canUnlock, labels }) => {
    // console.log("------"+isLocked+ isLockedByMe+ canEdit+ isFinished +canUnlock )
    return isFinished
    ? <span style={{color:"red"}}>{labels.SelectAssessment.assessmentClosed}&nbsp;</span>
    : isLocked
    ? <><div>{labels.SelectAssessment.assessedBy}&nbsp;<b>{isLockedByMe ? "meg" : assessment.lockedForEditByUser}</b><br></br>
    { canUnlock &&<Xcomp.Button onClick={(e) => onUnlock(e)}>{labels.SelectAssessment.releaseAssessment}</Xcomp.Button>} </div> </>
    : canEdit
    ? <Xcomp.Button onClick={(e) => onLock(e)}>{labels.SelectAssessment.startAssessment}</Xcomp.Button>
    : <span>{labels.SelectAssessment.readOnly}</span>
}

