import React from 'react';
import PropTypes from 'prop-types'
import {observer, inject} from 'mobx-react';
import {action, computed, runInAction, observable, makeObservable, extendObservable} from 'mobx'
import * as Xcomp from './observableComponents';
import Tabs from '../tabs'
import Criterion from './criterion'
import Assessment62Okologiskeffekt from './assessment62Okologiskeffekt'
import config from '../../config'
// import Filliste from './35Utbredelseshistorikk/Filliste'
// import FileUpload from '../FileUpload'
import Documents from '../documents'
// import { KeyboardHideSharp } from '@material-ui/icons'
// import {stringFormat} from "../../utils"
import ModalArtskart from '../artskart/ModalArtskart';
import errorhandler from '../errorhandler';
import ErrorList from '../errorList';
import { getWaterAreas } from '../water/apiWaterArea';

@inject("appState")
@observer
export default class Assessment61CriteriaC extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        const {appState:{assessment:{riskAssessment}}, appState, } = this.props;
        const critC = riskAssessment.critC

        return (
            <fieldset className="well">
                <h4>{critC.heading}</h4>
                <p>{critC.info}</p>
                <Criterion criterion={critC} mode="noheading" disabled={true} appState={appState}/>
            </fieldset>
        );
    }
}
