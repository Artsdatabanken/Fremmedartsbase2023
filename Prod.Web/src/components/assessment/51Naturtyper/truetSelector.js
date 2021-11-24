// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as Xcomp from './../observableComponents';
import { action } from 'mobx';


@observer
export default class TruetSelector extends React.Component {
    constructor(props) {
        console.log("nts: " + JSON.stringify(props.naturtyper, undefined))
        super(props)

    }
    render() {
        const {naturtyper, setSelected} = this.props;

        // console.log("SELECTOR: " + JSON.stringify(naturtyper, undefined, 2))

        return(
            <div>
                {naturtyper.map(hovedtypegruppe => 
                    <div key={hovedtypegruppe.Id}>
                        <div
                        className={"glyphicon glyphicon-chevron-down tree-view-arrow " }
                            onClick={action(() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed)} 
                            > {hovedtypegruppe.Collapsed == false ? <ExpandMoreIcon/> : <NavigateNextIcon/>}
                            
                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{width: "350px"}}>{hovedtypegruppe.Text}</span>
                                {<span>{hovedtypegruppe.Value}</span>}
                            </span>
                        </div>
                    </div>
                )}
            </div> 
        );
    }
}
