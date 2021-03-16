import {autorun, action} from 'mobx';
import {loadDataFromUrl} from '../apiService'; 
// import config from '../config';

 export default function createTaxonSearch(newObj, contextLetter, filter) {
            const doSearch = async (searchString) => {
                // const baseUrl = '//it-webadbtest01.it.ntnu.no/ArtskartPublicApi/api/taxon/?term='
                //const baseUrl = ((window.location.href.indexOf('lokalapi') > -1) ? 'http://localhost:7588/'+ 'taxon/?term=' : 'https://invasivespeciesservice.artdata.slu.se/taxon/') 
                //const baseUrl = 'https://invasivespeciesservice.artdata.slu.se/taxon/'



                var config = {taxonApiUrl: "https://artskart.artsdatabanken.no/publicapi/api/taxon?term="} // "https://artsdatabanken.no/api/taxon/ScientificName?scientificName="}

                const url = config.taxonApiUrl + searchString
                // console.log("url:" + url)
                if(searchString && searchString.length >= 2) {
                    action(() => newObj.taxonSearchWaitingForResult = true)()




                const response = await fetch(url
                    , {
                        method: 'GET',
                        // mode: 'no-cors',
                        headers: new Headers( {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'//,
                            // 'mode': 'no-cors'
                        })
                    }
                ).then((response) => {
                   if (response.status >= 400 && response.status < 600) {
                        throw new Error("Bad response from server");
                    }
                    return response;

                }).then((response) => {
                     return response.json();
                 }).then((response) => {
                    const t = JSON.stringify(response)
                    console.log("$$:" + t)
                    return response;
                }).then(data => {
                     const t = JSON.stringify(data)
                     console.log("$:" + t)

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
                        action(() => newObj.taxonSearchWaitingForResult = false)()
                        console.log("taxlist length: " + newList.length)
                        action(() => newObj.taxonSearchResult.replace(newList))()
                    }
                    return null;
                }).catch((error) => {
                    // Your error is here!
                    console.log(error)
                });





                    // loadDataFromUrl(url, data => {
                    //     // const t = JSON.stringify(data)

                    //     const res = data.
                    //         filter(item => item.Species).  // item.ExistsInCountry && 
                    //         map(item => {
                    //             const taxonRank = item.SubSpecies ? "SubSpecies" : "Species"  
                    //             const rlCat = item.TaxonTags.find(tt => tt.Prefix === "RL2015" && tt.Context === contextLetter )
                    //             const rlCategory = rlCat ? rlCat.Tag : null
                    //             // console.log("tax: " + item.ValidScientificName)
                    //             return {
                    //                 taxonId: item.TaxonId,
                    //                 taxonRank: taxonRank,
                    //                 scientificName: item.ValidScientificName,
                    //                 scientificNameId: item.ValidScientificNameId,
                    //                 author: item.ValidScientificNameAuthorship,
                    //                 popularName: item.PrefferedPopularname,
                    //                 rlCategory: rlCategory,
                    //                 existsInCountry: item.ExistsInCountry
                    //             }
                    //         }).
                    //         filter(item => typeof filter === 'function' ? filter(item) : true )
                    //         // map(item => {
                    //         //     console.log("tax2: " + item.scientificName)
                    //         //     return item
                    //         // })
                    //     if(newObj.taxonSearchString === searchString) {
                    //         //because taxonSearchString may have changed before result is returned
                    //         const newList = newObj.taxonSearchString.length >= 2 ? res : []
                    //         action(() => newObj.taxonSearchWaitingForResult = false)()
                    //         console.log("taxlist length: " + newList.length)
                    //         action(() => newObj.taxonSearchResult.replace(newList))()
                    //     }
                    //     return null;
                    // })
                } else {
                    action(() => newObj.taxonSearchWaitingForResult = false)()
                    action(() => newObj.taxonSearchResult.replace([]))()
                }
            }
            autorun(() => {doSearch(newObj.taxonSearchString)}, { delay: 300} )
            return null
        }
