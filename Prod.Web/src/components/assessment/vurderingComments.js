import React, { Component } from 'react'
import { observer, inject } from 'mobx-react';
import { toJS, observable } from 'mobx';
import * as Xcomp from './observableComponents'
import config from '../../config'
import { action } from 'mobx';
import { loadData, postData } from './../../apiService';
import auth from './../authService'
@inject('appState')
@observer

export default class AssessmentComments extends Component {
    baseUrl = config.apiUrl + "/api/AssessmentComments/"
    
    constructor(props) {
        super()
        this.assessmentId = props.appState.assessment.id
        this.getComments() // henter første gangen
        
    }

    assessmentId = "";
    @observable comments = []
    comment = observable({
        newComment: ""
    })

    addComment = (newComment, appState) => {
        
        // alert('Kommentar er sendt! ' + this.comment.newComment);
        postData(this.baseUrl + this.assessmentId, {
            // id: 1,
            assessmentId: this.assessmentId,
            comment: newComment,
            // commentDate: "2020-03-24T00:00:00+01:00",
            // user: auth.userName,
            // closed: false,
            // closedBy: null,
            // closedDate: "0001-01-01T00:00:00",
            // isDeleted: false
        }, ok => { if (ok) { 
            console.log('kommentert ')
            // clear new comment box
            action(() => {
                this.props.appState.newComment = ''
            })()
            this.getComments()
            
         } }
        , exception => { console.error(exception) });
        
        appState.loadCurrentExpertgroupAssessmentList()
    }
    
    getComments = () => {
        loadData(this.baseUrl + this.assessmentId, this.updateCommentsList, exception => { console.error(exception) })        
        //console.log(this.comments.length)
    }
    
    updateCommentsList = (item) => {
        action(() => {
            this.comments = item;
        })()
            
    }
    
    deleteComment = (id, appState) => {
        // kun lov til å slette sine egne kommentarer
        // dette er id til kommentar - ikke assessmentid
        loadData(this.baseUrl +'delete/' + id
        , ok => { if (ok) { 
            // kommentar = this.baseUrl + this.assessmentId.comments[id]
            // action(() => { kommentar.isDeleted = true })()
            console.log(id + ' slettet')
            this.getComments()
            
         } }
        , exception => { console.error(exception) })
        //this.updateCommentsView()
        
        appState.loadCurrentExpertgroupAssessmentList()
    }   
    
    closeComment = (id, appState) => {
        // kun skriver i ekspertgruppe og bedre kan lukke kommentarer
        // dette er id til kommentar - ikke assessmentid
        loadData(this.baseUrl + 'close/' + id
        , ok => { if (ok) { 
            console.log(id + ' lukket')
            this.getComments()
         } }
        , exception => { console.error(exception) })
        
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
                
        var antallKommentarer = 0;
        this.comments.forEach (entry => {
            if (!entry.closed && !entry.isDeleted){
                antallKommentarer ++
            }
        })        
      
        return (
            <div className="page_container">
                <div className="page_wrapper">
                 <div className="form_category">
                       <div className="form_item">
                        <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Kommentarer knyttet til vurderingen</th>
                                        <th></th>
                                        <th>Autor</th>
                                        <th>Dato</th>
                                        <th>Slett</th>
                                    </tr>
                                </thead>
                                 <tbody>
                            {this.comments &&
                                this.comments.map((item) => {
                                return (
                                <tr key={item.id} style={{borderTop: '1px solid black'}}>
                                    <td style={{width: '5%', paddingTop: '10px', paddingRight: '10px'}}>{item.id}</td>
                                   
                                    {item.isDeleted === false ? <td dangerouslySetInnerHTML={{
                                         __html: this.linkify(item.comment)
                                             }}
                                             style={{width: '45%', paddingTop: '10px', fontFamily: 'Arial'}}>
                                    </td> :
                                     <td style={{width: '45%', paddingTop: '10px'}}> Kommentar er slettet!
                                     </td>}
                                    <td style={{width: '10%', paddingTop: '10px'}}>{item.closed === true && <span style={{color: 'red'}}>Behandlet</span>}</td>                                           
                                    {item.isDeleted === false ? <td style={{width: '20%', paddingTop: '10px'}}>
                                        {item.user}
                                    </td> : <td style={{width: '20%', paddingTop: '10px'}}>
                                    </td>}
                                    {item.isDeleted === false ? <td style={{width: '20%', paddingTop: '10px'}}>
                                        {item.commentDate.substring(0,10)}
                                    </td> : <td style={{width: '20%', paddingTop: '10px'}}>
                                    </td>}
                                    {item.isDeleted === false ? <td style={{display: 'flex', width: '100%', paddingTop: '10px'}}>
                                    <button className="btn btn-primary btn-xs" disabled={item.userId != auth.user.profile.sub} onClick={() => {this.deleteComment(item.id, appState)}}>Slett</button>                                   
                                    { (rolle.leder || rolle.skriver) && <button className="btn btn-primary btn-xs" disabled={item.closed}  onClick={() => {this.closeComment(item.id, appState)}}>Behandlet</button> }                                                                       
                                </td> : <td style={{display: 'flex', width: '100%', paddingTop: '10px'}}>                                    
                                </td>}
                                </tr>                             
                            )})}
                            </tbody>
                        </table>
                        </div>
                        </div>

                        <div className="form_category">
                            <div className="container_description">
                                <p>Her kan du skrive kommentar på vurderingen.</p>
                            </div>

                        <Xcomp.HtmlString disabled={false} 
                            style={{height: '35%', fontFamily: 'Arial', fontSize: '14px'}}
                            editable={true}
                            observableValue={[appState, 'newComment']}
                            // // // codes={koder.tilbakemeldinger} mode="radio"
                        />
                        <button className="btn btn-primary" style={{marginTop: '20px'}} onClick={() => { this.addComment(appState.newComment, appState)}}>Send</button>
                    
                </div> 
            </div>
            
            </div>
        )
    }
}