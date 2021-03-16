import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import diff from './diff';
import config from '../config'
import auth from './authService'
import { loadData } from '../apiService'

function Diff(props) {

    // At the moment we only have one entry and should expect them to be similar.
    // Not sure which object object 2 is.
    let first_entry = props.species;
    let new_entry = props.compare_species;

    let stringified = JSON.stringify(first_entry,undefined,2);
    let stringified2 = JSON.stringify(new_entry,undefined,2);
    let list_array = diff(stringified,stringified2);

    let table_row = [];
    for(let i in list_array){        
        let current = list_array[i];
        let td1 = <td className="line_nr"> <pre>{current["lineNumber1"]}</pre></td>; 
        let td3 = <td> <pre>{current["text"]}</pre></td>;
        let td4 = <td className="line_nr"> <pre>{current["lineNumber2"]}</pre></td>;
        let td2 = <td> <pre>{current["text"]}</pre></td>;
        
        if(current["type"] == "-"){
            td1 = <td className="old_object line_nr"> <pre>{current["lineNumber1"]}</pre></td>;
            td3 = <td className="old_object"> <pre>{current["text"]}</pre></td>;
            td4 = <td className="hide_object line_nr"> <pre>{current["lineNumber2"]}</pre></td>;
            td2 = <td className="hide_object"> <pre>{current["text"]}</pre></td>;
         
        }else if(current["type"] == "+"){
            td1 = <td className="hide_object line_nr"> <pre>{current["lineNumber1"]}</pre></td>;
            td3 = <td className="hide_object"> <pre>{current["text"]}</pre></td>;
            td4 = <td className="new_object line_nr"> <pre>{current["lineNumber2"]}</pre></td>;
            td2 = <td className="new_object"> <pre>{current["text"]}</pre></td>;
        }
        table_row.push(<tr key={i}>{td1}{td3}{td4}{td2}</tr>)  ;
    }

    return table_row;
  }


@inject('appState')
@observer
export default class AssessmentDiff extends Component {
    deleteAssessment = (id) => {
        // kun lov til å slette sine egne kommentarer
        // dette er id til kommentar - ikke assessmentid
        loadData(config.getUrl("assessment/"+id+ "/delete")
        , ok => { if (ok) { 
            console.log(id + 'slettet')
         } }
        , exception => { console.error(exception) })
    }

    render() {
        const {appState, appState:{assessment, assessmentSavedVersion, koder}} = this.props
        const kodeTekst = (kodegruppe, id) => {
            const gr = koder[kodegruppe]
            if (!gr) return "no code group: " + kodegruppe
            const match = gr.find(kode => kode.value = id)
            return match && match.text ? match.text : id
            
        }
        window.scrollTo(0, 0);
        return (
            <div className="page_container">
                <div className="page_wrapper">
                <h2>JSON differanse</h2>
                <div>
                <h3>Endringene er ikke registrert ennå da dette er dummy objekter.
                    Nå er koden identisk på begge sider.
                </h3>
                <table className="compare_table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Lagret</th>
                            <th>#</th>
                            <th>Editert</th>
                        </tr>
                    </thead>
                    <tbody>
                        <Diff 
                            species={assessmentSavedVersion} 
                            compare_species={assessment} 
                        />
                        
                    </tbody>
                </table>
                </div>           
            </div>
            {auth.isAdmin && <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={() => { this.deleteAssessment(assessment.id)}}>Slett vurdering (NB! forsvinner fra ekspertgruppa)</button>}
        </div>
        )}}
