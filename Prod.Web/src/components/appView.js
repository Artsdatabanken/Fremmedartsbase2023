import React from 'react';
import PropTypes from 'prop-types';
import {action} from 'mobx'
import { observer, inject } from 'mobx-react';

import DevTool from 'mobx-react-devtools';
import LoadingHoc from './LoadingHoc'

import Assessment from './assessment';
import AssessmentsView from './assessmentsView';
import AssessmentNew from './assessmentNew'
import ExpertGroupAdmin from './expertgroupadmin';

import Footer from './footer';
import Login from './Login'
import ApplyForAccess from './ApplyForAccess'
//import events from './event-pubsub'
// import logoimg from './../img/ADBLogo-70.png'

import auth from './authService'

@observer
class AppViewMain extends React.Component {
    render() {
        const {appState} = this.props
        const isThingsLoaded = appState.isThingsLoaded

        console.log("AppViewMain: " + appState.viewMode + "#" + isThingsLoaded)

        return (
            <section className="main">
                {appState.viewMode === "assessment"
                ? <Assessment appState={appState} isThingsLoaded={isThingsLoaded}/>
                : appState.viewMode === "choosespecie"
                ? <AssessmentsView
                        appState={appState}
                        ekspertgruppeArter={appState.ekspertgruppeArter}
                        rolle={appState.ekspertgruppeRolle}/>
                : (appState.viewMode === "newassessment")
                ? <AssessmentNew appState={appState} checkForExistingAssessment={appState.checkForExistingAssessment} onNewAssessment={e => {appState.createNewAssessment(e)}}/>
                : appState.viewMode === "administrasjon"
                ? <ExpertGroupAdmin appState={appState}/>
                : <h3>Oooooppps: viewMode {appState.viewMode}</h3>
                }
            </section>
        )
    }
}
AppViewMain.propTypes = {
    appState: PropTypes.object.isRequired
}


@observer
class NavItem extends React.Component {
    render() {
        const {children, onClick, disabled } = this.props
        return (
            <li role="presentation">
                <a href="#" role="button"
                    onClick={onClick}
                    disabled={!!disabled}
                    href="#">
                    {children}
                </a>
            </li>
       )
    }
}

@inject('appState')
@LoadingHoc('isServicesReady')
@observer
export default class AppView extends React.Component {

    render() {

        const {appState} = this.props;
        const labels = appState.codeLabels.AppHeader

        console.log("appvieoaded" + appState.isServicesReady)
        console.log("appviewisServicesReady" + this.props.isServicesReady)
        console.log("AppView: " + appState.viewMode )

        console.log("AppView render->")


        function lagreVurdering() {
            appState.lagreVurdering(appState)
        }
        function sjekkForEndringerOgGiAdvarsel(){
                // var isLockedByMe = appState.assessment && appState.assessment.lockedForEditByUser === auth.user.name
                var isdirty = appState.isDirty
                var skriver = !!appState.roleincurrentgroup && appState.roleincurrentgroup.skriver
                var ok = true;
                // if (isLockedByMe && isdirty && skriver) {
                if (isdirty && skriver) {
                    ok = window.confirm("Det er endringer på vurderingen - ønsker du virkelig å gå bort fra den uten å lagre?")
                }
                if (ok) {
                    appState.viewMode = "choosespecie"
                    appState.updateCurrentAssessment(null)
                }
        }

        const isLockedByMe = appState.assessment && appState.assessment.lockedForEditByUser === auth.user.name
        const isFinished = appState.assessment && appState.assessment.evaluationStatus && appState.assessment.evaluationStatus === "finished"

        return (
            <div className="_container">
                {/* <button onClick={action(() => {appState.userContext.readonly=!appState.userContext.readonly})}>readonlytest</button> */}
                {/* {process.env.NODE_ENV == 'development' && <DevTool/>} */}
                <div
                    className="row"
                    style={{
                    marginBottom: "48px"
                }}>
                    <nav className="navbar navbar-inverse">
                    {appState.showSaveSuccessful
                    ? <div
                            style={{
                            zIndex: 3000,
                            position: "fixed",
                            top: "50px",
                            right: "20px"
                        }}>
                            <div
                                style={{
                                padding: "20px",
                                backgroundColor: "#4A4"
                            }}>
                                <h2
                                    style={{
                                    color: "white"
                                }}>
                                    <b>{labels.assessmentSaveOk}</b>

                                </h2>
                            </div>
                        </div>
                    : null}
                    {appState.showSaveFailure
                    ? <div
                            style={{
                            zIndex: 3000,
                            position: "fixed",
                            top: "50px",
                            right: "20px"
                        }}>
                            <div
                                style={{
                                padding: "20px",
                                backgroundColor: "#A44"
                            }}>
                                <h2
                                    style={{
                                    color: "white"
                                }}>
                                    <b>{labels.assessmentSaveFail}</b>
                                    <p>{labels.assessmentSaveFailTryAgain}</p>
                                </h2>
                            </div>
                        </div>
                    : null}
                    </nav>
                </div> 
               {auth.user && 
               <ul className="nav_menu">
                    <li onClick={action(() => {sjekkForEndringerOgGiAdvarsel()})} disabled={!auth.isLoggedIn}><b>Velg vurdering</b></li>                    
                    <li onClick={action(() => appState.viewMode = "newassessment")} disabled={!auth.isLoggedIn}><b>Legg til ny art</b></li>  
                    <li role="presentation" onClick={action(() => appState.viewMode = "administrasjon")}><b>Administrasjon</b></li>
                    <li role="presentation"><b>Retningslinjer</b></li>
                    <li role="presentation" disabled={!auth.isLoggedIn} onClick={auth.logout}><b>&nbsp; {auth.user ? "Logg ut " : ""} {(auth.user ? auth.user.profile.name : "")} </b></li>
                    
                </ul>
    }
                {/* <ul className="nav_menu">
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" style={{marginTop: '5px'}} id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <b>{labels.information} 
                            </b>
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><a className="dropdown-item" target="_blank" href="https://www.artsdatabanken.no/Files/33442/_IUCN_Red_List_Categories_and_Criteria._Version_3.1._Second_edition">{labels.iucnCatAndCrit}</a></li>
                            <li><a className="dropdown-item" target="_blank" href="https://www.artsdatabanken.no/Files/33443/Guidelines_for_Using_the_IUCN_Red_List_Categories_and_Criteria._Version_14_(August_2019)">{labels.redListguidelines14}</a></li>
                            <li><a className="dropdown-item" target="_blank" href="https://www.artsdatabanken.no/Files/33444/Guidelines_for_Application_of_IUCN_Red_List_Criteria_at_Regional_and_National_Levels__Version_4.0">{labels.iucnRegionalGuides4}</a></li>
                            <li><a className="dropdown-item" target="_blank" href="https://www.artsdatabanken.no/Files/33528/Brukerveileder_versjon_2.2.5.1.pdf">{labels.norskVeileder20212251}</a></li>
                        </div>
                    </div>
                    {auth.isLoggedIn && // appState.viewMode !== "choosespecie" &&
                    <li onClick={action(() => {sjekkForEndringerOgGiAdvarsel()})} disabled={!auth.isLoggedIn}><b>{labels.chooseSpecies}</b></li>
                    }
                    {auth.isLoggedIn && appState.viewMode === "choosespecie" &&
                    <li onClick={action(() => appState.viewMode = "newassessment")} disabled={!auth.isLoggedIn}><b>Opprett vurdering</b></li>
                    }
                    {auth.hasAccess && appState.viewMode !== "choosespecie" && isLockedByMe && !isFinished &&
                    <li onClick={lagreVurdering}><span className="fa fa-floppy-o"></span>&nbsp;<span>{labels.assessmentSave}</span></li>
                    }
                    {auth.isAdmin &&
                    <li role="presentation" onClick={action(() => appState.viewMode = "administrasjon")}><b>{labels.administration}</b></li>
                    }
                <li role="presentation" disabled={!auth.isLoggedIn} onClick={auth.logout}><b>&nbsp; {auth.user ? labels.logout : ""} {(auth.user ? auth.user.profile.name : "")} </b></li>
                </ul> */}
                {!auth.isLoggedIn
                    ? <Login authModel={appState.authModel}/>
                    :
                    auth.hasAccess ?
                     <AppViewMain appState={appState} appState={appState}/> 
                     : <ApplyForAccess applicationPending={auth.hasApplication} />
                }
                {/* <Footer labels={labels}/> */}
            </div>
        )
    }
    // <Login authModel={appState.authModel}/>


    static propTypes = {
        appState: PropTypes.object.isRequired
    }
}
