import React from 'react';
import {observer} from 'mobx-react';

@observer
export default class Tabs extends React.Component {

    render(){
        const tabData = this.props.tabData
        // console.log("aCTIVE KEY: " + tabData.activeTab.id)
        // console.log("Type: " + typeof(tabData.tabList))

        return (
            <ul className="nav_menu faner" role="menu">
            {tabData.tabList.filter(tab =>
                    tab.visible
                ).map((tab) => {
                    const isActive = tabData.activeTab.id === tab.id
                return <li key={tab.id} role="menuitem"
                    style={tab.enabled ? {cursor: "pointer"}: null}
                    className={(isActive ? " active " : " ") + (tab.enabled ? " " : " disabled ") + (tab.notrequired ? " notrequired " : " ")}
                    onClick={() => {tabData.setActiveTab(tab) }}
                    >
                        {isActive ? <b>{tab.name}</b>:tab.name}
                    
                </li>
                }
                )}
            </ul>
        );
    }
}
