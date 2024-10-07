import React from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';

class NaturetypeSelector extends React.Component {
    constructor(props) {
        super(props)
        const ass = props.assessment
        this.setSelectedNT = action((hovedtypegruppe, naturtypekode) => {
            console.log("Truet kode: " + naturtypekode.Id)
            const nnt = props.nyNaturtype
            nnt.majorTypeGroup = hovedtypegruppe.Text
            nnt.niNCode = naturtypekode.Id
            nnt.name = naturtypekode.Text
            nnt.timeHorizon = (ass.isDoorKnocker && ass.speciesStatus == "A") ? "future" : null,
                nnt.colonizedArea = null
            nnt.stateChange.clear()
            nnt.affectedArea = null
            nnt.background.clear()
            props.showModal()
        })
    }
    render() {
        const { naturtyper, setSelected } = this.props;
        return (
            <div>
                {naturtyper.map(hovedtypegruppe =>
                    <div key={hovedtypegruppe.Id}>
                        <div
                            className={"glyphicon glyphicon-chevron-down tree-view-arrow "}
                            onClick={action(() => hovedtypegruppe.Collapsed = !hovedtypegruppe.Collapsed)}
                        >
                            {hovedtypegruppe.Collapsed == true
                                ? <span className="material-symbols-outlined">keyboard_arrow_right</span> :
                                <span className="material-symbols-outlined"> keyboard_arrow_down</span>
                            }

                        </div>
                        <div className="tree-view-label">
                            <span className="hovedtypegruppe">
                                <span className="naturtype-kode" style={{ width: "300px" }}>{hovedtypegruppe.Text}</span>
                            </span>
                        </div>
                        {
                            !hovedtypegruppe.Collapsed && hovedtypegruppe.Children
                                ? <div className="tree-view-children">
                                    {hovedtypegruppe.Children.map(hovedtype =>
                                        <div key={hovedtype.Id}>
                                            <div
                                                className={"glyphicon glyphicon-chevron-down tree-view-arrow " + (hovedtype.Collapsed ? "tree-view-arrow-collapsed" : "")}
                                                onClick={() => hovedtype.Collapsed = !hovedtype.Collapsed}>
                                                {hovedtype.Children.length > 0
                                                    ? hovedtype.Collapsed == true
                                                        ? <span className="material-symbols-outlined">keyboard_arrow_right</span> :
                                                        <span className="material-symbols-outlined"> keyboard_arrow_down</span>
                                                    : <div style={{ width: '24px' }}></div>} {/* <-- to align all the choice buttons even though they don't have an arrow to expand */}
                                            </div>
                                            <div className="hovedtype tree-view-label btn-flat" onClick={() => this.setSelectedNT(hovedtypegruppe, hovedtype)}>
                                                <span className="naturtype-kode">{hovedtype.Text}</span>
                                                <span className="nt-code">{"'" + hovedtype.Value + "'"}</span>
                                            </div>
                                            {!hovedtype.Collapsed && hovedtype.Children
                                                ? <div className="tree-view-children">
                                                    {hovedtype.Children.map(grunntype =>
                                                        <div key={grunntype.Id}>
                                                            <div
                                                                className={"glyphicon glyphicon-chevron-down tree-view-arrow " +
                                                                    (grunntype.Collapsed ? "tree-view-arrow-collapsed" : "")}
                                                                onClick={() => grunntype.Collapsed = !grunntype.Collapsed}>
                                                                {grunntype.Children.length > 0 ?
                                                                    grunntype.Collapsed == true ?
                                                                        <span className="material-symbols-outlined">keyboard_arrow_right</span> :
                                                                        <span className="material-symbols-outlined"> keyboard_arrow_down</span> :
                                                                    <div style={{ width: '24px' }} />} {/* <-- to align all the choice buttons even though they don't have an arrow to expand */}
                                                            </div>
                                                            <div className="grunntype tree-view-label btn-flat" onClick={() => this.setSelectedNT(hovedtypegruppe, grunntype)}>
                                                                <span className="naturtype-kode">{grunntype.Text}</span>
                                                                <span className="nt-code">{"'" + grunntype.Value + "'"}</span>
                                                            </div>
                                                            {!grunntype.Collapsed && grunntype.Children
                                                                ? <div className="tree-view-children">
                                                                    {grunntype.Children.map(kegrtype =>
                                                                        <div key={kegrtype.Id} onClick={() => this.setSelectedNT(hovedtypegruppe, kegrtype)}>
                                                                            <span className="grunntype btn-flat">
                                                                                <span className="naturtype-kode">{kegrtype.Id}</span>
                                                                                <span>{kegrtype.Text}</span>
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                : null}
                                                        </div>
                                                    )}
                                                </div>
                                                : null}
                                        </div>
                                    )}
                                </div>
                                : null}
                    </div>
                )}
            </div>
        );
    }
}

export default observer(NaturetypeSelector);
