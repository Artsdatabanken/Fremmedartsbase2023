import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import { toJS, observable, action } from 'mobx';
import config from '../config'
import FileUpload from "./FileUpload";
import { deleteData, loadData, postData, putData } from '../apiService';
@inject('appState')
@observer
export default class Documents extends Component {
    @observable attachments = []
    baseUrl = config.apiUrl + "/api/Document/"
    
    constructor(props) {
        super()
        this.assessmentId = props.appState.assessment.id
        this.getAttachments() // henter første gangen
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
        return(
        <div>
            {/*<h2>Filer for {assessment.id}</h2>*/}
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Filomtale</th>
                        <th>Last ned</th>
                        <th>Slett vedlegg</th>
                    </tr>
                </thead>
                <tbody>
                {this.attachments &&
                            this.attachments.map((item) => {
                                return (<tr key={item.id}>
                                    <td>
                                        {item.name}
                                    </td>
                                    <td>
                                        <a href={config.getUrl('document/getfile/' + item.id)} download={item.fileName} target="_blank" >{item.fileName}</a>
                                    </td>
                                    <td>
                                    <button className="btn btn-primary btn-xs" onClick={() => {this.deleteAttachments(item.id)}}>Slett</button>
                                      </td></tr>
                                      )
                            })}
                    
                </tbody>
            </table>
            <FileUpload 
                onUploadComplete={this.getAttachments}
            />
        </div>)
    }
}
