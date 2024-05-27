import React from 'react';
import PropTypes from 'prop-types';
import {observable, computed} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents';
// import {Router} from 'director';
import {storeData, deleteData} from '../apiService';
// import {user} from "./userSession"
import auth from './authService'
import ExpertGroupModel from './expertGroupModel'
import {loadData,postData} from '../apiService';
import config from '../config'

@observer
export default class ExpertGroupAdmin extends React.Component {
    render() {
        const {appState} = this.props;
        const expertGroupModel = ExpertGroupModel
        const labels = appState.codeLabels.administration
        

        function gitilgang(id){
            loadData(config.getUrl("Access/applications/approve/" + id),
            data => {
                if (data && data == true) {
                   expertGroupModel.GetAccessApplications()
            }})
        }
        function lagreRettighet() {
            postData(
                config.getUrl("ExpertGroups/members"),
            {
                ExpertGroupName : expertGroupModel.valgtekspertgruppe,
                Id: expertGroupModel.valgtekspert,
                Admin: expertGroupModel.valgtekspertsrolleivalgtekspertgruppe.leder,
                WriteAccess: expertGroupModel.valgtekspertsrolleivalgtekspertgruppe.skriver//,
                // Leser: expertGroupModel.valgtekspertsrolleivalgtekspertgruppe.leser
            }, data => {
                expertGroupModel.hentEkspertgruppeMedlemmer()
            }
            );
        }
        function fjernRettighet(guid) {
            deleteData(
                config.getUrl("ExpertGroups/members/" + guid + '/' + expertGroupModel.valgtekspertgruppe),
            {},
            data => {
                expertGroupModel.hentEkspertgruppeMedlemmer()
            }
            );
        }
        if (!auth.isInRole("fab_administrator")) //())
            return (<h3>{labels.accessDenied}</h3>);
        return (
            <fieldset className="well">

            <section className="main adm">
                <h2>{labels.administration}</h2>
                <h3>{labels.expertGroup}</h3>
                <Xcomp.StringEnum 
                        observableValue={[expertGroupModel, 'valgtekspertgruppe']}
                        codes={expertGroupModel.alleekspertgrupper} />
                        
                {/* <select type="select" label="Velg ekspertgruppe" placeholder="select" onChange={e =>
                expertGroupModel.valgtekspertgruppe = e.target.value}>
                    {expertGroupModel.alleekspertgrupper
                .map((eg) => <option key={eg} value={eg}>{eg}</option>)}
    </select> */}
        {expertGroupModel.eksperterforvalgtgruppe.length > 0 ?
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>{labels.member}</th>
                            <th>{labels.leader}</th>
                            <th>{labels.writer}</th>
                          {/*<th>Leser</th> */}
                            <th>{labels.removeFromGroup}</th>
                        </tr>
                    </thead>
                    <tbody >
                        {expertGroupModel.eksperterforvalgtgruppe.map(ega =>
                        <tr key={ega.id}>
                            <td><span>{ega.fullName}</span></td>
                            <td><span>{ega.admin ? 'X' : ''}</span></td>
                            <td><span>{ega.writeAccess ? 'X' : ''}</span></td>
                            <td><Xcomp.Button primary xs onClick={e => fjernRettighet(ega.id) }>{labels.remove}</Xcomp.Button></td>
                        </tr>)}

                    </tbody>
                </table> : 
                // to make some space between the heading and next table
                <div style={{height: "70px"}}></div>
        }
                <h3>{labels.users}</h3>
                 <table className="table table-striped table-hover">
                        <thead>
                        <tr><th />
                            <th>{labels.leader}</th>
                            <th>{labels.writer}</th>
                           {/* <th>Leser</th> */}
                            <th>{labels.newRights}</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                <td>
                <Xcomp.StringEnum 
                            observableValue={[expertGroupModel, 'valgtekspert']} 
                            codes={expertGroupModel.alleeksperter}/>
                    {/* <select type="select" label="Velg bruker" placeholder="select" onChange={e =>
                expertGroupModel.valgtekspert = e.target.value}>
                    {expertGroupModel.alleeksperter
                .map((eg) => <option key={eg.GUID} value={eg.GUID}>{eg.Brukernavn + ' - ' + eg.Email}</option>)}
                </select> */}
                </td>
                <td>
                    <Xcomp.Bool observableValue={[expertGroupModel.valgtekspertsrolleivalgtekspertgruppe, 'leder']} />
                </td>
                <td>
                    <Xcomp.Bool observableValue={[expertGroupModel.valgtekspertsrolleivalgtekspertgruppe, 'skriver']} />
                </td>
                {/* <td>
                <Xcomp.Bool observableValue={[expertGroupModel.valgtekspertsrolleivalgtekspertgruppe, 'leser']} /></td> */}
                <td><Xcomp.Button primary xs onClick={lagreRettighet}>{labels.addRight}</Xcomp.Button></td>
            </tr>
            </tbody>
            </table>
            </section>
            {expertGroupModel.tilgangsoknader.length > 0 && 
            <section className="notmain">
                <h2>{labels.accessApplicationAdministration}</h2>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>{labels.id}</th>
                            <th>{labels.username}</th>
                            <th>{labels.name}</th>
                            <th>{labels.email}</th>
                            <th>{labels.date}</th>
                            <th>{labels.application}</th>
                            <th>{labels.giveAccess}</th>
                        </tr>
                    </thead>
                    <tbody >
                    {expertGroupModel.tilgangsoknader.map(ega =>
                            <tr key={ega.id}>
                             <td><span>{ega.id}</span></td>
                            <td><span>{ega.userName}</span></td>
                            <td><span>{ega.fullName}</span></td>
                            <td><span>{ega.email}</span></td>
                            <td><span>{ega.dateCreated}</span></td>
                            <td><span>{ega.application}</span></td>
                            <td><Xcomp.Button primary xs onClick={e => gitilgang(ega.id) }>{labels.giveAccess}</Xcomp.Button></td>
                        </tr>)}
                        {/* id: "4fe6f765-83c0-448a-a8dc-307629972949"
brukernavn: "steinho"
harTilgang: false
harSoktOmTilgang: true
ekspertgruppeRoller: []
erAdministrator: true
navn: "Stein  Hoem"
email: "stein.hoem@artsdatabanken.no"
soknad: "Eg treng tilgang med ein gong" */}
                    </tbody>
                </table>
            </section>
            }
            <input type="button" className="btn btn-primary" value="Last ned export" onClick={() => window.open(config.apiUrl + '/api/ExpertGroupAssessments/export/all/absoluteall')}></input>
            <input type="button" className="btn btn-primary" value="Last ned HS-export" onClick={() => window.open(config.apiUrl + '/api/ExpertGroupAssessments/export/horizonScanning/absoluteall')}></input>
            
            </fieldset>);
    }
}
ExpertGroupAdmin.propTypes = {
    appState: PropTypes.object.isRequired
}