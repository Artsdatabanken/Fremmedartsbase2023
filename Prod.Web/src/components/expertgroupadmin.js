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
                EkspertgruppeId : expertGroupModel.valgtekspertgruppe,
                Id: expertGroupModel.valgtekspert,
                Leder: expertGroupModel.valgtekspertsrolleivalgtekspertgruppe.leder,
                Skriver: expertGroupModel.valgtekspertsrolleivalgtekspertgruppe.skriver,
                Leser: expertGroupModel.valgtekspertsrolleivalgtekspertgruppe.leser
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
        if (!auth.isInRole("redlist_administrator")) //())
            return (<h3>Ingen adgang til administrasjon av ekspertgrupper - Du kom hit p.g.a. en feil</h3>);
        return (
            <div>
            <section className="main">
                <h2>Administrasjon av ekspertgrupper</h2>
                <h3>Ekspertgruppe</h3>
                <Xcomp.StringEnum 
                            observableValue={[expertGroupModel, 'valgtekspertgruppe']} 
                            codes={expertGroupModel.alleekspertgrupper}/>
                {/* <select type="select" label="Velg ekspertgruppe" placeholder="select" onChange={e =>
                expertGroupModel.valgtekspertgruppe = e.target.value}>
                    {expertGroupModel.alleekspertgrupper
                .map((eg) => <option key={eg} value={eg}>{eg}</option>)}
    </select> */}

                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Medlem</th>
                            <th>Leder</th>
                            <th>Skriver</th>
                          {/*<th>Leser</th> */}
                            <th>Slett fra gruppe</th>
                        </tr>
                    </thead>
                    <tbody >
                        {expertGroupModel.eksperterforvalgtgruppe.map(ega =>
                <tr key={ega.id}>
                            <td><span>{ega.navn}</span></td>
                            <td><span>{ega.leder ? 'X' : ''}</span></td>
                            <td><span>{ega.skriver ? 'X' : ''}</span></td>
                            {/* <td><span>{ega.leser ? 'X' : ''}</span></td> */}
                            <td><Xcomp.Button primary xs onClick={e => fjernRettighet(ega.id) }>Slett</Xcomp.Button></td>
                        </tr>)}
                        <tr><td><h3>Brukere</h3></td></tr>
                        <tr><th />
                            <th>Leder</th>
                            <th>Skriver</th>
                           {/* <th>Leser</th> */}
                            <th>Ny rettighet</th>
                    </tr>
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
                <td><Xcomp.Button primary xs onClick={lagreRettighet}>Legg til rettighet</Xcomp.Button></td>
            </tr>
            </tbody>
            </table>
            </section>
            <section className="notmain">
                <h2>Administrasjon av tilgangsøknader</h2>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Brukernavn</th>
                            <th>Navn</th>
                            <th>Epost</th>
                            <th>Dato</th>
                            <th>Gi tilgang</th>
                        </tr>
                    </thead>
                    <tbody >
                    {expertGroupModel.tilgangsoknader.map(ega =>
                            <tr key={ega.id}>
                             <td><span>{ega.id}</span></td>
                            <td><span>{ega.brukernavn}</span></td>
                            <td><span>{ega.navn}</span></td>
                            <td><span>{ega.email}</span></td>
                            <td><span>dato</span></td>
                            <td><Xcomp.Button primary xs onClick={e => gitilgang(ega.id) }>Gi tilgang</Xcomp.Button></td>
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
            </div>);
    }
}
ExpertGroupAdmin.propTypes = {
    appState: PropTypes.object.isRequired
}