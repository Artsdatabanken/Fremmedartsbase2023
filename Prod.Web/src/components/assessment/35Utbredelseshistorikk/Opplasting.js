import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
// import {upload} from '../../stores/apiService'

@observer
export default class Opplasting extends React.Component {
    constructor(props) {
        super(props)
        this.status = this.props
        this.baseDirectory = this.props.baseDirectory
    }

    render() {
        if (this.context.readonly)
            return null
        return (
            <div>
                Last opp:
                <input onChange={(e) => this.startOpplastinger(e)} type="file" multiple/>
            </div>
        )
    }

    startOpplastinger(e) {
        this
            .props
            .activeUploads
            .splice(0, this.props.activeUploads.length)
        for (const file of e.target.files) {
            this.startOpplasting(file)
        }
        e.target.value = ""
    }

    startOpplasting(file) {
        const newUpload = {
            file,
            Filename: file.name,
            LastModified: file.lastModified,
            Size: file.size,
            Url: `${this.baseDirectory}/${file.name}`,
            Description: '',
            progressPercentage: -1,
            errorMessage: ''
        }
        this
            .props
            .activeUploads
            .push(newUpload)
        const reader = new FileReader()
        reader.onload = ((file) => (e) => {
            // upload(newUpload, this.props.onUploadComplete)
            alert("upload not implemented")
        })(file)
        reader.readAsBinaryString(file)
        return {newUpload, reader}
    }
}

Opplasting.contextTypes = {
    readonly: PropTypes.bool
}
