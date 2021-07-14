import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {upload} from '../apiService'
import Documents from './documents'

import { toJS, observable, extendObservable } from 'mobx';
import * as Xcomp from './observableComponents'

@inject('appState')
@observer
export default class FileUpload extends Component {
    selectedFile = observable({
        name: ''
    })

    @observable activeUploads = []
    startOpplastinger(e,assessmentId) {
        this
            .activeUploads
            .splice(0, this.activeUploads.length)
        for (const file of e.target.files) {
            this.startOpplasting(file,assessmentId)
        }
        e.target.value = ""
    }

    startOpplasting(file,assessmentId) {
        const newUpload = {
            file,
            Filename: file.name,
            LastModified: file.lastModified,
            Size: file.size,
            Url: `${this.baseDirectory}/${file.name}`,
            Description: this.selectedFile.name,
            progressPercentage: -1,
            errorMessage: '',
            assessmentId: assessmentId
        }
        this
            .activeUploads
            .push(newUpload)
        const reader = new FileReader()
        reader.onload = ((file) => (e) => {
            upload(newUpload, this.props.onUploadComplete)
        })(file)
        reader.readAsBinaryString(file)
        return {newUpload, reader}
    }

    thisFileUpload() {
        document.getElementById("file").click();
    };

    render() {
        const {appState, appState:{assessment}} = this.props
        if (this.context.readonly)
            return null
        return (<div className="fileUpload">
            <h4>Last opp nytt filvedlegg</h4>
            <Xcomp.String className="col-md-8" observableValue={[this.selectedFile, 'name']} placeholder={"Beskrivende navn (obligatorisk)"}/>
            <input style={{marginTop: '20px'}} onChange={(e) => this.startOpplastinger(e,assessment.id)} type="file" multiple />
             <Documents/>
            <input type="file" id={"file"} style={{display:"none" }} onChange={(e) => this.startOpplastinger(e,assessment.id)} multiple/>
            <button className="btn btn-primary" id="button" name="button" disabled={this.selectedFile.name === ""} style={{marginLeft: '30px', marginTop: '20px'}} onClick={() => this.thisFileUpload()}>Velg fil</button>
        </div>);
    }
}
