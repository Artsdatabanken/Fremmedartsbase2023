import React, {Component} from 'react'
import { observer, inject } from 'mobx-react';
import {autorun, action, extendObservable, observable, toJS} from 'mobx';
//import {deleteData, loadData, postData, putData} from '../apiService';
import * as Xcomp from './observableComponents';
import config from '../../config'
import auth from '../authService'

@inject('appState')
@observer
export default class AssessmentReferences extends Component {

    constructor(props) {
        super()
        //const {appState, appState:{assessment, koder}} = this.props
        // let references = assessment.references;
        // console.log(JSON.stringify(references));
        //const references = vurdering.References
        //event.on('addreference', (arg) => console.log("new reference added: " + arg))

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
            theAssessment : null
            //typeVerdier: [] // todo: fabModel.coder.... ?
        })

        extendObservable(this, {
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

        // this.sorteringsVerdier = [
        //     {
        //         text: 'Tittel',
        //         value: "Title;asc"
        //     }, {
        //         text: 'Tittel - omv',
        //         value: "Title;desc"
        //     }, {
        //         text: 'Author',
        //         value: "Author;asc"
        //     }, {
        //         text: 'Author - omv',
        //         value: "Author;desc"
        //     }, {
        //         text: 'År',
        //         value: "Year;asc"
        //     }, {
        //         text: 'År - omv',
        //         value: "Year;desc"
        //     }
        // ];
        // this.contextVerdier = [
        //     {
        //         text: 'Alle referanser',
        //         value: "None"
        //     }, {
        //         text: 'Referanser knytt til FAB 3',
        //         value: "Local"
        //     }, {
        //         text: 'Egne registrerte referanser',
        //         value: "Personal"
        //     }
        // ];
        this.typeVerdier = [
          /*   {
                text: 'Alle felt',
                 value: "All"
             }, 
             */{
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
            //const side = 0;
             //const pageSize = 10;
            // const sortering = this.valgtSortering
            // const res = sortering.split(";")
            // const restrictType = this.valgtContext
            // const subSearch = this.sokestreng
            // const ref = {
            //     pageIndex: this.side,
            //     pageSize,
            //     sidx: res[0], // sorteringsfelt
            //     sord: res[1], // sortorder
            //     restrictType, // applikasjon/person
            //     subSelect: this.valgtType, // person/URSl (/publikasjon??) (?!)
            //     subSearch // søketekst
            // }
            // storeData("api/referansesok/", ref, this.updateSearchResult.bind(this), 'post')
            
           // if (this.assessment && auth.isLoggedIn)
            this.doReferenceSearch()
        })
        autorun(() => {
            if(this.valgtReferanseId) {
               // loadData(config.referenceApiUrl + "api/References/" + this.valgtReferanseId, this.updateValgtReferanse)
            }
          // if (this.assessment && auth.isLoggedIn)
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
        // r.editDate = '',
        r.applicationId = '',

        r.lastname = '',
        r.middlename = '',
        r.firstname = '',

        // r.title = '',
        r.url = ''

        r.allowEdit= true, 
        r.allowDelete= true

        // r.kanLagres= false
    })

    doReferenceSearch = () => {
       // const side = 0;
        const pageSize = 10;
        const sortering = this.valgtSortering
        const res = sortering.split(";")
        const restrictType = this.valgtContext
        const subSearch = this.sokestreng
        const ref = {
            pageIndex: this.side,
            pageSize,
            //sidx: res[0], // sorteringsfelt
            //sord: res[1], // sortorder
            //restrictType, // applikasjon/person
            subSelect: this.valgtType, // person/URSl (/publikasjon??) (?!)
            subSearch // søketekst
        }
        const url = config.referenceApiUrl + "api/References?offset=0&limit=50&search="+subSearch
        //loadData(url, this.updateSearchResult.bind(this))
        
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
                    //todo: oppdater redigeringstype
                    this.doReferenceSearch()

                    // redigeringsType(thingy.type());
                    //sokeresultat([{ id: data.id, type: data.type, referenceString: data.referenceString }]);
                    //console.log(sokeresultat)
                }
            )
            this.addNew = true
        } else {
            putData(
                config.getUrl("Reference/" + clone.id),
                clone,
                data => {
                    this.updateValgtReferanse(data)
                    //todo: oppdater redigeringstype
                    this.doReferenceSearch()
                    this.updateReferenceFromAssessment(this.theAssessment, data)
                    // redigeringsType(thingy.type());
                    //sokeresultat([{ id: data.id, type: data.type, referenceString: data.referenceString }]);
                    //console.log(sokeresultat)
                }
            )
            console.log("Referanse oppdatert!")
        }
        //this.editMode = false
        this.valgtReferanse.allowDelete = true
        
        this.alreadySaved = true
        // console.log("Lagret referanse")
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
        const refs = assessment.referanser
        const ref = refs.find(r => r.referenceId === id)
        if(ref) {
            this.fjernReferanse(assessment, ref)
        }
    })
    _updateReferenceFromAssessment = action((assessment, value) => {        
        let refs = assessment.referanser
        console.log(refs)
        let result = refs.slice().sort(this.compare)
        refs = result
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
        } else {

            console.log ("Success!")
        }
        this.valgtReferanse.allowDelete = false
        console.log("Slettet referansen")
    })

    fjernReferanse = action((assessment, ref) => {             
        const result = assessment.referanser.remove(ref);
        console.log(`item removed : ${  result}`)
    })

    leggTilReferanse = action((assessment, value) => {
        const reference = observable({type: value.referenceType, referenceId: value.id, formattedReference: value.referencePresentation, url: value.url});       
        const refs = assessment.referanser;
        
        
        //let found = false;
        
        if (refs){
        /*for (let i = 0; i < refs.length; i++) {
            const referenceId = refs[i].referenceId;
            if (referenceId === reference.referenceId) {
                found = true;
                break;
            }
        }
    
        if (found) {
            //logger.error(config.toasts.referenceExists);
            console.log("Referansen finnes allerede i vurderingen")
        } else {*/
            assessment
                .referanser
                .push(reference);
        //}
    } else {
        assessment.referanser = [];
        assessment
                .referanser
                .push(reference);
    }
        //event.trigger('addreference', reference.ReferenceId);
        if (document.getElementById(value.id) != null) {
                document.getElementById(value.id).setAttribute('disabled', 'true')
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
        // r.editDate = item.editDate.substring(0,10)
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
        // r.kanLagres= false
    })
    compare(a, b) {
        let bandA = ""
        let bandB = ""
        // Use toUpperCase() to ignore character casing
        if (a.formattedReference && b.formattedReference) {
            bandA = a.formattedReference.toUpperCase();
            bandB = b.formattedReference.toUpperCase();
        } else {
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
    _updateSearchResult = action((data) => {
        let result = data.slice().sort(this.compare)
        this.sokeresultat = result
    //    for (let i = 0; i < data.length; i++){
    //         this.sokeresultat[i] = data[i];     
    //         }      

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
        //const {vurdering, viewModel, labels, codes} = this.props;
        const {appState, appState:{assessment, assessment:{referanser}, koder, refcodes}} = this.props
        //console.log(JSON.stringify(referanser));
        const kodeTekst = (kodegruppe, id) => {
            const gr = koder[kodegruppe]
            if (!gr) return "no code group: " + kodegruppe
            const match = gr.find(kode => kode.value = id)
            return match && match.text ? match.text : id
        }
        this.theAssessment = assessment

        //var sortedReferences = assessment.referanser.slice().sort(this.compare)
                
        return (
            <div className="page_container">
                <div className="page_wrapper">
                <h2>Referanser</h2>
                <div className="form_category">
                        <div className="form_item">
                            
                            {/*<div>Ingen referanser knyttet til vurderingen...</div>*/}
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Referanser knyttet til vurderingen</th>
                                        <th>Type</th>
                                        <th>Fjern</th>
                                    </tr>
                                </thead>
                                <tbody>
                                     <tr>
                               
                                {/*{sortedReferences ? <td> {null} </td> : <td>Ingen referanser knyttet til vurderingen</td>}*/}
                                </tr>                                
                                  {/*  {sortedReferences != null && sortedReferences.map ((referanse) => {         
                                        return (<tr key={referanse.referenceId}>
                                        <td><p dangerouslySetInnerHTML={{
                                         __html: this.linkify(referanse.formattedReference)
                                             }} style={{marginLeft: '30px', textIndent: '-30px'}}/> </td>
                                        <td><span>{referanse.type}</span> </td>
                                        <td><Xcomp.Button className="btn btn-primary btn-xs" onClick={() => {this.removeReferenceFromAssessment(assessment, referanse.referenceId)}}>Fjern</Xcomp.Button></td>
                                     </tr>)
                                    })}*/}
                                </tbody>
                            </table>            
                        </div>
                    </div>

                    <div className="form_category">
                        <h3>Søk referanser</h3>
                        <div className="form_item_search">                            
                            <div className="search"><label htmlFor="sokReferanse">Søkefelt:</label><br></br>
                            <Xcomp.String observableValue={[this, 'sokestreng']}/></div>                            
                      <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Velg</th>
                                <th>Referanse</th>
                                <th>Type</th>
                                <th>Vis/rediger</th>
                            </tr>
                        </thead>
                        <tbody>                           

                            {this.sokestreng != "" && this.sokeresultat.length > 0 &&             
                                      this.referencePage.map ((reference) => {
                                        return (<tr key={reference.id} style={{height: '50px'}}> 
                                            <td>
                                                 <button className="btn btn-primary btn-xs"
                                                    id={reference.id}                                                    
                                                    disabled={this.context.readonly}                                                     
                                                    onClick={() => {this.leggTilReferanse(assessment, reference)}}>Legg til</button>
                                             </td>
                                             <td dangerouslySetInnerHTML={{
                                         __html: this.linkify(reference.referencePresentation) }} />
                                             <td>
                                                 <span>{reference.referenceType}</span>
                                            </td>
                                            <td>
                                                 <Xcomp.Button primary xs
                                                     disabled={this.context.readonly}
                                                     onClick={() => {this.visDetalj(reference)}}>Vis detaljer</Xcomp.Button>
                                      </td></tr>) 
                                    })}     
                        </tbody>
                    </table>
                    {this.sokestreng != "" && this.sokeresultat.length > 0 && <> <Xcomp.Button primary xs
                        onClick={action(() => {
                        if (this.side > 0) {
                            this.side--
                        }
                    })}
                disabled={this.side <= 0}>Forrige side</Xcomp.Button>
                    &nbsp;
                    <Xcomp.Button primary xs 
                        onClick={action(() => this.side++)}
                        disabled={this.side >= this.sokeresultat.length/this.pageSize-1}
                        >Neste side</Xcomp.Button> </>}
                       </div> 
                    </div>
                    
                    <div className="form_item row">                            
                            <div><strong>Referansetype</strong></div><br></br>
                                <div style={{display:'flex', 'marginTop': '10px', 'marginBottom': '10px'}}><Xcomp.StringEnum observableValue={[this, 'redigeringsType']} disabled={!this.editMode} codes={this.typeVerdier}/>
                                <div><Xcomp.Button primary onClick={() => {this.nyReferanse()}}>{"Ny referanse"}</Xcomp.Button></div>
                            </div>   
                        </div>

                    {this.editMode && <div className="form_category">
                    <h3>Rediger referanse/Legge til ny referanse</h3>                       
                        {(this.redigeringsType == 'Reference' )&& 
                            <table className="table-striped ref">
                            <thead>                                
                               </thead>
                               <tbody>

                                <tr>
                                    <td className="ref">Friformat referanse(r):</td>
                                    <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'referenceString']}/></td>
                               </tr>  
                               <tr>
                                <td className="ref">URL/doi:</td>
                                <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'url']}/></td>
                            </tr>                             
                               </tbody>
                            </table>}
                        
                        

                        {(this.redigeringsType == 'Publication' )&& <table className="table-striped ref">
                                <thead>                                
                               </thead>
                               <tbody>
                            <tr>
                                <td className="ref"> Forfatter(e):</td> 
                                <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'author']}/></td>
                            </tr>
                            <tr>
                                <td className="ref">Årstall:</td>
                                <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'year']}/></td>
                            </tr>
                            {/* <div className="form_item">
                                <div>Endringsdato:</div>
                                <div><Xcomp.String observableValue={[this.valgtReferanse, 'editDate']}/></div>
                            </div> */}
                            {/* <div className="form_item">
                                <div>Bruker-ID:</div>
                                <div><input className="form-control" defaultValue={this.valgtReferanse.userId} /></div>
                            </div> */} 
                            
                            <tr>
                                <td className="ref">Tittel:</td>
                                <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'title']}/></td>
                            </tr>
                            
                            <tr>
                                <td className="ref">Journal:</td>
                                <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'journal']}/></td>
                            </tr>
                            <tr>
                                <td className="ref">Volum:</td>
                                <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'volume']}/></td>
                            </tr>
                            <tr>
                                <td className="ref">Sider:</td>
                                <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'pages']}/></td>
                            </tr> 
                            <tr>
                                <td className="ref">URL/doi:</td>
                                <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'url']}/></td>
                            </tr>      
                            <tr>
                                <td className="ref">Bibliografi:</td>
                                <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'bibliography']}/></td>
                            </tr>
                                                           
                            </tbody>
                          </table>   }                    


                          {(this.redigeringsType == 'Person') && <table className="table-striped ref">
                                <thead>                                
                                </thead>
                               <tbody>
                            <tr>
                                <td className="ref">Etternavn:</td>
                                <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'lastname']}/></td>
                            </tr>
                            <tr>
                                <td className="ref">Mellomnavn:</td>
                                <td><Xcomp.String className="ref" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'middlename']}/></td>
                            </tr>
                            <tr>
                                <td className="ref">Fornavn:</td>
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
                                <td className="ref">Tittel:</td>
                                <td><Xcomp.String className="longRef" onFocus={action(() => {this.alreadySaved = false})} observableValue={[this.valgtReferanse, 'title']}/></td>
                            </tr>} 
                            <tr>
                                <td className="ref">URL:</td>
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
                            } onClick={() => {this.lagreReferanse()}}>{"Lagre/oppdatere referanse"} </Xcomp.Button>
                            <Xcomp.Button primary disabled={(!(this.valgtReferanse.allowDelete && this.valgtReferanse.id != 'NY_REFERANSE')) }                                       
                                        onClick={() => {this.slettReferanse()}}>{"Slett referanse"}</Xcomp.Button>
                            <Xcomp.Button primary disabled={!this.addNew}                                       
                                        onClick={() => {this.leggTilReferanse(assessment, this.valgtReferanse)}}>{"Legg til"}</Xcomp.Button>
                    </div>}                    
                </div>
            </div>
        )}}