// import config from '../../../config';
import React from 'react';
import {observer} from 'mobx-react';
import {extendObservable} from 'mobx';
import * as Xcomp from '../observableComponents';
import BsModal from '../../bootstrapModal'
// const labels = config.labels

const lisenskoder = [
    {
        "Text": "CC BY",
        "Value": "ccby30"
    }, {
        "Text": "CC BY-SA",
        "Value": "CC BY-SA"
    }
]

export default class UploadPicturesButton extends React.Component {
    render() {
        const {scientificName} = this.props;
        const crlf = "%0D%0A"
        const body = "Fyll inn" + crlf + crlf + "fotograf:" + crlf + crlf + "institusjon:" + crlf + crlf + "funnsted:" + crlf + crlf + "annen informasjon (se retningslinjer):" + crlf + crlf + "lisens:" + crlf + crlf + "Vi anbefaler CC BY 4.0, alternativt CC BY-SA 4.0, se http://beta.artsdatabanken." +
                "no/Article/Article/134105"

        const mailadress = "tove.rimestad@artsdatabanken.no"
        return (
            <a
                className="btn btn-primary btn-xs"
                href={"mailto:" + mailadress + "?Subject=Bilder for " + scientificName + "&body=" + body}
                target="_top">Last opp bilder</a>
        )
    }
}

//https://creativecommons.org/licenses/by/3.0/deed.no
// @observer
// class UploadPicturesModal extends React.Component {
//     constructor(props) {
//         super()

//         extendObservable(this, {
//             visibleModal: false,
//             lisens: null
//         })
//         this.showModal = () => this.visibleModal = true
//         this.hideModal = (e) => {
//             e.stopPropagation();
//             this.visibleModal = false
//         }
//         this.onOk = (e) => {
//             this.hideModal(e)
//             props.onSave(alert("send mail"))
//         }
//     }

//     render() {
//         const {scientificName} = this.props;
//         return (
//             <div>
//                 <div className="btn btn-primary btn-xs" onClick={this.showModal}>Last opp bilder</div>
//                 <div>
//                     {this.visibleModal
//                         ? <BsModal
//                                 heading={"Last opp bilder for: " + scientificName}
//                                 onCancel={this.hideModal}
//                                 onOk={this.onOk}>
//                                 <Xcomp.StringEnum
//                                     observableValue={[this, 'lisens']}
//                                     codes={lisenskoder}
//                                     mode="radio"
//                                     forceSync/>
//                             </BsModal>
//                         : null}
//                 </div>
//             </div>
//         )
//     }
// }
