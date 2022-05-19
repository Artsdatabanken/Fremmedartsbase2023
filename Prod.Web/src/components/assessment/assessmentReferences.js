import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import {autorun, action, extendObservable, observable, toJS} from 'mobx';
import {deleteData, loadData, postData, putData} from './../../apiService';
import * as Xcomp from './observableComponents';
import config from './../../config';
import auth from './../authService'

export default inject('appState')(observer(class AssessmentReferences extends Component {

    constructor(props) {
        super()
        extendObservable(this, {
            redigeringsType: 'Reference',
            editMode: false,
            side: 0,
            sokestreng: "",
            _sokestrengDelayed: "", //updated by autorunAsync
            valgtSortering: "Title;asc",
            valgtContext: "",
            valgtType: "All",
            valgtReferanseId: null,

            valgtReferanse: {
                'id': '',
                'author': '',
                'year': '',
                'title': '',
                'summary': '',
                'journal': '',
                'volume': '',
                'referenceString': '',
                'pages': '',
                'bibliography': '',
                'keywords': '',
                'lastname': '',
                'middlename': '',
                'firstname': '',
                'url': '',

                allowEdit: false,
                allowDelete: false
            },
            sokeresultat: [],
            antallSider: 0,
            pageSize: 10,
            startIndex: 0,
            endIndex: 0,
            addNew: false,
            alreadySaved: false,
            contextVerdier: [],
            theAssessment : null,
            kanLagres: () => {
                    const r = this.valgtReferanse
                    return !r.allowEdit 
                        ? false
                        : (
                            r.author 
                            || r.year 
                            || r.title 
                            || r.summary 
                            || r.journal 
                            || r.volume 
                            || r.referenceString
                            || r.pages 
                            || r.bibliography 
                            || r.keywords
                            || r.lastname
                            || r.middlename
                            || r.firstname
                            || r.url
                            )
                }
        })
        this.typeVerdier = [
            {
                text: 'Referansetekst',
                value: "Reference"
            }, {
                text: 'Publikasjoner',
                value: "Publication"             
            },  {
                text: 'Personer',
                value: "Person"
            }, {
                text: 'Url',
                value: "Url"
            }
        ];

        // autorun(() => {
        //     console.log(`side: ${  this.side} type: ${this.redigeringsType }`)
        // })

        autorun(() => {
            this.doReferenceSearch()
        })
        autorun(() => {
            if(this.valgtReferanseId) {
                loadData(config.referenceApiUrl + "api/References/" + this.valgtReferanseId, this.updateValgtReferanse)
            }
            this.doReferenceSearch()        
        })
    }
    nyReferanse = action(() => {
        this.editMode = true
        this.addNew = false
        this.alreadySaved = false
        const r = this.valgtReferanse
        r.id = 'NY_REFERANSE',
        r.author = '',
        r.year = '',
        r.title = '',
        r.summary = '',
        r.journal = '',
        r.volume = '',
        r.pages = '',
        r.bibliography = '',
        r.keywords = '',
        r.referencePresentation = '',
        r.referenceString = '',
        r.userId = auth.userId,
        r.applicationId = null,
        r.lastname = '',
        r.middlename = '',
        r.firstname = '',
        r.url = ''
        r.allowEdit= true, 
        r.allowDelete= true
    })

    doReferenceSearch = () => {
        const pageSize = 10;
        const sortering = this.valgtSortering
        const res = sortering.split(";")
        const restrictType = this.valgtContext
        const subSearch = this.sokestreng
        const ref = {
            pageIndex: this.side,
            pageSize,
            subSelect: this.valgtType,
            subSearch // søketekst
        }
        const url = config.referenceApiUrl + "api/References?offset=0&limit=50&search="+subSearch
        loadData(url, this.updateSearchResult.bind(this))
        
    }

    lagreReferanse = action(() => {
        var clone = toJS(this.valgtReferanse)
        console.log(clone);
        if (clone.id === "NY_REFERANSE") {
            clone.id = "00000000-0000-0000-0000-000000000000"
            postData(
                config.getUrl("Reference"),
                clone,
                data => {
                    this.updateValgtReferanse(data)
                    this.doReferenceSearch()
                }
            )
            this.addNew = true
        } else {
            // console.log(config.getUrl("References/" + clone.id))
            putData(
                config.getUrl("Reference/" + clone.id),
                // config.referenceApiUrl +"api/References/" + clone.id,
                clone,
                data => {
                    this.updateValgtReferanse(data)
                    this.doReferenceSearch()
                    this.updateReferenceFromAssessment(this.theAssessment, data)
                }
            )            
        }
        this.valgtReferanse.allowDelete = true
        this.alreadySaved = true
    })
    getFirstLine(string) {
        var modified = string.split(/\s+/)
        var kort = true
        var firstLine = ""
        var i = 0
        while (kort) {
            if (firstLine.length + modified[i].length < 80 ) {
                firstLine += modified[i]
                firstLine += " "
                i++            
            } else {
                kort = false
            }
        }        
        return firstLine
    }
    getRestOfLines(string) {
        var startPosition = this.getFirstLine(string).length
        var restOfLines = string.substring(startPosition, string.length)
        return restOfLines
    }
    removeReferenceFromAssessment = action((assessment, id) => {        
        const refs = assessment.references
        console.log(refs)
        const ref = refs.find(r => r.referenceId === id)
        if(ref) {
            this.fjernReferanse(assessment, ref)
        }
    })
    updateReferenceFromAssessment = action((assessment, value) => {        
        let refs = assessment.references
        let result = refs.slice().sort(this.compare)
        refs = result
        console.log(refs)
        const ref = refs.find(r => r.referenceId === value.id)
        if(ref) {
            ref.type = value.referenceType
            ref.formattedReference = value.referencePresentation
            ref.url = value.url
        }
    })
    slettReferanse = action(() => {
        const clone = toJS(this.valgtReferanse)
        if (clone.id != "NY_REFERANSE") {
            // eksisterende
            deleteData(config.getUrl("Reference/" + clone.id), clone, (data) =>{
                console.log(data)
                this.nyReferanse()
                this.doReferenceSearch()
                this.removeReferenceFromAssessment(this.theAssessment, clone.id)
            });
        }
        this.valgtReferanse.allowDelete = false
        console.log("Slettet referansen")
    })
    fjernReferanse = action((assessment, ref) => {             
        const result = assessment.references.remove(ref);
        console.log(`item removed : ${  result}`)
    })

    leggTilReferanse = action((assessment, value) => {
        const reference = observable({type: value.referenceType, referenceId: value.id, formattedReference: value.referencePresentation, url: value.url});       
        const refs = assessment.references;
        
        if (refs){
       
            assessment
                .references
                .push(reference);
        
        } else {
            assessment.references = [];
            assessment
                    .references
                    .push(reference);
        }        
        if (document.getElementById(value.id) != null) {
            document.getElementById(value.id).setAttribute('disabled', 'true')
            document.getElementById(value.id).style.visibility = "hidden"
        }
        this.addNew = false
        console.log("Already saved: " + this.alreadySaved + " can add: " + this.addNew)
    })
    updateValgtReferanse = action((item) => {
        console.log("update valgt ref: " + JSON.stringify(item))
        const r = this.valgtReferanse
        r.id = item.id
        r.referencePresentation = item.referencePresentation
        r.applicationId = item.applicationId
        r.author = item.author
        r.userId = item.userId
        r.referenceString = item.referenceString
        r.referenceType = item.referenceType
        r.keywords = item.keywords
        r.year = item.year
        r.title = item.title
        r.summary = item.summary
        r.journal = item.journal
        r.volume = item.volume
        r.pages = item.pages
        r.bibliography = item.bibliography
        r.keywords = item.keywords
        r.lastname = item.lastname
        r.middlename = item.middlename
        r.firstname = item.firstname
        r.url = item.url

        r.allowEdit= item.userId == auth.isAdmin || (auth.userId && (item.referenceUsage.length == 0 || (item.referenceUsage.every(x => x.userId == auth.userId))))
        r.allowDelete= item.userId == auth.userId && (!item.referenceUsage || item.referenceUsage.length == 0)
        this.redigeringsType = item.referenceType
    })
    compare(a, b) {
        
        let bandA = ""
        let bandB = ""

        // Use toUpperCase() to ignore character casing
        if (a.formattedReference && b.formattedReference) {            
            bandA = a.formattedReference.toUpperCase();
            bandB = b.formattedReference.toUpperCase();
        } 
            
        else {
            bandA = a.referencePresentation.toUpperCase();
            bandB = b.referencePresentation.toUpperCase();
        }
        let comparison = 0;
        if (bandA > bandB) {
          comparison = 1;
        } else if (bandA < bandB) {
          comparison = -1;
        }
        return comparison;
    }
    updateSearchResult = action((data) => {
        let result = data.slice().sort(this.compare)
        this.sokeresultat = result

        if (this.sokeresultat.length > 0) {
            this.antallSider = Math.ceil(this.sokeresultat.length / this.pageSize)
            this.startIndex = this.side * this.pageSize
            this.endIndex = Math.min(this.startIndex + this.pageSize - 1, this.sokeresultat.length - 1)
            this.referencePage = this.sokeresultat.slice(this.startIndex, this.endIndex +1)
        }    
    })
    visDetalj = action((value) => {
        this.valgtReferanseId = value.id
        this.editMode = true
        this.alreadySaved = false
    })
    linkify(text) {
        var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var showUrl = ""
        return text.replace(urlRegex, function(url) {
            if (url.length > 50) {
                showUrl = url.slice(0, 50)+"..."
                return '<a href="' + url + '" target="_blank" rel="noreferrer">' + showUrl + '</a>'
            } else {
                return '<a href="' + url + '" target="_blank" rel="noreferrer">' + url + '</a>'
            }            
        });
    }
    render() {
        const {appState, appState:{assessment, assessment:{referanser}, koder, refcodes}} = this.props
        const labels = appState.codeLabels
        const kodeTekst = (kodegruppe, id) => {
            const gr = koder[kodegruppe]
            console.log(gr)
            if (!gr) return "no code group: " + kodegruppe
            const match = gr.find(kode => kode.value = id)
            return match && match.text ? match.text : id
        }
        this.theAssessment = assessment        
        var sortedReferences = assessment.references.slice().sort(this.compare)
        const disabled = appState.userContext.readonly
        return (
            <div className="page_container">
                <div className="page_wrapper">
                
                <div className="form_category">
                    <h2>{labels.references.heading}</h2>
                        <div className="form_item">
                            <table className="table table-striped references">
                                <thead>
                                    <tr>
                                        <th>{labels.references.connectedReferences}</th>
                                        <th>{labels.references.type}</th>
                                        <th>{labels.references.remove}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {sortedReferences 
                                        ? <td> {null} </td> 
                                        : <td>
                                            {labels.references.noReferences}
                                        </td>}
                                    </tr>                                
                                    {sortedReferences != null && sortedReferences.map ((referanse) => {return (
                                    <tr key={referanse.referenceId}>
                                        <td>
                                            <p dangerouslySetInnerHTML={{  __html: this.linkify(referanse.formattedReference)}}/>
                                        </td>
                                        <td>
                                            <span>{referanse.type}</span>
                                        </td>
                                        <td>
                                            <Xcomp.Button className="btn btn-primary btn-xs"  title={labels.General.remove} onClick={() => {this.removeReferenceFromAssessment(assessment, referanse.referenceId)}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                                </svg>
                                            </Xcomp.Button></td>
                                     </tr>)
                                    })}
                                </tbody>
                            </table>            
                        </div>
                    </div>
                    <div className="form_item">
                        <Xcomp.Button className={"summary"}>{labels.critDocumentation.showSummary}</Xcomp.Button>
                    </div>
                    
                    <div className="form_category">
                        <h3>{labels.references.searchReferences}</h3>
                        <div className="form_item_search">                            
                            <div className="search"><label htmlFor="sokReferanse">{labels.references.searchField}</label><br></br>
                            <Xcomp.String observableValue={[this, 'sokestreng']} disabled={disabled}/></div>                            
                      <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>{labels.references.choose}</th>
                                <th>{labels.references.reference}</th>
                                <th>{labels.references.type}</th>
                                <th>{labels.references.showOrEdit}</th>
                            </tr>
                        </thead>
                        <tbody>                           
                        {this.sokestreng != "" && this.sokeresultat.length > 0 &&             
                            this.referencePage.map ((reference) => {return (
                            <tr key={reference.id}> 
                                <td>
                                    <button className="btn btn-primary btn-xs"
                                        id={reference.id}   
                                        style={{visibility: this.context.readonly ? "hidden" : "visible"}}                                               
                                        onClick={() => {this.leggTilReferanse(assessment, reference)}}>
                                        {labels.references.add}
                                    </button>
                                </td>
                                <td dangerouslySetInnerHTML={{
                                    __html: this.linkify(reference.referencePresentation) }} />
                                <td>
                                    <span>{reference.referenceType}</span>
                                </td>
                                <td>
                                    <Xcomp.Button primary xs
                                        disabled={this.context.readonly}
                                        onClick={() => {this.visDetalj(reference)}}>
                                        {labels.references.showDetails}
                                    </Xcomp.Button>
                                </td>
                            </tr>
                            )})
                        }     
                        </tbody>
                    </table>
                    {this.sokestreng != "" && this.sokeresultat.length > 0 && <> <Xcomp.Button primary xs
                        onClick={action(() => {
                        if (this.side > 0) {
                            this.side--
                        }
                    })}
                disabled={this.side <= 0}>{labels.references.previousPage}</Xcomp.Button>
                    &nbsp;
                    <Xcomp.Button primary xs 
                        onClick={action(() => this.side++)}
                        disabled={this.side >= this.sokeresultat.length/this.pageSize-1}
                        >{labels.references.nextPage}</Xcomp.Button> </>}
                       </div> 
                    </div>
                    
                    <div className="form_item">                            
                            <div><strong>{labels.references.referenceType}</strong></div>
                            <div className="row">                                
                                <div><Xcomp.Button primary onClick={() => {this.nyReferanse()}}>{labels.references.newReference}</Xcomp.Button></div>
                                <div className="newRef"><Xcomp.StringEnum observableValue={[this, 'redigeringsType']} disabled={!this.editMode} codes={this.typeVerdier}/>
                            </div>
                            </div>   
                        </div>

                    {this.editMode && <div className="form_category">
                    <h3>{labels.references.editOrAddNew}</h3>                       
                        {(this.redigeringsType == 'Reference' )&& 
                            <table className="table-striped ref">
                            <thead>                                
                               </thead>
                               <tbody>

                                <tr>
                                    <td className="ref">{labels.references.freeReference}</td>
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'referenceString']}/></td>
                               </tr>  
                               <tr>
                                <td className="ref">{labels.references.url}</td>
                                <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'url']}/></td>
                            </tr>                             
                               </tbody>
                            </table>}
                        
                        

                        {(this.redigeringsType == 'Publication' ) && <table className="table-striped ref">
                            <thead>                                
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="ref">{labels.references.author}</td> 
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'author']}/></td>
                                </tr>
                                <tr>
                                    <td className="ref">{labels.references.year}</td>
                                    <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'year']}/></td>
                                </tr>
                                <tr>
                                    <td className="ref">{labels.references.title}</td>
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'title']}/></td>
                                </tr>
                                
                                <tr>
                                    <td className="ref">{labels.references.journal}</td>
                                    <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'journal']}/></td>
                                </tr>
                                <tr>
                                    <td className="ref">{labels.references.volume}</td>
                                    <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'volume']}/></td>
                                </tr>
                                <tr>
                                    <td className="ref">{labels.references.pages}</td>
                                    <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'pages']}/></td>
                                </tr> 
                                <tr>
                                    <td className="ref">{labels.references.url}</td>
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'url']}/></td>
                                </tr>      
                                <tr>
                                    <td className="ref">{labels.references.bibloigraphy}</td>
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'bibliography']}/></td>
                                </tr>
                                                           
                            </tbody>
                          </table>   }                    


                          {(this.redigeringsType == 'Person') && <table className="table-striped ref">
                            <thead>                                
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="ref">{labels.references.lastName}</td>
                                    <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'lastname']}/></td>
                                </tr>
                                <tr>
                                    <td className="ref">{labels.references.middleName}</td>
                                    <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'middlename']}/></td>
                                </tr>
                                <tr>
                                    <td className="ref">{labels.references.firstName}</td>
                                    <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'firstname']}/></td>
                                </tr>
                            </tbody>
                        </table>}

                        {(this.redigeringsType == 'Url' ) && <table className="table-striped ref">
                            <thead>                                
                            </thead>
                            <tbody>
                                {this.redigeringsType == 'Url' &&
                                <tr>
                                    <td className="ref">{labels.references.title}</td>
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'title']}/></td>
                                </tr>} 
                                <tr>
                                    <td className="ref">{labels.references.URL}</td>
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'url']}/></td>
                                </tr>
                            </tbody>
                        </table>}
                        <Xcomp.Button primary disabled={this.alreadySaved || (!this.valgtReferanse.allowEdit) ? true
                        : !(
                            this.valgtReferanse.author 
                            || this.valgtReferanse.year 
                            || this.valgtReferanse.title 
                            || this.valgtReferanse.summary 
                            || this.valgtReferanse.journal 
                            || this.valgtReferanse.volume 
                            || this.valgtReferanse.referenceString
                            || this.valgtReferanse.pages 
                            || this.valgtReferanse.bibliography 
                            || this.valgtReferanse.keywords
                            || this.valgtReferanse.lastname
                            || this.valgtReferanse.middlename
                            || this.valgtReferanse.firstname
                            || this.valgtReferanse.url
                            ) 
                            } onClick={() => {this.lagreReferanse()}}> {labels.references.saveOrUpdate}</Xcomp.Button>
                            <Xcomp.Button 
                                primary 
                                disabled={(!(this.valgtReferanse.allowDelete && this.valgtReferanse.id != 'NY_REFERANSE')) } 
                                onClick={() => {this.slettReferanse()}}>
                                {labels.references.removeReference}
                            </Xcomp.Button>
                            <Xcomp.Button primary 
                            // not visible until it's possible to add
                                style={{visibility: this.addNew ? "visible" : "hidden"}}                                       
                                onClick={() => {this.leggTilReferanse(assessment, this.valgtReferanse)}}>
                                {labels.references.add}
                            </Xcomp.Button>
                    </div>}                    
                </div>
            </div>
        )}}));