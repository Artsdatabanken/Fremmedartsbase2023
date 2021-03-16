import {autorunAsync} from 'mobx';
// import {loadData} from '../../stores/apiService'; 
import config from '../../../config';



function loadData() { alert("loaddata Not implemented")}



 export default function createTaxonSearch(newObj, contextLetter, filter) {
            const doSearch = (searchString) => {
                // const baseUrl = '//it-webadbtest01.it.ntnu.no/ArtskartPublicApi/api/taxon/?term='
                //const baseUrl = ((window.location.href.indexOf('lokalapi') > -1) ? 'http://localhost:7588/'+ 'taxon/?term=' : 'https://invasivespeciesservice.artdata.slu.se/taxon/') 
                //const baseUrl = 'https://invasivespeciesservice.artdata.slu.se/taxon/'

                const url = config.taxonApiUrl + searchString
                // console.log("url:" + url)
                if(searchString && searchString.length >= 2) {
                    newObj.taxonSearchWaitingForResult = true
                    loadData(url, data => {
                        // const t = JSON.stringify(data)

                        const res = data.
                            filter(item => item.Species).  // item.ExistsInCountry && 
                            map(item => {
                                const taxonRank = item.SubSpecies ? "SubSpecies" : "Species"  
                                const rlCat = item.TaxonTags.find(tt => tt.Prefix === "RL2015" && tt.Context === contextLetter )
                                const rlCategory = rlCat ? rlCat.Tag : null
                                // console.log("tax: " + item.ValidScientificName)
                                return {
                                    taxonId: item.TaxonId,
                                    taxonRank: taxonRank,
                                    scientificName: item.ValidScientificName,
                                    scientificNameId: item.ValidScientificNameId,
                                    author: item.ValidScientificNameAuthorship,
                                    popularName: item.PrefferedPopularname,
                                    rlCategory: rlCategory,
                                    existsInCountry: item.ExistsInCountry
                                }
                            }).
                            filter(item => typeof filter === 'function' ? filter(item) : true )
                            // map(item => {
                            //     console.log("tax2: " + item.scientificName)
                            //     return item
                            // })
                        if(newObj.taxonSearchString === searchString) {
                            //because taxonSearchString may have changed before result is returned
                            const newList = newObj.taxonSearchString.length >= 2 ? res : []
                            newObj.taxonSearchWaitingForResult = false
                            console.log("taxlist length: " + newList.length)
                            newObj.taxonSearchResult.replace(newList)
                        }
                        return null;
                    })
                } else {
                    newObj.taxonSearchWaitingForResult = false
                    newObj.taxonSearchResult.replace([]) 
                }
            }
            autorunAsync(() => {doSearch(newObj.taxonSearchString)}, 300 )
            return null
        }
