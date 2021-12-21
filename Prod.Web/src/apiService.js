// import fetch from 'isomorphic-fetch'
//import {session, user} from "./components/userSession"
import auth from './components/authService'
import config from './config';
import {flow, toJS} from 'mobx'


export function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    }

    if (response.status === 401) {
        // tving reautentisering
        // todo: logout needed?
        //session.invalidate()
        throw new Error("Ikke innlogget.")

    }

    const error = new Error(response.statusText)
    error.response = response
    throw error
}

async function parseJSON(response) {
    const text = await response.text()
    if(text.length <=0) return {} // assesment/lock method returns empty
    return JSON.parse(text)
}

function handleApiError(error, url) {
    console.log("error:" + JSON.stringify(error) + "  url: " + url);
}

export function loadData(resourceId, callback, errorCallback) {
    // if(resourceId === "bruker/alle") {
        // console.log(resourceId)
        // console.trace()
    // }
    const url = resourceId.startsWith('/') || resourceId.startsWith('http')
        ? resourceId
        : config.apiUrl + resourceId
        // console.log("# " + config.apiUrl )
        // console.log(url)
        fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.getAuthToken
            }
        })
        .then(response => checkStatus(response))
        .then(response => parseJSON(response))
        .then(data => {
            // console.log('request success', data || data === false  ? data : " No data ");
            callback(data);            

        })
        .catch((e) => {
            console.log("Error on resourceId: " + resourceId + " " + e)
            //console.log(JSON.stringify(e))
            handleApiError(e, url)
            if (errorCallback)
                errorCallback(e)
        });
}

export function postData(resourceId, data, callback, errorCallback) {
    // if(resourceId === "bruker/alle") {
        // console.log(resourceId)
        // console.trace()
    // }
    const url = resourceId.startsWith('/') || resourceId.startsWith('http')
        ? resourceId
        : config.apiUrl + resourceId
    fetch(url, {
            method: 'post',
            body: JSON.stringify(data), // data can be `string` or {object}! (cant get it to work with {object}...)
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.getAuthToken
            }
        })
        .then(response => checkStatus(response))
        .then(response => parseJSON(response))
        .then(data => {
            console.log('request success', data ? data : " No data ");
            callback(data);            

        })
        .catch((e) => {
            console.log("Error on resourceId: " + resourceId)
            //console.log(JSON.stringify(e))
            handleApiError(e, url)
            if (errorCallback)
                errorCallback(e)
        });
}

export function putData(resourceId, data, callback, errorCallback) {
    // if(resourceId === "bruker/alle") {
        // console.log(resourceId)
        // console.trace()
    // }
    const url = resourceId.startsWith('/') || resourceId.startsWith('http')
        ? resourceId
        : config.apiUrl + resourceId
    fetch(url, {
            method: 'put',
            body: JSON.stringify(data), // data can be `string` or {object}! (cant get it to work with {object}...)
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.getAuthToken
            }
        })
        .then(response => checkStatus(response))
        .then(response => parseJSON(response))
        .then(data => {
            console.log('request success', data ? data : " No data ");
            callback(data);            

        })
        .catch((e) => {
            console.log("Error on resourceId: " + resourceId)
            //console.log(JSON.stringify(e))
            handleApiError(e, url)
            if (errorCallback)
                errorCallback(e)
        });
}
// export function loadDataFromUrl(url, callback) {
//     fetch(url, {
//             method: 'get',
//             mode: 'no-cors',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//                 'mode': 'no-cors'
//             }
//         })
//         .then(response => checkStatus(response))
//         .then(response => parseJSON(response))
//         .then(data => {
//             //console.log('request success', data.Id);
//             callback(data);

//         })
//         .catch((e) => {
//             console.log(JSON.stringify(e))
//             handleApiError(e, url)
//         });
// }

export function loadDataFromUrl(url, callback) {
    // const [obj,prop] = observableValue;
    
    flow(function * () {
        try {
            const data = yield fetch(url, {
                method: 'get',
                mode: 'no-cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'mode': 'no-cors'
                }
            })
            // obj[prop] = data
            callback(data)
        } catch (error) {
            console.log(JSON.stringify(error))
        }
    })


}

export function storeData(resourceId, data, callback, verb) {
    const url = resourceId.startsWith('/') || resourceId.startsWith('http')
        ? resourceId
        : config.apiUrl + resourceId
    console.log(url)
    let errorCallback = () => {}
    if (typeof resourceId === 'object') {
        data = resourceId.data
        callback = resourceId.callback
        errorCallback = resourceId.errorCallback
        verb = resourceId.verb
        resourceId = resourceId.resourceId  // must come last!
    }
    // console.log("storedata resourceId" + JSON.stringify(resourceId))
    // console.log("storedata data" + JSON.stringify(data))

    if (resourceId === null) {
        throw "storeData: missing resourceId"
    }
    if (data === null) {
        throw "storeData: missing data"
    }
    const jsdata = toJS(data)
    if (jsdata === null) {
        throw "storeData: toJS failed"
    }
    const jsondata = JSON.stringify(jsdata)
    if (jsondata === null) {
        throw "storeData: failed to serialize"
    }


    //const url = config.apiUrl + resourceId;
    const method = !verb
        ? 'put'
        : verb
    fetch("https://it-webadbtest01.it.ntnu.no/fab/master_api/api/referansesok/", {
        //mode: 'no-cors',
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth.getAuthToken //()
        },
            body: jsondata // JSON.stringify(data)
        })
        .then(checkStatus)
        .then(parseJSON)
        .then(cbdata => {
            // console.log('request success ', cbdata.id || cbdata.Id || "");
            if (callback) {
                callback(cbdata)
            }
        })
        // .catch(handleApiError, url);
        .catch(e => {
            console.log("error : " + JSON.stringify(e))
            errorCallback()
            handleApiError(e, url)
        })
        console.log(url);
}

export function deleteData(resourceId, data, callback) {
    //const url = config.apiUrl + resourceId
    const url = resourceId
    console.log(url)
    const method = 'delete'
    fetch(url, {
        //mode: 'no-cors',
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.getAuthToken
        },
        body: JSON.stringify(data)
    }).then(checkStatus)
    //.then(parseJSON)
        .then(data => {
        console.log('request success ', data.id || data.Id || "");
        if (callback) {
            callback(data)
        }
    }).catch(handleApiError, url)
}

export function upload(upload, onComplete) {
    upload.errorMessage = ''
    upload.progressPercentage = 0
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState != 4)
            return
        if (xhr.status === 200) {
            upload.progressPercentage = -1
            onComplete(upload)
        } else {
            upload.errorMessage = `Feilet (${xhr.status}): ${xhr.responseText}`
        }
    }
    xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable)
            return
        upload.progressPercentage = (e.loaded / e.total) * 100
    }

    const url = `${config.apiUrl}/api/Document/` + upload.assessmentId
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + auth.getAuthToken) // ())

    const formData = new FormData()
    formData.append('files', upload.file, upload.Filename)
    formData.append('name', upload.Description)
    xhr.send(formData)
}


export function getArtskartUrl(
    taxonId,
    scientificNameId,
    selectionGeometry,
    kriterier,
    showWaterAreas,
    geojson = {features:[]})
  {
    // const apibase = "http://localhost:16784/api/listhelper/";
    // const apibase = "https://test.artsdatabanken.no/artskartpublicapi/api/listhelper/";
    const apibase = "https://artskart.artsdatabanken.no/PublicApi/api/listhelper/";
    // const type = kriterier.includeObjects == kriterier.includeObservations
    //     ? "all"
    //     : kriterier.includeObjects
    //         ? "specimen"
    //         : "observations";
    const type = kriterier.excludeObjects
        ? "specimen"
        : "all";
    const includeNorge = !kriterier.includeNorge ? false : kriterier.includeNorge;
    const includeSvalbard = !kriterier.includeSvalbard ? false : kriterier.includeSvalbard;
    const region =
      includeNorge === includeSvalbard
        ? "all"
        : includeNorge
            ? "fastland"
            : "svalbard";
    const excludeGbif = kriterier.excludeGbif ? "&sourcedatabases[]=-40,-211" : "";   
    // let queryparams = `fromYear=${kriterier.observationFromYear}&toYear=${kriterier.observationToYear}&fromMonth=${kriterier.fromMonth}&toMonth=${kriterier.toMonth}&type=${type}&region=${region}`;
    let queryparams = `fromYear=${kriterier.AOOyear1}&toYear=${kriterier.AOOyear2}`;
    // queryparams += `&fromMonth=${kriterier.fromMonth}`;
    // queryparams += `&toMonth=${kriterier.toMonth}`;
    if (type !== undefined) queryparams += `&type=${type}`;
    if (region !== undefined) queryparams += `&region=${region}`;
    queryparams += `&scientificNameId=${scientificNameId}`;
    if (excludeGbif) queryparams += `&excludeGbif=${kriterier.excludeGbif}${excludeGbif}`;
    queryparams += `&crs=EPSG:${config.mapEpsgCode}`;
    // console.log('getArtskartUrl', queryparams);
    if (selectionGeometry)
      queryparams += `&geojsonPolygon=${
        JSON.parse(selectionGeometry).geometry.coordinates
      }`;
  
    const points2String = source =>
      geojson.features
        .filter(p => p.source === source)
        .map(p => p.geometry.coordinates)
        .map(p => p[0] + "," + p[1])
        .join(",");
  
    const add = points2String("add");
    if (add) queryparams += "&addPoints=" + add;
    const remove = points2String("remove");
    if (remove) queryparams += "&removePoints=" + remove;
    const result = {
        observations: `${apibase + taxonId}/observations?${queryparams}`,
        areadata: `${apibase + taxonId}/areadata?${queryparams}`
    };
    if (!showWaterAreas) {
        result['countylist'] = `${apibase + taxonId}/countylist?countyYear=2017&${queryparams}`;
    }
    return result;
}
