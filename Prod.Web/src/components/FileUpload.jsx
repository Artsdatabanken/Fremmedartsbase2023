import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {upload} from '../apiService'
import Documents from './documents'

import { toJS, observable, extendObservable, makeObservable } from 'mobx';
import * as Xcomp from './observableComponents'

class FileUpload extends Component {
    selectedFile = observable({
        name: ''
    })

    activeUploads = [];

    constructor(props) {
        super(props);

        makeObservable(this, {
            activeUploads: observable
        });
    }

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
    }

    render() {
        const {appState, appState:{assessment}, showButtonOnly, labels, attachments} = this.props
        const disabled = appState.userContext.readonly
        if (this.context.readonly)
            return null
        return (<div className="fileUpload">
            {!showButtonOnly &&
            <>
            <h5>{attachments.length > 0 || (assessment.datasett && assessment.datasett.files && assessment.datasett.files.length > 0) ? labels.General.uploadMoreFiles : labels.General.uploadFiles}</h5>
            {/*<h5>Last opp nytt filvedlegg</h5>*/}
            <Xcomp.String className="col-md-12" disabled = {disabled} observableValue={[this.selectedFile, 'name']} placeholder={"Beskrivende navn (obligatorisk)"}/></>}
            {/* <input style={{marginTop: '20px'}} onChange={(e) => this.startOpplastinger(e,assessment.id)} type="file" multiple />
            <Documents/> */}
            <input type="file" id={"file"} style={{display:"none" }} onChange={(e) => this.startOpplastinger(e,assessment.id)} multiple/>
            <button className="btn btn-primary" 
                    id="button" name="button"
                    disabled = {disabled || this.selectedFile.name == ""}
                    //disabled={this.selectedFile.name === ""} 
                    style={{marginLeft: '15px', marginTop: '20px'}} 
                    onClick={() => this.thisFileUpload()}>{labels.General.chooseFile}</button>
        </div>);
    }
}

export default inject('appState')(observer(FileUpload));
