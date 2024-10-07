import React from 'react'
import { observer, inject } from 'mobx-react'
import Tabs from '../tabs'
import Assessment51Naturtyper from './assessment51Naturtyper'
import Assessment52Utbredelse from './assessment52Utbredelse'

class Assessment50Bakgrunnsdata extends React.Component {
    render() {
        const { appState: { infoTabs } } = this.props
        return (
            <div>
                <Tabs clName={"nav_menu submenu"} tabData={infoTabs} />
                {infoTabs.activeTab.id === 2
                    ? <Assessment51Naturtyper />
                    : <Assessment52Utbredelse />
                }
            </div>
        )
    }
}

export default inject('appState')(observer(Assessment50Bakgrunnsdata));
