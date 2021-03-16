import React from 'react'
import {observer} from 'mobx-react'
import * as Xcomp from './observableComponents'
import {Button, Modal} from 'react-bootstrap'

@observer
export default class Artskartparametre extends React.Component {
    render() {
        const {utvalg, fabModel} = this.props
        return (
            <Modal onHide={() => this.props.onOk()} show bsSize="small">
                <Modal.Header closeButton>
                    <Modal.Title>Artskart utvalg</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{
                    width: "100%"
                }}>
                    <Xcomp.Number
                        label="Fra måned"
                        width='3em'
                        observableValue={[utvalg, 'fromMonth']}
                        integer
                    />
                    <Xcomp.Number
                        label="Til måned"
                        width='3em'
                        observableValue={[utvalg, 'toMonth']}
                        integer
                    />
                        {fabModel.language === "NO" && <span>
                    <Xcomp.Bool label='I Norge' observableValue={[utvalg, 'includeNorge']}/>
                    <Xcomp.Bool label='På Svalbard' observableValue={[utvalg, 'includeSvalbard']}/>
                    </span>}
                    <Xcomp.Bool label='objekter' observableValue={[utvalg, 'includeObjects']}/>
                    <Xcomp.Bool
                        label='observasjoner'
                        observableValue={[utvalg, 'includeObservations']}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.props.onOk()}>OK</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}