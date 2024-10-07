import React from 'react';
import { observer } from 'mobx-react';

class Tabs extends React.Component {

    render() {
        const tabData = this.props.tabData
        const clName = this.props.clName
        // console.log("aCTIVE KEY: " + tabData.activeTab.id)
        // console.log("Type: " + typeof(tabData.tabList))
        // console.log("taddata: " + JSON.stringify(tabData))
        return (
            <ul className={clName} role="menu">
                {tabData.tabList.filter(tab =>
                    tab.visible
                ).map((tab) => {
                    const isActive = tabData.activeTab.id === tab.id
                    // if(!tab.enabled) console.log("disabled: " + tab.id)
                    // if(tab.enabled === "false") console.log("enabled: " + tab.id)
                    // console.log("enabled: " + tab.id + " " + tab.enabled)

                    return <li key={tab.id} role="menuitem"
                        style={tab.enabled ? { cursor: "pointer" } : null}
                        className={(isActive ? " active " : " ") + (tab.enabled ? " " : " disabled ") + (tab.notrequired ? " notrequired " : " ")}
                        onClick={() => { tabData.setActiveTab(tab) }}
                    >
                        {isActive ? <b>{tab.name}</b> : tab.name}

                    </li>
                }
                )}
            </ul>
        );
    }
}

export default observer(Tabs);
