import React from 'react'
import { observer } from 'mobx-react'
import Opplasting from './Opplasting'
import ProgressBar from './ProgressBar'
import * as Xcomp from '../observableComponents'
import config from '../../../config'

@observer
export default class Filliste extends React.Component {
    constructor() {
        super()
        this.state = { selectedFilename: null }
    }
    render() {
        const {vurdering, labels} = this.props
        // const labels = fabModel.kodeLabels.DistributionHistory
        const docs = Filliste.isEmpty(this.props.Files) && Filliste.isEmpty(this.props.activeUploads)
            ? (
                <tr>
                    <td>{labels.noDocuments}.</td>
                </tr>
            )
            : (
                <tr>
                    <th>{labels.filename}</th>
                    <th style={{
                        width: "50%"
                    }}>{labels.fileDescription}</th>
                </tr>
            )
        return (
            <div>
                <table
                    className="table table-striped table-hover"
                    style={{
                        width: "100%",
                        border: 1
                    }}>
                    <thead>
                        {docs}
                    </thead>
                    <tbody>
                        {this
                            .props
                            .Files
                            .map(x => this.renderFile(x, this.state.selectedFilename))}
                        {this
                            .props
                            .activeUploads
                            .map(x => Filliste.renderUpload(x))}
                    </tbody>
                </table>
                <Opplasting
                    baseDirectory={this.props.baseDirectory}
                    activeUploads={this.props.activeUploads}
                    onUploadComplete={(ul) => this.handleUploadComplete(ul)} />
            </div>
        )
    }

    static isEmpty(v) {
        if (!v)
            return true
        return v.length == 0
    }

    handleUploadComplete(upload) {
        this
            .props
            .activeUploads
            .remove(upload)
        const doc = upload
        for (let i = 0; i < this.props.Files.length; i++) {
            const old = this.props.Files[i]
            if (old.Filename == doc.Filename) {
                this.props.Files[i] = doc
                return
            }
        }
        this.props.Files.push(doc)
        this.setState({ selectedFilename: doc.Filename });
    }

    renderFile(x, selectedFilename) {
        return (
            <tr key={x.Filename}>
                <td className="text-nowrap">
                    <a href={`${config.apiUrl}dokument/${x.Url}`} target="#top">
                        {Filliste.renderIcon(x.Filename)}&nbsp; {x.Filename}
                    </a>&nbsp;({Math.round(x.Size / 1024)}&nbsp;kB)</td>
                <td onClick={() => { this.rediger(x) }}>
                    {selectedFilename === x.Filename
                        ? <Xcomp.HtmlString observableValue={[x, 'Description']} />
                        : <div><i className="fa fa-pencil"/>
                            &nbsp;<span dangerouslySetInnerHTML={{ __html: x.Description }} /></div>
                    }
                </td>
                <td style={{
                    cursor: "pointer"
                }}>
                    <span
                        className="glyphicon glyphicon-trash"
                        onClick={() => {
                            this.fjernDokument(x)
                        }} />
                </td>
            </tr>
        )
    }

    static renderUpload(x) {
        return (
            <tr key={`UL_${x.Filename}`}>
                <td className="text-nowrap">
                    {x.Filename}
                    &nbsp;({Math.round(x.Size / 1024)}
                    kB)</td>
                <td>
                    {x.errorMessage
                        ? <div
                            style={{
                                fontWeight: 'bold',
                                color: 'red'
                            }}>{x.errorMessage}</div>
                        : x.progressPercentage >= 0
                            ? <ProgressBar percent={x.progressPercentage} />
                            : null
                    }
                </td>
            </tr>
        )
    }

    static renderIcon(filename) {
        return (<i
            className={Filliste.iconClassForFile(filename)}
            style={{
                fontSize: 20
            }} />)
    }

    static iconClassForFile(filename) {
        const ext = Filliste.getFileExtension(filename)
        const icons = {
            "pdf": "file-zip-o",
            "txt": "fa-file-text",
            "xlsx": "fa-file-excel-o",
            "docx": "fa-file-word-o",
            "zip": "fa-file-zip-o",
            "jpg": "fa-file-picture-o",
            "png": "fa-file-picture-o",
            "r": "fa-file-code-o"
        }
        if (icons[ext] === undefined)
            return 'fa fa-file-o'
        return `fa ${icons[ext]}`
    }

    static getFileExtension(filename) {
        const a = filename.split('.')
        if (a.length === 1 || (a[0] === "" && a.length === 2))
            return ''
        return a
            .pop()
            .toLowerCase()
    }

    rediger(x) {
        this.setState({ selectedFilename: x.Filename })
    }

    fjernDokument(x) {
        this
            .props
            .Files
            .remove(x)
    }
}
