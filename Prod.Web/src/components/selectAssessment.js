import React, {Component} from 'react'
import {action, observable} from 'mobx';
import { observer, inject } from 'mobx-react';
import * as Xcomp from './observableComponents';
import HelpIcon from '@material-ui/icons/Help';
import SelectAssessmentTable from './selectAssessmentTable';
import SelectAssessmentStatistics from './selectAssessmentStatistics';
import auth from './authService';
import config from '../config';
import catimg from '../cat.gif';
// const catimg = require('../cat.gif') 


@inject('appState')
@observer
export default class SelectAssessment extends Component {
   
    constructor(props) {
        super()
    }
    @observable show = false;

    resetFilters = action((appState) => {
        appState.expertgroupCategoryCheckboxFilter = []
        appState.expertgroupAssessmentFilter = ""
        appState.statusCheckboxFilter = []
        appState.kunMine = false            
        appState.kunUbehandlede = false
        appState.withComments = false,
        appState.withPotentialTaxonChanges = false,
        appState.withAutomaticNameChanges = false,
        appState.withNewComments = false    
    })
    resetOneFilter = action ((appState, name) => {
        if (name === 'kunUbehandlede') {
            appState.kunUbehandlede = false
        } else if (name === 'kunMine'){
            appState.kunMine = false
        } else if (name === 'withComments') {
            appState.withComments = false
        } else if (name === 'withNewComments') {
            appState.withNewComments = false
        } else if (name === 'withPotentialTaxonChanges') {
            appState.withPotentialTaxonChanges = false
        } else if (name === 'withAutomaticNameChanges') {
            appState.withAutomaticNameChanges = false
        } else if (name = 'expertgroupAssessmentFilter') {
            appState.expertgroupAssessmentFilter = ""
        }
        //[appState, name] = false
    })

    removeStatus = action ((appState, status) =>{
        var newStatusFilter = appState.statusCheckboxFilter.filter (item => item != status)
        appState.statusCheckboxFilter = newStatusFilter
        console.log(appState.statusCheckboxFilter)
    })
    removeCategory = action ((appState, category) => {
        var newCatFilter = appState.expertgroupCategoryCheckboxFilter.filter (item => item != category)
        appState.expertgroupCategoryCheckboxFilter = newCatFilter
    })
    render() {
        // const {appState, appState:{assessment}, appState:{assessmentTabs}} = this.props
        const {appState, appState:{assessment, koder}} = this.props
        // const {appState, appState:{assessment, koder}} = this.props
        const rolle = appState.roleincurrentgroup // todo: implement real    
        const labels = appState.codeLabels
        const statusCodes = [
            {
                "text": "Risikovurdert",
                "value": "vurdert"
              },
              {
    
                "text": "Ikke risikovurdert",
                "value": "ikkevurdert"
              }
        ]
        document.title = "Velg art - Fremmede arter"

        console.log(statusCodes)

     /*   let checkList = document.getElementById('list1');
        if (checkList) {checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
            if (checkList.classList.contains('visible'))
                checkList.classList.remove('visible');
            else
                checkList.classList.add('visible');
        }
    }

       if (checkList) { checkList.onblur = function(evt) {
            checkList.classList.remove('visible');
        }
    }

        let katList = document.getElementById('kategorier');
        if (katList) {katList.getElementsByClassName('anchor')[0].onclick = function (evt) {
            if (katList.classList.contains('visible'))
                katList.classList.remove('visible');
            else
                katList.classList.add('visible');
        }
    }

       if (katList) { katList.onblur = function(evt) {
                katList.classList.remove('visible');
        }*/
    

        // console.log("loaded" + appState.isServicesReady)

        return (
            <div>
                {window.location.href.indexOf("test.") > 1 && <table className="table table-striped">
                    <tr style={{backgroundColor: '#f9f9f9'}}>
                        <td style={{textAlign: 'center', color: 'red'}}><b>Dette er en testversjon. Driftversjonen finner du <a href="https://rl2021.artsdatabanken.no/">her</a>.</b></td>
                    </tr>
                </table>}                
                <h4>Velg artsgruppe</h4>
                <div style={{display: 'flex'}}>
                    <div style={{float: 'left', width: '90%'}}>
                        <div className="selectAssessment">                   
                            <Xcomp.StringEnum 
                                    forceSync
                                    observableValue={[appState, 'expertgroup']} 
                                    codes={appState.expertgroups}/>

                            
                        </div> 
                
                        <div className="taxon">
                            <li>
                                <span style={{marginRight: '10px', marginTop: '5px'}}>Taksonomisk søk</span> 
                                <Xcomp.String observableValue={[appState, 'expertgroupAssessmentFilter']}/>
                                <button className="btn" style={{height: '35px', marginRight: '5px'}} title="Vis hjelpetekst" aria-label="Vis hjelpetekst" onClick= {action(() => {this.show === false ? this.show = true : this.show = false})}><HelpIcon /></button>
                                {this.show && 
                                    <span style={{width: '60%', fontSize: 'small'}}>
                                        Søk i alle taksonomiske nivå, søket returnerer alle navn som inneholder innskrevet bokstavkombinasjon. "/abc" returnerer alle navn som starter med abc, og "!abc" returnerer alle slekter som starter på abc (søket fungerer som før).
                                    </span>
                                }                       
                            </li>                            
                        </div> 
                    </div> 
                    <div style={{float: 'right'}}>
                        <img src={catimg} style={{width: '150px'}}></img>
                    </div> 
                </div>
                <h5 style={{fontWeight: 'bold', fontSize: '1rem'}}>Filtrer på:</h5>
                <div className="selectFilter" style={{display: 'flex'}}>
                    <div>
                    <div className="filters"> 
                        {/*<span>Vurderinger med kommentar </span>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withNewComments"]} label={"Nye kommentarer (på dine) (" + appState.antallNye + ")"}/></div>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withComments"]} label={"Alle vurderinger med kommentar (" + appState.antallVurderinger + ")"}/></div>
                        <div className="comment" style={{marginLeft: '20px'}}>
                                <Xcomp.Bool observableValue={[appState, "kunUbehandlede"]} label={"Kun ubehandlede kommentarer (" + appState.antallUbehandlede + ")"} /></div>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withAutomaticNameChanges"]} label={"Automatisk oppdatert taksonomiendring (" + appState.antallNavnEndret + ")"}/></div>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withPotentialTaxonChanges"]} label={"Taksonomiendring trenger avklaring (" + appState.antallTaxonEndring + ")"}/></div> */}

                        <div className="comment" style={{marginLeft: '10px'}}>
                            <Xcomp.Bool observableValue={[appState, "fl2018"]} label={"Filtrer på status, kategori og kriterier fra Fremmedartslista 2018"} />
                        </div>
                        <div className="comment" style={{marginLeft: '10px'}}>
                            <Xcomp.Bool observableValue={[appState, "fl2023Status"]} label={"Filtrer på status, kategori og kriterier fra nåværende vurdering"} />
                        </div>
                        <div className="comment" style={{marginLeft: '10px'}}>
                            <Xcomp.Bool observableValue={[appState, "fl2023Comments"]} label={"Filtrer på påbegynt/ferdigstilt, kommentarer og vurderingsansvarlig i nåværende risikovurdering"} />
                        </div>
                    </div>
                    <div className="nav_menu">
                        <div className="filters"><b>Type vurdering</b>
                        <Xcomp.Radio
                        // TO DO: change the code and observable value
                            kode={"Risikovurdering"}
                            label={"Risikovurdering"}
                            observableValue={[appState, "assessmentType"]}/> 
                        <Xcomp.Radio
                        // TO DO: change the code
                            kode={"Horisontskanning"}
                            label={"Horisontskanning"}
                            observableValue={[appState, "assessmentType"]}/> 
                        </div>
                        <div className="filters"><b>Artens status</b>
                            <Xcomp.Bool observableValue={[appState, "vurdert"]} label={"Risikovurdert"} />
                                <div style={{marginLeft: '10px'}}>
                                    <Xcomp.Bool observableValue={[appState, "a"]} label={"Etablert etter 1800"} />
                                    <Xcomp.Bool observableValue={[appState, "b"]} label={"Dørstokkart"} />
                                    <Xcomp.Bool observableValue={[appState, "c"]} label={"Regionalt fremmed"} />
                                    <Xcomp.Bool observableValue={[appState, "d"]} label={"Effekt uten etablering"} />
                                </div>
                            <Xcomp.Bool observableValue={[appState, "ikkevurdert"]} label={"Ikke risikovurdert"} />
                            <div style={{marginLeft: '10px'}}>
                                    <Xcomp.Bool observableValue={[appState, "e"]} label={"Etablert før 1800"} />
                                    <Xcomp.Bool observableValue={[appState, "f"]} label={"Ingen etablering på 50 år"} />
                                    <Xcomp.Bool observableValue={[appState, "g"]} label={"Tradisjonell produksjonsart"} />
                                    <Xcomp.Bool observableValue={[appState, "h"]} label={"Deler moderartens status"} />
                                    <Xcomp.Bool observableValue={[appState, "i"]} label={"Arten finnes ikke i Norge"} />
                                    <Xcomp.Bool observableValue={[appState, "j"]} label={"Arten er ikke fremmed i Norge"} />
                                    <Xcomp.Bool observableValue={[appState, "k"]} label={"Dørstokkart som ikke skal vurderes"} />
                                    <Xcomp.Bool observableValue={[appState, "l"]} label={"Potensiell dørstokkart som ikke skal vurderes"} />
                                </div>
                        </div>
                        <div className="filters"><b>Risikokategori</b>
                                    <Xcomp.Bool observableValue={[appState, "SE"]} label={"Svært høy risiko (SE)"} />
                                    <Xcomp.Bool observableValue={[appState, "HI"]} label={"Høy risiko (HI)"} />
                                    <Xcomp.Bool observableValue={[appState, "PH"]} label={"Potensielt høy risiko (PH)"} />
                                    <Xcomp.Bool observableValue={[appState, "LO"]} label={"Lav risiko (LO)"} />
                                    <Xcomp.Bool observableValue={[appState, "NK"]} label={"Ingen kjent risiko (NK)"} />
                                    <Xcomp.Bool observableValue={[appState, "NR"]} label={"Ikke vurdert (NR)"} />
                        </div>
                        <div className="filters"><b>Utslagsgivende kriterium</b>
                                    <Xcomp.Bool observableValue={[appState, "kritA"]} label={"A"} />
                                    <Xcomp.Bool observableValue={[appState, "kritB"]} label={"B"} />
                                    <Xcomp.Bool observableValue={[appState, "kritC"]} label={"C"} />
                                    <Xcomp.Bool observableValue={[appState, "kritD"]} label={"D"} />
                                    <Xcomp.Bool observableValue={[appState, "kritE"]} label={"E"} />
                                    <Xcomp.Bool observableValue={[appState, "kritF"]} label={"F"} />
                                    <Xcomp.Bool observableValue={[appState, "kritG"]} label={"G"} />
                                    <Xcomp.Bool observableValue={[appState, "kritH"]} label={"H"} />                                    
                                    <Xcomp.Bool observableValue={[appState, "kritI"]} label={"I"} />
                        </div>
                    
                </div>
                        
                        <div className="comment" style={{marginLeft: '10px', display: 'flex'}}>
                            <Xcomp.Bool observableValue={[appState, "kunMine"]} label={"Vis mine vurderinger"} />
                            <input type="button" className="btn btn-primary" value="Last ned fil" onClick={() => window.open(config.apiUrl + '/api/ExpertGroupAssessments/export/' + appState.expertgroup)}></input>
                        </div> 
             </div>
                    {/* <div className="filters">
                        <span>Kategori</span>
                        <Xcomp.MultiselectArray
                                observableValue={[appState, 'expertgroupCategoryCheckboxFilter']} 
                                codes={koder.rødlisteKategori2010}
                                mode="check"/>
                    </div> */}
                    
                </div>
                
                            

                    {/* <div className="filters" style={{marginRight: 0}}>
                        <span>Vurderingsstatus</span>
                        <div style={{display: 'flex'}}>
                        <Xcomp.MultiselectArray
                                observableValue={[appState, 'statusCheckboxFilter']} 
                                codes={koder.workStatus}
                                mode="check"/>
                         {appState.expertgroupAssessmentListStatistic && appState.expertgroupAssessmentListStatistic.total ?                     
                                    <SelectAssessmentStatistics assessmentsStatistics={appState.expertgroupAssessmentListStatistic} assessment={assessment} rolle={rolle}/> :
                                    null}

                        </div>                       
                    </div> */}
                    
                    



                {/* <Xcomp.String observableValue={[appState, 'assessmentId']} /> */}
                {/* <input type="number" id="vurderingsid" min="1" max="60000"></input>
                <button onClick= {() => {
                    const id = document.getElementById("vurderingsid").value
                    console.log("ny id: " + id)
                    appState.setCurrentAssessment(id);
                  }}>Velg vurdering</button>
                <span>{appState.assessmentId}</span>
                <br /> */}
                {/* <button onClick= {() => {
                    console.log("Save assessment")
                    appState.saveCurrentAssessment();
                  }}>Lagre vurdering</button>
                <hr />
                <span>{appState.expertgroup }</span> */}
               
                  {/*<div className="stat">                        
                            {appState.expertgroupAssessmentListStatistic && appState.expertgroupAssessmentListStatistic.total ?                     
                                    <SelectAssessmentStatistics assessmentsStatistics={appState.expertgroupAssessmentListStatistic} assessment={assessment} rolle={rolle} categories={appState.expertgroupCategoryCheckboxFilter}/> :
                                    null}
                         
                    </div>      */} 
                    
                   {/* <div className="dropdown" style={{width: '50%'}}>
                        <button className="btn btn-secondary dropdown-toggle" type="button" style={{marginTop: '5px'}} id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Filtre
                        </button>
                        <div className="dropdown-menu filter" style={{width: '100%'}} aria-labelledby="dropdownMenuButton">
                            <div><li><span>Filtrer på kategori</span>
                            <Xcomp.MultiselectArray
                                observableValue={[appState, 'expertgroupCategoryCheckboxFilter']} 
                                codes={koder.rødlisteKategori2010}
                                mode="check"/></li></div>
                            <div><li style={{display: 'flex'}}><span>Søk på taksonomisk nivå</span> <Xcomp.String observableValue={[appState, 'expertgroupAssessmentFilter']}/></li></div>
                            <div><li><span>Filtrer på arbeidsstatus</span>
                            <Xcomp.MultiselectArray
                                observableValue={[appState, 'statusCheckboxFilter']} 
                                codes={koder.workStatus}
                                mode="check"/>
                                </li>
                            </div>
                            <div><li><span>Kun mine vurderinger</span><Xcomp.Bool observableValue={[appState, "kunMine"]} /></li></div>
                            <div><li><span>Kun vurderinger med ubehandlede kommentarer ({antallUbehandlede})</span>
                                <Xcomp.Bool observableValue={[appState, "kunUbehandlede"]} /></li></div>
                        </div>
                </div>        */}     
                        {/* <div style={{display:'flex'}}><span style={{marginTop: '5px', marginRight: 10}}>Filtrer på takson</span>
                            <Xcomp.String observableValue={[appState, 'expertgroupAssessmentFilter']}/>
                        </div> 
                        <br/>
                        {appState.expertgroupAssessmentListStatistic && appState.expertgroupAssessmentListStatistic.total ?                     
                            <SelectAssessmentStatistics assessmentsStatistics={appState.expertgroupAssessmentListStatistic} assessment={assessment} rolle={rolle}/> :
                            null}
                    </div>
    
               <div><span style={{marginLeft: '40px'}}>Filtrer på kategori</span>
                {/*<Xcomp.String observableValue={[appState, 'expertgroupCategoryFilter']}/></div>    */}
                   {/* <div className="form_item units">       
                   <div className="form_item units dropdown-check-list" id="kategorier" tabindex="0"> 
                             <span className="anchor">Filtrer på kategori</span>
                            
                            <Xcomp.MultiselectArray
                                observableValue={[appState, 'expertgroupCategoryCheckboxFilter']} 
                                codes={koder.rødlisteKategori2010}
                                mode="check"/>*/}
                       
                        {/* </div>          
                     } */}
                       {/* </div>*/}

                       
                               
                {/*<div><input type="button" className="btn btn-primary" value="Opprett ny vurdering" onClick={() => {alert("Oppretting av vurdering er ikke implementert, se issue."); window.open('https://github.com/Artsdatabanken/Rodliste2019/issues/32')}}></input></div>*/}
                

                {/*<div> <Xcomp.StringEnum 
                            observableValue={[this, 'taksonomiskNivå']} 
                            codes={this.taksonomiskeNivåer}/>
                </div> */}
               

               {/* <div style={{marginLeft: '10px'}}><Xcomp.Bool label="Velg kun arter med ubehandlede kommentarer" observableValue={[appState, "kunUbehandlede"]} /></div>
                <div><p>{"Antall vurderinger med kommentar: " + antallVurderinger }</p></div>
                <div style={{marginLeft: '10px'}}><Xcomp.Bool label="Vis kun mine vurderinger" observableValue={[appState, "kunMine"]} /></div>
                
            {/*<div><a target="_blank" href={config.apiUrl + '/api/ExpertGroupAssessments/export/' + appState.expertgroup} >Last ned CVS fil</a> </div><br />*/ }



            
            <div className="usedFilters"><span>Brukte filtre: </span> 
                            {appState.expertgroupCategoryCheckboxFilter && appState.expertgroupCategoryCheckboxFilter.length > 0 &&                             
                            appState.expertgroupCategoryCheckboxFilter.map ((category) => {
                                return (<button key={category} onClick={() => this.removeCategory(appState, category)}><span>{category}</span><a href="#">x</a></button>) 
                            })} 
                            {appState.expertgroupAssessmentFilter != "" && <button onClick={() => this.resetOneFilter(appState, 'expertgroupAssessmentFilter')}><span>{appState.expertgroupAssessmentFilter}</span><a href="#">x</a></button> } 
                            {appState.statusCheckboxFilter && appState.statusCheckboxFilter.length > 0 && 
                                appState.statusCheckboxFilter.map ((status) => {
                                    return (<button key={status} onClick={() => this.removeStatus(appState, status)}>
                                        {status === "notStarted" && <span>Ikke påbegynt</span>}   
                                        {status === "inprogress" && <span>Påbegynt</span>}
                                        {status === "finished" && <span>Ferdigstilt</span>}
                                        <a href="#">x</a></button>)
                            })}
                            {appState.withNewComments && <button onClick={() => this.resetOneFilter(appState, 'withNewComments')}>Nye kommentarer<a href="#">x</a></button>}                     
                            {appState.withComments && <button onClick={() => this.resetOneFilter(appState, 'withComments')}>Alle kommentarer<a href="#">x</a></button>}
                            {appState.kunMine && <button onClick={() => this.resetOneFilter(appState, 'kunMine')}>Mine vurderinger<a href="#">x</a></button>}
                            {appState.kunUbehandlede && <button onClick={() => this.resetOneFilter(appState, 'kunUbehandlede')}>Ubehandlede kommentarer<a href="#">x</a></button>}
                            {appState.withPotentialTaxonChanges && <button onClick={() => this.resetOneFilter(appState, 'withPotentialTaxonChanges')}>Taksonomiendring trenger avklaring<a href="#">x</a></button>}
                            {appState.withAutomaticNameChanges && <button onClick={() => this.resetOneFilter(appState, 'withAutomaticNameChanges')}>Automatisk oppdatert taksonomiendring<a href="#">x</a></button>}
                            
                <button
                        style={{marginLeft: '20px'}} 
                        type="button"  
                        disabled={appState.expertgroupCategoryCheckboxFilter.length === 0 && appState.expertgroupAssessmentFilter === "" && appState.statusCheckboxFilter.length === 0 && !appState.kunMine &&!appState.withComments &&  !appState.kunUbehandlede && !appState.withAutomaticNameChanges && !appState.withPotentialTaxonChanges} 
                        onClick={() => this.resetFilters(appState)}>Nullstill alle filtre</button>
            </div>
            
                <SelectAssessmentTable assessmentList={appState.expertgroupAssessmentFilteredList} rolle={rolle}/>
                 
            </div>
        )
    }
}