import React, {Component} from 'react'
import { action, observable, runInAction, makeObservable } from 'mobx';
import { observer, inject } from 'mobx-react';
import * as Xcomp from './observableComponents';
import HelpIcon from '@material-ui/icons/Help';
import ExpertGroupModel from './expertGroupModel'
import SelectAssessmentTable from './selectAssessmentTable';
import { createConfigItem } from '@babel/core';
import auth from './authService';
import config from '../config';

class SelectAssessment extends Component {
   
    constructor(props) {
        super()

        makeObservable(this, {
            show: observable
        });
    }
    show = false;

    resetFilters = action((appState) => {
        appState.expertgroupCategoryCheckboxFilter = []
        appState.expertgroupAssessmentFilter = ""
        appState.statusCheckboxFilter = []
        appState.kunMine = false            
        appState.kunUbehandlede = false
        appState.hSStatus = false
        appState.withComments = false,
        appState.withPotentialTaxonChanges = false
        appState.withAutomaticNameChanges = false
        appState.withNewComments = false    
        appState.responsible = []
        appState.workStatus = []
        appState.otherComments = []
       
        if (appState.horizonScanFilter != undefined) {
            appState.horizonScanFilter.hsNotStarted = false
            appState.horizonScanFilter.hsFinished = false
            appState.horizonScanFilter.notAssessed = false
            appState.horizonScanFilter.toAssessment = false
            appState.horizonScanFilter.notAssessedDoorKnocker = []
            appState.horizonScanFilter.potentialDoorKnockers = []
        }

        if (appState.historyFilter != undefined) {
            appState.historyFilter.decisiveCriteriaFilter = []
            appState.historyFilter.riskCategoryFilter = []
            appState.historyFilter.riskNotAssessedFilter = []
            appState.historyFilter.riskAssessedFilter = []
            appState.historyFilter.vurdert = false
            appState.historyFilter.ikkevurdert = false
        }

        if (appState.currentFilter != undefined) {
            appState.currentFilter.decisiveCriteriaFilter = []
            appState.currentFilter.riskCategoryFilter = []
            appState.currentFilter.riskNotAssessedFilter = []
            appState.currentFilter.riskAssessedFilter = []
            appState.currentFilter.vurdert = false
            appState.currentFilter.ikkevurdert = false 
        }

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
        } else if (name === 'expertgroupAssessmentFilter') {
            appState.expertgroupAssessmentFilter = ""
        } else if (name === 'hSStatus') {
            appState.hSStatus = false
        } else if (name === 'hsNotStarted' ) {
            appState.horizonScanFilter.hsNotStarted = false
        } else if (name === 'hsFinished') {
            appState.horizonScanFilter.hsFinished = false
        } else if ( name ==='notAssessed') {
            appState.horizonScanFilter.notAssessed = false
        } else if (name === 'toAssessment') {
            appState.horizonScanFilter.toAssessment = false
        }
        else {
            console.log(appState.name)
           // appState.name = false
        }
        //[appState, name] = false
    })

    changeFilters = action((appState) => {
        if (appState) {

            appState.filterType = []
            appState.horizonScanFilter.horizonFilters = false
            this.resetFilters(appState)
        }
    })

    resetArrayFilter = action ((array, name) => {
            array.remove(name)
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

    findFilterText = (codes, value) => {
        var result = ""

        result = codes.find(code => code.value == value).text

        return result
    }

    render() {
        const {appState, appState:{assessment,roleincurrentgroup:rolle,codeLabels:labels,koder}} = this.props
        // const {appState, appState:{assessment,roleincurrentgroup:rolle,codeLabels:labels,koder:{Children:koder}}} = this.props
        // const koder = appState.koder.Children

        // find leaders in each expert group
        var experts = ExpertGroupModel.eksperterforvalgtgruppe.filter(item => item.writeAccess == true)
        
        if (appState.expertgroup == "" || appState.expertgroup == undefined) {
            runInAction(() =>
                appState.expertgroup = "Karplanter"
            )
        }
        
        const filterIsEmpty = appState.expertgroupAssessmentFilter == "" 
                            && !appState.kunUbehandlede 
                            && !appState.hSStatus
                            && !appState.horizonScanFilter.hsNotStarted 
                            && !appState.horizonScanFilter.hsFinished 
                            && !appState.horizonScanFilter.toAssessment 
                            && !appState.horizonScanFilter.notAssessed 
                            && appState.responsible.length === 0 
                            && (appState.currentFilter.decisiveCriteriaFilter && appState.currentFilter.decisiveCriteriaFilter.length === 0) 
                            && !appState.currentFilter.vurdert && !appState.currentFilter.ikkevurdert
                            && !appState.historyFilter.vurdert && !appState.historyFilter.ikkevurdert
                            && (appState.workStatus && appState.workStatus.length === 0) 
                            && (appState.currentFilter.riskCategoryFilter && appState.currentFilter.riskCategoryFilter.length ===0)
                            && (appState.historyFilter.decisiveCriteriaFilter && appState.historyFilter.decisiveCriteriaFilter.length === 0) 
                            && (appState.historyFilter.riskCategoryFilter && appState.historyFilter.riskCategoryFilter.length === 0)
                            && (appState.historyFilter.riskAssessedFilter && appState.historyFilter.riskAssessedFilter.length === 0) 
                            && (appState.historyFilter.riskNotAssessedFilter && appState.historyFilter.riskNotAssessedFilter.length === 0)
                            && (appState.currentFilter.riskAssessedFilter && appState.currentFilter.riskAssessedFilter.length === 0) 
                            && (appState.currentFilter.riskNotAssessedFilter && appState.currentFilter.riskNotAssessedFilter.length === 0)
                            && (appState.otherComments && appState.otherComments.length === 0)
                            && (appState.horizonScanFilter.potentialDoorKnockers && appState.horizonScanFilter.potentialDoorKnockers.length === 0)
                            && (appState.horizonScanFilter.notAssessedDoorKnocker && appState.horizonScanFilter.notAssessedDoorKnocker.length === 0)

                            && appState.expertgroupCategoryCheckboxFilter.length === 0 && appState.statusCheckboxFilter.length === 0 
                            && !appState.kunMine && !appState.withComments && !appState.withAutomaticNameChanges && !appState.withPotentialTaxonChanges
        
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

        const isInternal = auth.user.profile.email.indexOf("artsdatabanken.no") > -1

        //console.log(isInternal)

        return (
            <div>
                {!config.isNotTest && config.isRelease && <table className="table warning table-striped">
                    <tr>
                        <td><b>{labels.SelectAssessment.testVersion}</b></td> {/* link to drift:<a href="https://fab4.artsdatabanken.no/">{labels.SelectAssessment.here}</a>. */}
                    </tr>    
                </table>}              

                 <Xcomp.StringEnum 
                                    //forceSync
                                    className="assessmentType"
                                    disabled={config.isNotTest && !isInternal}                                                                        
                                    observableValue={[appState, 'assessmentTypeFilter']} 
                                    heading={labels.SelectAssessment.whatDoYouWantToDo}
                                    codes={koder.assessmentType}
                                    onChange={() => this.changeFilters(appState)}
                                    mode="radio"/>
                <fieldset className="well">
                    <h4>{labels.SelectAssessment.chooseSpeciesGroup}</h4>
                    <div className="selectAssessment">                   
                                <Xcomp.StringEnum 
                                        forceSync
                                        observableValue={[appState, 'expertgroup']}                                         
                                        codes={appState.expertgroups}/>                                                                         
                    </div>
                </fieldset>
                
                <div className="chooseSpecies">
                    <div>
                        <fieldset className="well">
                            <div className="taxon">
                                <li>
                                    <span style={{marginRight: '10px', marginTop: '5px', width: '300px'}}>{labels.SelectAssessment.taxonSearch}</span> 
                                    <Xcomp.String observableValue={[appState, 'expertgroupAssessmentFilter']}/>
                                    {/*<button className="btn" style={{height: '35px', marginRight: '5px'}} title="Vis hjelpetekst" aria-label="Vis hjelpetekst" onClick= {action(() => {this.show == false ? this.show = true : this.show = false})}><HelpIcon /></button>
                                
                                    {this.show == true && 
                                        <span style={{width: '60%', fontSize: 'small'}}>
                                            Søk i alle taksonomiske nivå, søket returnerer alle navn som inneholder innskrevet bokstavkombinasjon. "/abc" returnerer alle navn som starter med abc, og "!abc" returnerer alle slekter som starter på abc (søket fungerer som før).
                                        </span>
                                    }    */}                   
                                </li>                            
                            </div> 
                        </fieldset>
                        
                    </div> 
                   {/* <div style={{float: 'right'}}>
                        <img src={catimg} style={{width: '150px'}}></img>
                            </div> */}
                </div>
                {/*<h5 style={{fontWeight: 'bold', fontSize: '1rem'}}>Filtrer på:</h5>*/}
                
                {appState.assessmentTypeFilter == "riskAssessment" &&
                <div className="selectFilter">
                    <div>  
                    <div className="filters"> 
                    <Xcomp.Bool observableValue={[appState, "hSStatus"]} style={{marginBottom: "-5px"}} label={labels.SelectAssessment.hsFilter}/>
                        {/*<span>Vurderinger med kommentar </span>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withNewComments"]} label={"Nye kommentarer (på dine) (" + appState.antallNye + ")"}/></div>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withComments"]} label={"Alle vurderinger med kommentar (" + appState.antallVurderinger + ")"}/></div>
                        <div className="comment" style={{marginLeft: '20px'}}>
                                <Xcomp.Bool observableValue={[appState, "kunUbehandlede"]} label={"Kun ubehandlede kommentarer (" + appState.antallUbehandlede + ")"} /></div>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withAutomaticNameChanges"]} label={"Automatisk oppdatert taksonomiendring (" + appState.antallNavnEndret + ")"}/></div>
                        <div className="comment"><Xcomp.Bool observableValue={[appState, "withPotentialTaxonChanges"]} label={"Taksonomiendring trenger avklaring (" + appState.antallTaxonEndring + ")"}/></div> */}
                        <Xcomp.MultiselectArray
                                observableValue={[appState, 'filterType']} 
                                codes={koder.filterTypes}
                                mode="check"/>                        
                    

                    {appState.filterType.indexOf('FL2018') > -1 && <div className="nav_menu">                        
                        <div className="filters"><b>{labels.SelectAssessment.speciesStatus}</b>
                            <Xcomp.Bool observableValue={[appState.historyFilter, "vurdert"]}  className={"riskStatus"} label={koder.statusCodes[0].text} />
                            <Xcomp.MultiselectArray
                                observableValue={[appState.historyFilter, 'riskAssessedFilter']} 
                                className="status"
                                codes={koder.assessedTypes2018}
                                mode="check"/>
                            <Xcomp.Bool observableValue={[appState.historyFilter, "ikkevurdert"]}  className={"riskStatus"} label={koder.statusCodes[1].text} />
                            <Xcomp.MultiselectArray
                                observableValue={[appState.historyFilter, 'riskNotAssessedFilter']} 
                                className="status"
                                codes={koder.notAssessedTypes2018}
                                mode="check"/>
                        </div>
                        <div className="filters"><b>{labels.SelectAssessment.riskLevelCategory}</b>
                        <Xcomp.MultiselectArray
                                observableValue={[appState.historyFilter, 'riskCategoryFilter']} 
                                codes={koder.riskCategory}                                
                                mode="check"/>
                        </div>
                        <div className="filters"><b>{labels.SelectAssessment.criteria}</b>
                        <Xcomp.MultiselectArray
                                observableValue={[appState.historyFilter, 'decisiveCriteriaFilter']} 
                                codes={koder.decisiveCriteria}
                                mode="check"/>
                        </div>
                    
                </div> }
                   {appState.filterType.indexOf('FL2023') > -1 &&  <div className="nav_menu">                        
                        <div className="filters speciesStatus"><b>{labels.SelectAssessment.speciesStatus}</b>
                            <Xcomp.Bool observableValue={[appState.currentFilter, "vurdert"]} className={"riskStatus"} label={koder.statusCodes[0].text} />
                            <Xcomp.MultiselectArray
                                observableValue={[appState.currentFilter, 'riskAssessedFilter']} 
                                className="status"
                                codes={koder.assessedTypes}
                                mode="check"/>
                            <Xcomp.Bool observableValue={[appState.currentFilter, "ikkevurdert"]} className={"riskStatus"} label={koder.statusCodes[1].text} />
                            <Xcomp.MultiselectArray
                                observableValue={[appState.currentFilter, 'riskNotAssessedFilter']} 
                                className="status"
                                codes={koder.notAssessedTypes}
                                mode="check"/>
                        </div>
                        <div className="filters"><b>{labels.SelectAssessment.riskLevelCategory}</b>
                        <Xcomp.MultiselectArray
                                observableValue={[appState.currentFilter, 'riskCategoryFilter']} 
                                codes={koder.riskCategory}
                                mode="check"/>
                        </div>
                        <div className="filters"><b>{labels.SelectAssessment.criteria}</b>
                        <Xcomp.MultiselectArray
                                observableValue={[appState.currentFilter, 'decisiveCriteriaFilter']} 
                                codes={koder.decisiveCriteria}
                                mode="check"/>
                        </div>
                    
                </div> }

                {appState.filterType.indexOf('statusAndCommentFL2023') > -1 &&  <div className="nav_menu">
                        <div className="filters"><b>{labels.SelectAssessment.assessmentStatus}</b>                            
                            <Xcomp.MultiselectArray
                                observableValue={[appState, 'workStatus']} 
                                codes={appState.assessmentTypeFilter == "riskAssessment" ? koder.workStatus: koder.workStatusHS}
                                facetFunction={appState.getStatisticsFor}
                                facets={appState.assessmentsStatistics}
                                facet="Progress"
                                totalCount={appState.expertgroupAssessmentTotalCount}
                                mode="check"/>                            
                        </div>

                        <div className="filters"><b>{labels.SelectAssessment.ADBComments}</b>
                        <Xcomp.MultiselectArray
                                observableValue={[appState, 'otherComments']} 
                                codes={koder.comments}
                                mode="check"/>
                        </div>
                        <div className="filters"><b>{labels.SelectAssessment.assessmentLeader}</b>
                        <Xcomp.MultiselectArray
                                observableValue={[appState, 'responsible']} 
                                codes={appState.expertgroupAssessmentAuthors}
                                mode="check"/>
                        </div>
                    
                </div> }
                        
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
                }

                {appState.assessmentTypeFilter == "horizonScanning" && 
                <>
                <div className="selectFilter">
                    <div className="filters">
                        <Xcomp.Bool observableValue={[appState.horizonScanFilter, "horizonFilters"]} label={labels.SelectAssessment.hsFilters} />
                    
                {appState.horizonScanFilter.horizonFilters == true &&
                
                <div className="nav_menu">
                        <div className="filters"><b>{labels.SelectAssessment.assessmentStatus}</b>   
                                <Xcomp.Bool observableValue={[appState.horizonScanFilter, "hsNotStarted"]} label={koder.workStatusHS[0].text + "   (" + appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','2') + ") " + (100*appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','2')/appState.expertgroupAssessmentTotalCount).toFixed() + "%"} />
                                <Xcomp.Bool observableValue={[appState.horizonScanFilter, "hsFinished"]} label={koder.workStatus[2].text + " (" + appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1,0') + ")   " + (100*appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1,0')/appState.expertgroupAssessmentTotalCount).toFixed() + "%"} />
                            <div className="subChoice">
                                    <Xcomp.Bool observableValue={[appState.horizonScanFilter, "toAssessment"]} label={" (" + appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1') + ") " + (appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1,0').toFixed() > 0 ? (100*appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1')/appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1,0')).toFixed() : "0") + labels.SelectAssessment.further} />
                                    <Xcomp.Bool observableValue={[appState.horizonScanFilter, "notAssessed"]} label={" (" + appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','0') + ") " + (appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1,0').toFixed() > 0 ? (100*appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','0')/appState.getStatisticsFor(appState.assessmentsStatistics,'Progress','1,0')).toFixed() : "0") + labels.SelectAssessment.notAssessed} />
                            </div>

                        </div>
                        <div className="filters"><b>{labels.SelectAssessment.PotentialDoorKnockers}</b>
                        
                        <Xcomp.MultiselectArray
                                observableValue={[appState.horizonScanFilter, 'potentialDoorKnockers']} 
                                codes={koder.potentialDoorKnockers}
                                facetFunction={appState.getStatisticsFor}
                                facets={appState.assessmentsStatistics}
                                facet="PotentialDoorKnocker"
                                mode="check"/>
                        <div className="subChoice">
                        <Xcomp.MultiselectArray
                                observableValue={[appState.horizonScanFilter, 'notAssessedDoorKnocker']} 
                                codes={koder.notAssessedDoorKnocker}
                                facetFunction={appState.getStatisticsFor}
                                facets={appState.assessmentsStatistics}
                                facet="NotAssessedDoorKnocker"
                                mode="check"/>
                        </div>
                        
                        </div>
                        <div className="filters"><b>{labels.SelectAssessment.assessmentLeader}</b>
                        <Xcomp.MultiselectArray
                                observableValue={[appState, 'responsible']} 
                                codes={appState.expertgroupAssessmentAuthors}
                                mode="check"/>
                        </div>                      
                    </div>}                           
                   
                    </div>
                    
                </div>
                <div className="selectFilter">
                    <div className="filters"><Xcomp.Bool observableValue={[appState, "kunUbehandlede"]} label={labels.SelectAssessment.commentFilter}/></div>                        
                </div>
                </>}
                
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


                        
            
            <div className="usedFilters">
            <div className="counter">
            {filterIsEmpty ?
                // TO DO: check that all the filters are observed
                <span>{labels.SelectAssessment.showingTotal} {appState.expertgroupAssessmentTotalCount} {appState.expertgroupAssessmentTotalCount == 1 ? labels.SelectAssessment.assessment : labels.SelectAssessment.assessments}</span>
                :            
                <span> {labels.SelectAssessment.showingTotal} {appState.expertgroupAssessmentFilterCount} {appState.expertgroupAssessmentList.length == 1 ? labels.SelectAssessment.assessment : labels.SelectAssessment.assessments} ({labels.SelectAssessment.filteredFrom} {appState.expertgroupAssessmentTotalCount})</span>
            }
            <input type="button" className="btn btn-primary" value="Last ned fil" onClick={() => window.open(config.apiUrl + '/api/ExpertGroupAssessments/export/' + appState.assessmentTypeFilter + '/' + appState.expertgroup)}></input>
            </div>
            
            <div>
                <span>{labels.SelectAssessment.usedFilters}</span> 
                            {appState.expertgroupCategoryCheckboxFilter && appState.expertgroupCategoryCheckboxFilter.length > 0 &&                             
                            appState.expertgroupCategoryCheckboxFilter.map ((category) => {
                                return (<button key={category} onClick={() => this.removeCategory(appState, category)}><span>{category}</span><a href="#">x</a></button>) 
                            })} 
                            {appState.expertgroupAssessmentFilter != "" && <button onClick={() => this.resetOneFilter(appState, 'expertgroupAssessmentFilter')}><span>{appState.expertgroupAssessmentFilter}</span><a href="#">x</a></button> } 
                            {appState.statusCheckboxFilter && appState.statusCheckboxFilter.length > 0 && 
                                appState.statusCheckboxFilter.map ((status) => {
                                    return (<button key={status} onClick={() => this.removeStatus(appState, status)}>
                                        {status === "notStarted" && <span>{labels.SelectAssessment.notStarted}</span>}   
                                        {status === "inprogress" && <span>{labels.SelectAssessment.started}</span>}
                                        {status === "finished" && <span>{labels.SelectAssessment.completed}</span>}
                                        <a href="#">x</a></button>)
                            })}
                            {appState.horizonScanFilter.hsNotStarted && <button onClick={() => this.resetOneFilter(appState, 'hsNotStarted')}>{koder.workStatus[0].text}<a href="#">x</a></button>}  
                            {appState.horizonScanFilter.hsFinished && <button onClick={() => this.resetOneFilter(appState, 'hsFinished')}>{koder.workStatus[2].text}<a href="#">x</a></button>}  
                            {appState.horizonScanFilter.toAssessment && <button onClick={() => this.resetOneFilter(appState, 'toAssessment')}>{"Videre til risikovurdering"}<a href="#">x</a></button>}  
                            {appState.horizonScanFilter.notAssessed && <button onClick={() => this.resetOneFilter(appState, 'notAssessed')}>{"Ikke videre"}<a href="#">x</a></button>}  
                            
                            {appState.responsible && appState.responsible.length > 0 && appState.responsible.map (r => <button onClick={() => this.resetArrayFilter(appState.responsible, r)}>{r}<a href="#">x</a></button>)}
                            {appState.workStatus && appState.workStatus.length > 0 && appState.workStatus.map (r => <button onClick={() => this.resetArrayFilter(appState.workStatus, r)}>{this.findFilterText(koder.workStatus, r)}<a href="#">x</a></button>)}
                            {appState.horizonScanFilter.potentialDoorKnockers && appState.horizonScanFilter.potentialDoorKnockers.length > 0 && appState.horizonScanFilter.potentialDoorKnockers.map (pdk => <button onClick={() => this.resetArrayFilter(appState.horizonScanFilter.potentialDoorKnockers, pdk)}>{this.findFilterText(koder.potentialDoorKnockers, pdk)}<a href="#">x</a></button>)}
                            {appState.horizonScanFilter.notAssessedDoorKnocker && appState.horizonScanFilter.notAssessedDoorKnocker.length > 0 && appState.horizonScanFilter.notAssessedDoorKnocker.map (nadk => <button onClick={() => this.resetArrayFilter(appState.horizonScanFilter.notAssessedDoorKnocker, nadk)}>{this.findFilterText(koder.notAssessedDoorKnocker, nadk)}<a href="#">x</a></button>)}
                            
                            {appState.withNewComments && <button onClick={() => this.resetOneFilter(appState, 'withNewComments')}>{labels.SelectAssessment.newComments}<a href="#">x</a></button>}                     
                            {appState.withComments && <button onClick={() => this.resetOneFilter(appState, 'withComments')}>{labels.SelectAssessment.allComments}<a href="#">x</a></button>}
                            {appState.kunMine && <button onClick={() => this.resetOneFilter(appState, 'kunMine')}>{labels.SelectAssessment.myAssessments}<a href="#">x</a></button>}
                            {appState.kunUbehandlede && <button onClick={() => this.resetOneFilter(appState, 'kunUbehandlede')}>{labels.SelectAssessment.commentsToRead}<a href="#">x</a></button>}
                            {appState.hSStatus && <button onClick={() => this.resetOneFilter(appState, 'hSStatus')}>{"HS-arter"}<a href="#">x</a></button>}
                            {appState.withPotentialTaxonChanges && <button onClick={() => this.resetOneFilter(appState, 'withPotentialTaxonChanges')}>{labels.SelectAssessment.potentialTaxonChange}<a href="#">x</a></button>}
                            {appState.withAutomaticNameChanges && <button onClick={() => this.resetOneFilter(appState, 'withAutomaticNameChanges')}>{labels.SelectAssessment.automaticNameChange}<a href="#">x</a></button>}
                            
                <button                        
                        type="button"  
                        disabled={filterIsEmpty} 
                        onClick={() => this.resetFilters(appState)}>{labels.SelectAssessment.resetAll}</button>
                </div>
            </div>
            
                <SelectAssessmentTable assessmentList={appState.expertgroupAssessmentList} rolle={rolle}/>
                 
            </div>
        )
    }
}

export default inject('appState')(observer(SelectAssessment));