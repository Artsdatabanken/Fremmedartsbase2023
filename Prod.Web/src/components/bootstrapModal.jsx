import React from 'react';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents'

class BootstrapModal extends React.Component {
    constructor(props) {
        super(props)
        this.onCancel = props.onCancel
        this.onOk = props.onOk
        this.heading = props.heading
        this.labels = props.labels
    }
    render() {
        const okEnabled = this.props.okEnabled === undefined ? true : this.props.okEnabled
        
        return <div role="dialog">
            <div className="modal-backdrop"  style={{zIndex: 1110, opacity: "75%"}}></div>
            <div role="dialog" tabIndex="-1" className="modal" style={{display: "block", zIndex: 1120}}>
                <div className="modal-dialog">
                    <div className="modal-content" role="document">
                        <div className="modal-header">
                            
                            {typeof this.heading === "string" ?
                                <h3 className="modal-title">
                                    {this.heading}                                 
                                </h3> :
                                <div className="modal-title">
                                    {this.heading}
                                </div>}
                                <Xcomp.Button className="close" ariaLabel="Close" alwaysEnabled={true} onClick={this.onCancel}>
                                    <span aria-hidden="true">×</span>
                                </Xcomp.Button>
                        </div>
                        <div className="modal-body">
                            <div>
                                {this.props.children}
                                <Xcomp.Button  className={(okEnabled ? "" : " disabled" )} disabled={!okEnabled} onClick={this.onOk}>
                                    {/*{this.labels.ok}*/}
                                    Legg til
                                </Xcomp.Button>
                            </div>
                        </div>
                       {/* <div className="modal-footer">
                            <Xcomp.Button  onClick={this.onCancel}>{this.labels.cancel}</Xcomp.Button>
                            <Xcomp.Button  className={(okEnabled ? "" : " disabled" )} disabled={!okEnabled} onClick={this.onOk}>{this.labels.ok}</Xcomp.Button>
                        </div>*/}
                    </div>
                </div>
            </div>
        </div>
    }
}

export default observer(BootstrapModal);
