import React from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx'
import { Observer, observer, inject } from 'mobx-react';

import Assessment from './assessment/assessment';
import AssessmentsView from './assessmentsView';
import AssessmentNew from './assessmentNew'
import AssessmentMove from './assessmentMove'
import ExpertGroupAdmin from './expertgroupadmin';
import Login from './Login'
import ApplyForAccess from './ApplyForAccess'
import auth from './authService'


const AppViewMain = (props) => <Observer>{() => {
    const { appState } = props
    const isThingsLoaded = appState.isThingsLoaded

    console.log("AppViewMain: " + appState.viewMode + "#" + isThingsLoaded)

    return (
        <section className="main">
            {appState.viewMode === "assessment"
                ? <Assessment appState={appState} isThingsLoaded={isThingsLoaded} />
                : appState.viewMode === "moveassessment"
                    ? <AssessmentMove appState={appState} checkForExistingAssessment={appState.checkForExistingAssessment} onMoveAssessment={e => { appState.moveAssessment(e) }} />
                    : appState.viewMode === "choosespecie"
                        ? <AssessmentsView
                            appState={appState}
                            ekspertgruppeArter={appState.ekspertgruppeArter}
                            rolle={appState.ekspertgruppeRolle} />
                        : (appState.viewMode === "newassessment")
                            ? <AssessmentNew appState={appState} checkForExistingAssessment={appState.checkForExistingAssessment} onNewAssessment={e => { appState.createNewAssessment(e) }} />
                            : appState.viewMode === "administrasjon"
                                ? <ExpertGroupAdmin appState={appState} />
                                : <h3>Oooooppps: viewMode {appState.viewMode}</h3>
            }
        </section>
    )
}}</Observer>


const NavItem = (props) => <Observer>{() => {
    const { children, onClick, disabled } = props
    return (
        <li role="presentation">
            <a href="#" role="button"
                onClick={onClick}
                disabled={!!disabled}
            >
                {children}
            </a>
        </li>
    )
}}</Observer>


class AppView extends React.Component {

    render() {

        const { appState } = this.props;
        const labels = appState.codeLabels.AppHeader
        const isLockedByMe = appState.assessment && appState.assessment.lockedForEditByUser === auth.userId
        const isFinished = appState.assessment && appState.assessment.evaluationStatus && appState.assessment.evaluationStatus === "finished"

        function lagreVurdering() {
            appState.lagreVurdering(appState)
        }
        function sjekkForEndringerOgGiAdvarsel() {
            var isdirty = appState.isDirty
            var skriver = !!appState.roleincurrentgroup && appState.roleincurrentgroup.writeAccess
            var ok = true;
            if (isdirty && skriver && !isFinished) {
                ok = window.confirm("Det er endringer på vurderingen - ønsker du virkelig å gå bort fra den uten å lagre?")
            }
            if (ok) {
                appState.viewMode = "choosespecie"
                appState.updateCurrentAssessment(null)
            }
        }

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
                        <li onClick={action(() => { sjekkForEndringerOgGiAdvarsel() })} disabled={!auth.isLoggedIn}><b>Velg vurdering</b></li>
                        <li onClick={action(() => appState.viewMode = "newassessment")} disabled={!auth.isLoggedIn}><b>Legg til ny art</b></li>
                        {(auth.isInRole("fab_administrator") && appState.viewMode === "assessment") ?
                            <li onClick={action(() => { if (auth.isLoggedIn && !appState.isDirty) { appState.viewMode = "moveassessment" } })} disabled={(!auth.isLoggedIn || appState.isDirty)} className={(!auth.isLoggedIn || appState.isDirty) ? " disabled " : " "}><b>Flytt vurdering</b></li> : null}
                        {auth.isInRole("fab_administrator") && <li role="presentation" onClick={action(() => appState.viewMode = "administrasjon")}><b>Administrasjon</b></li>}
                        <li role="presentation">

                            <button
                                className="dropdownButton dropdown-toggle"
                                //className="btn btn-secondary dropdown-toggle" 
                                type="button"
                                //id="dropdownMenuButton"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <b>{labels.guidelines}
                                </b>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <li><a className="dropdown-item" target="_blank" href="https://www.artsdatabanken.no/Files/42948/Retningslinjer_for__kologisk_risikovurdering_av_fremmede_arter._Versjon_4.4">{labels.guidelines}</a></li>
                                <li><a className="dropdown-item" target="_blank" href="https://www.artsdatabanken.no/Files/42913/Brukermanual_for_FremmedArtsBasen_2023._Horisontskanning_og__kologisk_risikovurdering_av_fremmede_arter.">{labels.userManual}</a></li>
                                <li><a className="dropdown-item" target="_blank" href="https://brage.nina.no/nina-xmlui/handle/11250/2975978">{labels.changesSince2018}</a></li>
                            </div>

                        </li>
                        {/* <li role="presentation" disabled={!auth.isLoggedIn} onClick={auth.logout}><b>&nbsp; {auth.user ? "Logg ut " : ""} {(auth.user ? auth.user.profile.name : "")} </b></li> */}
                        <li role="presentation" disabled={!auth.isLoggedIn} onClick={auth.logout}><b>&nbsp; {auth.isLoggedIn ? "Logg ut " : ""} {auth.user.profile.name} </b></li>

                    </ul>
                }
                {!auth.isLoggedIn
                    ? <Login authModel={appState.authModel} />
                    :
                    auth.hasAccess ?
                        <AppViewMain appState={appState} />
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

export default inject("appState")(observer(AppView));