import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import { toJS, observable, action, makeObservable, extendObservable } from 'mobx';
import config from '../config'
import FileUpload from "./FileUpload";
import * as Xcomp from './observableComponents';
import { loadData } from '../apiService';

class Documents extends Component {
    attachments = [];
    baseUrl = config.apiUrl + "/api/Document/"

    constructor(props) {
        super()

        makeObservable(this, {
            attachments: observable
        });

        makeObservable(this);
        this.assessmentId = props.appState.assessment.id
        this.getAttachments() // henter første gangen

        extendObservable(this, {
            edit: false,
            open: false
        })
    }
    getAttachments = () => {
        loadData(this.baseUrl + this.assessmentId, this.updateAttachments, exception => { console.error(exception) })
    }

    updateAttachments = (item) => {
        action(() => {
            this.attachments = item;
        })()
    }
    deleteAttachments = (id) => {
        // kun lov til å slette sine egne kommentarer
        // dette er id til kommentar - ikke assessmentid
        loadData(this.baseUrl +'delete/' + id
        , ok => { if (ok) { 
            
            // action(() => { kommentar.isDeleted = true })()
            console.log(id + ' slettet')
            this.getAttachments()
         } }
        , exception => { console.error(exception) })
    }

    render() {
        const {appState, appState:{assessment, koder}} = this.props
        const riskAssessment = assessment.riskAssessment
        const labels = appState.codeLabels
        const disabled = appState.userContext.readonly
        return(
        <div className="files">
            <FileUpload 
                onUploadComplete={this.getAttachments}
                labels = {labels}
                attachments = {this.attachments}
            />
            {/*<h2>Filer for {assessment.id}</h2>*/}
            {this.attachments.length > 0 && 
            <div>
                <h5>{labels.General.followingIsChosen}</h5>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>{labels.General.filename}</th>
                        <th>{labels.General.fileDescription}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {this.attachments.map((item) => {
                                return (<tr key={item.id}>
                                    <td>
                                        <a href={config.getUrl('document/getfile/' + item.id)} download={item.fileName} target="_blank" >{item.fileName}</a>  
                                        <br></br>    
                                        {this.edit
                                        ? <Xcomp.String observableValue={[item, 'name']} />
                                        : item.name
                                        }                                      
                                    </td>
                                    <td>   
                                        {item.description}
                                    </td>
                                    
                                    <td>
                                    <button className="btn btn-default btn-xs" 
                                            title={!this.edit ? labels.General.edit : labels.General.ok}
                                            disabled={disabled}
                                            onClick={() => this.edit = !this.edit}
                                            //onClick={() => {this.deleteAttachments(item.id)}}
                                            >
                                        {this.edit ? labels.General.ok :
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                        </svg>}
                                    </button>
                                    <button className="btn btn-default btn-xs" title={!this.edit ? labels.General.edit : labels.General.remove} disabled={disabled} onClick={() => {this.deleteAttachments(item.id)}}> 
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                        </svg>
                                    </button>
                                      </td></tr>
                                      )
                            })}
                    
                </tbody>
            </table>
            {/*<Xcomp.HtmlString observableValue={[riskAssessment, 'filesDescription']} /> */}               
            </div> 
    }
            
        </div>)
    }
}

export default inject('appState')(observer(Documents));
