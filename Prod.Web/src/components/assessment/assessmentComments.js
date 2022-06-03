import React, { Component } from 'react'
import { observer, inject } from 'mobx-react';
import { toJS, observable, makeObservable } from 'mobx';
import * as Xcomp from './observableComponents'
import config from '../../config'
import { action } from 'mobx';
import { loadData, postData } from './../../apiService';
import auth from './../authService'
export default inject('appState')(observer(class AssessmentComments extends Component {
    baseUrl = config.apiUrl + "/api/AssessmentComments/"
    constructor(props) {
        super()
        makeObservable(this, {
            comments: observable
        });
        this.assessmentId = props.appState.assessment.id
        this.getComments() // henter første gangen
    }
    assessmentId = "";
    comments = [];
    comment = observable({
        newComment: ""
    })
    addComment = (newComment, appState) => {
        postData(
            this.baseUrl + this.assessmentId, {
                assessmentId: this.assessmentId,
                comment: newComment
            }, 
            ok => { 
                if (ok) { 
                    // clear new comment box
                    action(() => {
                        this.props.appState.newComment = ''
                    })()
                    this.getComments()
                } 
            }, 
            exception => { console.error(exception) }
        )
        appState.loadCurrentExpertgroupAssessmentList()
    }
    getComments = () => {
        loadData(this.baseUrl + this.assessmentId, this.updateCommentsList, exception => { console.error(exception) })        
    }
    updateCommentsList = (item) => {
        action(() => {
            this.comments = item;
        })()
            
    }
    deleteComment = (id, appState) => {
        // kun lov til å slette sine egne kommentarer
        // behandle kommentar før man sletter den
        loadData(
            this.baseUrl + 'close/' + id, 
            ok => { 
                if (ok) { 
                    console.log(id + ' lukket')
                    this.getComments()
                } 
            },
            exception => { console.error(exception) }
        )
        // console.log("Behandlet " + id)
        // dette er id til kommentar - ikke assessmentid
        loadData(
            this.baseUrl +'delete/' + id,
            ok => { 
                if (ok) { 
                    // kommentar = this.baseUrl + this.assessmentId.comments[id]
                    // console.log(id + ' slettet')
                    this.getComments()
                } 
            },
            exception => { console.error(exception) }
        )
        appState.loadCurrentExpertgroupAssessmentList()
    }   
    closeComment = (id, appState) => {
        // kun skriver i ekspertgruppe og bedre kan lukke kommentarer
        // dette er id til kommentar - ikke assessmentid
        loadData(
            this.baseUrl + 'close/' + id,
            ok => { 
                if (ok) { 
                    console.log(id + ' lukket')
                    this.getComments()
                } 
            },
            exception => { console.error(exception) }
        )
        appState.loadCurrentExpertgroupAssessmentList()
    }
    linkify(text) {
        var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;        
        var emailRegex = /(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/ig;
        // fjerner overskrift-stylingen og font-formateringen
        var headerRegex = /style/ig;
          let headers = text.match(headerRegex);
          if (headers) {
            for (let i = 0; i < headers.length; i++) {
                text = text.replace(headers[i], " ");
              }
          }
        let resText = ""
        if (text.indexOf("Rødlisteteamet") > -1 || text.indexOf("Dette kan skyldes") > -1) {
            let start = text.indexOf("Rødlisteteamet")-2
            if (start < 0) {
                start = text.indexOf("Dette kan skyldes")-2
            }
            if (text[start] != undefined) {
                if (text[start] === ".") {
                
                    resText = text.slice(0, start-1).concat(text.slice(start, text.length))
                } 
            }
        }
        if (resText === "") {
            resText = text
        }
        if(resText.indexOf("<a") < 0 ) {
            var newText = ""
            var finalText = ""
            var showUrl = ""
            if (resText.indexOf("@") > -1) {
                newText = resText.replace(emailRegex, function(email) {
                    return '<a href="mailto:' + email + '" target="_blank" rel="noreferrer">' + email + '</a>';
                });
            finalText = newText.replace(urlRegex, function(url) {
                if (url.length > 50) {
                    showUrl = url.slice(0, 50)+"..."
                    return '<a href="' + url + '" target="_blank" rel="noreferrer">' + showUrl + '</a>'
                } else {
                    return '<a href="' + url + '" target="_blank" rel="noreferrer">' + url + '</a>'
                }
                
            });
            return finalText
            }
            finalText = resText.replace(urlRegex, function(url) {                
                if (url.length > 50) {
                    showUrl = url.slice(0, 50)+"..."
                    return '<a href="' + url + '" target="_blank" rel="noreferrer">' + showUrl + '</a>'
                } else {
                    return '<a href="' + url + '" target="_blank" rel="noreferrer">' + url + '</a>'
                }
            });
            return finalText
        } 
        else {
            var finalText = ""
            var link = /<a href/ig;        
            var urlShow =/>(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])</ig;
            finalText = resText.replace(urlShow, function(url) {           
                if (url.length > 50) {
                    showUrl = url.slice(0, 50)+"..." + "<"
                    return showUrl 
                } else {
                    return url 
                }
            });
            finalText= finalText.replace (link, function (target){
                return '<a target="_blank" rel="noreferrer" href'
            });
            //console.log(finalText);
            return finalText 
        }
    }
    
    render() {
        const { appState, appState: { assessment, koder, antallVurderinger } } = this.props
        const rolle = appState.roleincurrentgroup
        const labels = appState.codeLabels.assessmentComments
        var antallKommentarer = 0;
        this.comments.forEach (entry => {
            if (!entry.closed && !entry.isDeleted){
                antallKommentarer ++
            }
        })        
        return (
            <div className="page_container">
                <br></br>
                <div className="page_wrapper">
                    <div className="form_category">
                        <h2>{labels.heading}</h2>
                        <div className="form_item">
                            <table className="table table-striped comments">
                                <thead>
                                    <tr>
                                        <th>{labels.id}</th>
                                        <th>{labels.comments}</th>
                                        <th></th>
                                        <th>{labels.author}</th>
                                        <th>{labels.date}</th>
                                        <th>{labels.delete}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {this.comments && this.comments.map((item) => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                    
                                        {item.isDeleted === false ? <td className="content" dangerouslySetInnerHTML={{
                                            __html: this.linkify(item.comment)
                                                }}>
                                        </td> :
                                        <td className="content"> {labels.isDeleted}
                                        </td>}
                                        <td>{item.closed === true && <span> {labels.processed}</span>}</td>                                           
                                        {item.isDeleted === false ? <td>
                                            {item.user}
                                        </td> : <td>
                                        </td>}
                                        {item.isDeleted === false ? <td>
                                            {item.commentDate.substring(0,10)}
                                        </td> : <td>
                                        </td>}
                                        {item.isDeleted === false ? <td>
                                        <button className="btn btn-primary btn-xs" disabled={item.userId != auth.user.profile.sub} onClick={() => {this.deleteComment(item.id, appState)}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                        </svg>
                                        </button>                                   
                                        { (rolle.admin || rolle.writeAccess) && 
                                        <button className="btn btn-primary btn-xs" disabled={item.closed}  onClick={() => {this.closeComment(item.id, appState)}}>{labels.processed}</button> } 
                                        </td> 
                                        : <td> </td>}
                                    </tr>                             
                                )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="form_category">
                        <div className="container_description">
                            <p>{labels.writeCommentHere}</p>
                        </div>
                        <Xcomp.HtmlString disabled={false} 
                            className={"commentField"}
                            editable={true}
                            observableValue={[appState, 'newComment']}
                        />
                        <button className="btn btn-primary sendComment" onClick={() => { this.addComment(appState.newComment, appState)}}>{labels.send}</button>
                    </div> 
                </div>
            </div>
        )
    }
}));