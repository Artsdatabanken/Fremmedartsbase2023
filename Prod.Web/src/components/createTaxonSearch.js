import {autorun, action, observable, isObservableObject} from 'mobx';
import {loadDataFromUrl} from '../apiService'; 
// import config from '../config';

export function createTaxonSearchState(id) {
    const taxonSearchState = observable({
        id: "newNaturtypeTaxonSearch",
        scientificName: "",
        scientificNameId: "",
        scientificNameAuthor: "",
        vernacularName: "",
        taxonRank: "",
        taxonId: "",
        taxonSearchString: "",
        taxonSearchResult: [],
        domesticOrAbroad : "",
        redListCategory: "", 
        basisOfAssessment: []
    })
    return taxonSearchState
}
export function resetTaxonSearchState(taxobj) {
    action(() => {
        // reset newItem
        taxobj.scientificName = ""
        taxobj.scientificNameId = ""
        taxobj.scientificNameAuthor = ""
        taxobj.vernacularName = ""
        taxobj.taxonRank = ""
        taxobj.taxonId = ""
        taxobj.taxonSearchString = ""
        taxobj.taxonSearchResult.replace([])
        taxobj.domesticOrAbroad = ""
        taxobj.redListCategory = "" 
        taxobj.basisOfAssessment.replace([])
        taxobj.taxonSearchWaitingForResult = false
    })()
}
export function selectTaxonSearchState(taxobj, selecteditem) {
    action(() => {
        taxobj.taxonId = selecteditem.taxonId
        taxobj.taxonRank = selecteditem.taxonRank
        taxobj.scientificName = selecteditem.scientificName
        taxobj.scientificNameId = selecteditem.scientificNameId
        taxobj.scientificNameAuthor = selecteditem.author
        taxobj.vernacularName = selecteditem.popularName

        taxobj.redListCategory = selecteditem.rlCategory
        taxobj.taxonSearchResult.replace([])
        taxobj.taxonSearchString = ""
    })()
} 

export default function createTaxonSearch(newObj, contextLetter, filter) {
    if(!newObj) {
        throw "createTaxonSearch - no newObject"
    }
    if(!isObservableObject(newObj)) {
        throw "createTaxonSearch - newObject is not observable"
    }

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
        }).then(data => {
                const t = JSON.stringify(data)
            //  console.log("¤$¤:" + t)
            const res = data.
                filter(item => item.Species).  // item.ExistsInCountry && 
                map(item => {
                    const taxonRank = item.SubSpecies ? "SubSpecies" : "Species"  
                    const rlCat = item.TaxonTags.find(tt => tt.Prefix === "RL2021" && tt.Context === contextLetter )
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
            if(newObj.taxonSearchString === searchString) {
                //because taxonSearchString may have changed before result is returned
                const newList = newObj.taxonSearchString.length >= 2 ? res : []
                action(() => newObj.taxonSearchWaitingForResult = false)()
                console.log("taxlist id: " + newObj.id + " length: " + newList.length)
                action(() => newObj.taxonSearchResult.replace(newList))()
            }
            return null;
        }).catch((error) => {
            console.log(error)
        });
        } else {
            action(() => newObj.taxonSearchWaitingForResult = false)()
            action(() => newObj.taxonSearchResult.replace([]))()
        }
    }
    autorun(() => {doSearch(newObj.taxonSearchString)}, { delay: 300} )
    return null
}
