import React from 'react';
import {extendObservable} from 'mobx';
import {observer} from 'mobx-react';
import * as Xcomp from './observableComponents'

@observer
export default class BootstrapModal extends React.Component {
    constructor(props) {
        super(props)
        this.onCancel = props.onCancel
        this.onOk = props.onOk
        this.heading = props.heading
        this.children = props.children
        this.labels = props.labels
    }

    render() {
        const okEnabled = this.props.okEnabled === undefined ? true : this.props.okEnabled
        console.log (this.children)
        return <div role="dialog" >
            <div className="modal-header">
                        </div>
           {this.children ?
            this.children.map(child =>
                <div style={{display: 'flex'}}>
                <div className="modal-body" >
                            <div style={{display: 'flex'}}>                               
                                {this.children}
                            </div>
                        </div>
                <div className="modal-footer">
                <Xcomp.Button  onClick={this.onCancel}>{this.labels.cancel}</Xcomp.Button>
                <Xcomp.Button  className={(okEnabled ? "" : " disabled" )} disabled={!okEnabled} onClick={this.onOk}>{this.labels.ok}</Xcomp.Button>
            </div>
            </div>
                
            ): null
           
            }
          {/*<div className="modal-backdrop fade in"  style={{zIndex: 1110}}></div>
            <div role="dialog" tabIndex="-1" className="modal fade in" style={{display: "block", zIndex: 1120}}>
                 <div className="modal-dialog">
                    <div className="modal-content" role="document">
                        <div className="modal-header">
                            <Xcomp.Button className="close" ariaLabel="Close" onClick={this.onCancel}>
                                <span aria-hidden="true">×</span>
                            </Xcomp.Button>
                            {typeof this.heading === "string" ?
                                <h4 className="modal-title">
                                    {this.heading}                                 
                                </h4> :
                                <div className="modal-title">
                                    {this.heading}
                                </div>}
                        </div>
                        <div className="modal-body">
                            <div>
                                {this.children}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Xcomp.Button  onClick={this.onCancel}>{this.labels.cancel}</Xcomp.Button>
                            <Xcomp.Button  className={(okEnabled ? "" : " disabled" )} disabled={!okEnabled} onClick={this.onOk}>{this.labels.ok}</Xcomp.Button>
                        </div>
                    </div>
                </div>
            </div>*/}
        </div>
    }
}
