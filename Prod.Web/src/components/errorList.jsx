import React from 'react';
// import {object, PropTypes} from 'prop-types';
// import {action, runInAction, useStrict} from 'mobx';
import {Observer} from 'mobx-react';
// import {UserContext} from '../componentsBootstrapMobx/components'

const ErrorList = (props) => <Observer>{() => {
    // const context = UserContext.getContext()
    const {errorhandler, errorids, className, options} = props;
    const ulclassname = className //?? "errorMessages"

    if (!errorhandler) {
        console.log("ErrorList: missing errorhandler")
    }
    if (options !== "all" && !Array.isArray(errorids)) {
        console.log("ErrorList: missing errorids array")
    }

    const sortederrorids = 
        options === "all"  
        ? Object.keys(errorhandler.errors).sort().filter(obj =>  errorhandler.errors[obj] !== null)
        : Object.keys(errorhandler.errors).sort().filter(obj => (errorids.includes(obj)) && errorhandler.errors[obj] !== null)

    const sortedwarningids = 
        options === "all"  
        ? []//Object.keys(errorhandler.warnings).sort().filter(obj => errorhandler.warnings[obj] !== null)
        : Object.keys(errorhandler.warnings).sort().filter(obj => (errorids.includes(obj)) && errorhandler.warnings[obj] !== null)
    const sortedinfoids = 
        options === "all"  
        ? []
        : Object.keys(errorhandler.infos).sort().filter(obj => (errorids.includes(obj)) && errorhandler.infos[obj] !== null)


    return (
        <ul className={ulclassname}>
            {sortederrorids.map(key => <li key={key}><b style={{ color: 'red' }}>{errorhandler.errors[key]}</b></li> )}
            {sortedwarningids.map(key => <li key={key}><b style={{ color: 'orange' }}>{errorhandler.warnings[key]}</b></li> )}
            {sortedinfoids.map(key => <li key={key}><b style={{ color: 'black' }}>{errorhandler.infos[key]}</b></li> )}
        </ul>
);
}}</Observer>


export default ErrorList
