import React from "react";
import config from "../../config";
import { observer, inject } from "mobx-react";
import * as Xcomp from "./observableComponents";
import DistributionTable from "./distributionTable";
import UtbredelseshistorikkInnenlands from "./35Utbredelseshistorikk/UtbredelseshistorikkInnenlands";
import ModalArtskart from "../artskart/ModalArtskart";
import ModalSimpleMap from "../artskart/ModalSimpleMap";
import Fylkesforekomst from "../fylkesforekomst/Fylkesforekomst";
import fylker from "../fylkesforekomst/fylker_2017";
import Documents from "../documents";
import { action, computed, extendObservable, runInAction } from "mobx";
import SimpleMap from "../map/SimpleMap";
import WaterArea from "../water/WaterArea";
import { getWaterAreas } from "../water/apiWaterArea";
import mapOlFunc from "../map/MapOlFunctions";
import errorhandler from "../errorhandler";
import ErrorList from "../errorList";
import { beskrivTidSiden } from "../../formatting";
@inject("appState")
@observer
export default class Assessment52Utbredelse extends React.Component {
  // code looks unused, but it makes the Artskart-module listen to changes
  @computed get isDirty() {
    if (!this.props.appState.assessmentId) return false;
    const a = JSON.stringify(this.props.appState.assessment);
    const b = this.props.appState.assessmentSavedVersionString;
    return a != b;
  }
  GetIsRegionalAssessment = (assessment) => {
    return (
      assessment.isAlienSpecies &&
      assessment.isRegionallyAlien &&
      assessment.expertGroup == "Fisker"
    );
  };

  constructor(props) {
    super();
    extendObservable(this, {
      initialWaterAreas: null,
      selectedWaterArea: [],
      waterIsChanged: 0,
    });
    if (props && props.appState && props.appState.assessment) {
      const assessment = props.appState.assessment;
      if (this.GetIsRegionalAssessment(assessment)) {
        if (assessment.artskartWaterModel === null)
          assessment.artskartWaterModel = {};
        if (
          this.initialWaterAreas === null &&
          this.GetIsRegionalAssessment(assessment)
        ) {
          const self = this;
          getWaterAreas().then((data) => {
            action(() => {
              self.initialWaterAreas = data;
              const ass = assessment;
              ass.artskartWaterModel.isWaterArea = ass.artskartWaterModel
                .isWaterArea
                ? ass.artskartWaterModel.isWaterArea
                : false;
              self.reCreateartskartWaterModelArea({
                ass,
                initialWaterAreas: self.initialWaterAreas,
              });
            })();
          });
        }
        if (
          assessment.artskartWaterModel &&
          assessment.artskartWaterModel.areas
        ) {
          this.selectedWaterArea = assessment.artskartWaterModel.areas
            .filter((x) => x.disabled === 0)
            .map((x) => x.globalId);
        }
      }
    }
  }

  reCreateartskartWaterModelArea = ({ ass, initialWaterAreas }) => {
    if (ass.artskartWaterModel.areas) return;
    const waterObject = ass.artskartWaterModel.isWaterArea
      ? initialWaterAreas.areaState
      : initialWaterAreas.regionState;
    ass.artskartWaterModel.areas = [];
    for (var key in waterObject) {
      // console.log('adding?', key);
      if (
        ass.artskartWaterModel.areas.find((x) => x.globalId === key) ===
        undefined
      ) {
        // console.log('adding', key);
        ass.artskartWaterModel.areas.push(waterObject[key]);
      } else {
        console.log("not adding", key);
      }
    }
  };

  getWaterFeatures = (assessment) => {
    if (this.initialWaterAreas && assessment && assessment.artskartWaterModel) {
      return assessment.artskartWaterModel.isWaterArea
        ? this.initialWaterAreas.waterArea
        : this.initialWaterAreas.waterRegion;
    }
  };

  checkArea = (property) => {
    // finds all the objects with id's that should be hidden
    if (property < 8) {
      return "D1D2E";
    } else if (property < 40) {
      return "E";
    } else {
      return "";
    }
  };

  addRegion = ({ name, globalId, mapIndex }) => {
    // console.log('clicked:', name, globalId, mapIndex);
    const {
      appState: { assessment },
      appState,
      appState: { infoTabs },
    } = this.props;
    const waterObject = assessment.artskartWaterModel.areas.find(
      (x) => x.globalId === globalId
    );
    if (waterObject && !waterObject.disabled) {
      const currentState = mapOlFunc.convertMapIndex2State(mapIndex);
      const areaValue = waterObject[`state${currentState}`] === 0 ? 1 : 0;
      waterObject[`state${currentState}`] = areaValue;
      if (areaValue === 1) {
        waterObject.state2 = 0;
        switch (currentState) {
          case 0:
            waterObject.state1 = 1;
          case 1:
            waterObject.state3 = 1;
        }
      } else if (
        waterObject.state0 === 0 &&
        waterObject.state1 === 0 &&
        waterObject.state3 === 0
      ) {
        waterObject.state2 = 1;
      }
      this.waterIsChanged++;
    }
  };

  handleWaterCheck = ({ waterObject, state, value }) => {
    // console.log('handleWaterCheck', waterObject, state, value)
    const {
      appState: { assessment },
      appState,
      appState: { infoTabs },
    } = this.props;
    const area = assessment.artskartWaterModel.areas.find(
      (x) => x.globalId === waterObject.globalId
    );
    if (area) {
      area.state0 = waterObject.state0;
      area.state1 = waterObject.state1;
      area.state2 = waterObject.state2;
      area.state3 = waterObject.state3;
    }
    this.waterIsChanged++;
  };

  handleOverførFraSimpleMap = ({ selectedItems, newIsWaterArea }) => {
    // console.log('handleOverførFraSimpleMap', selectedItems);
    const {
      appState: { assessment },
      appState,
      appState: { infoTabs },
    } = this.props;
    // console.log('handleOverførFraSimpleMap', assessment.artskartWaterModel.isWaterArea, newIsWaterArea);
    if (assessment.artskartWaterModel.isWaterArea != newIsWaterArea)
      assessment.artskartWaterModel.areas = undefined;
    assessment.artskartWaterModel.isWaterArea = newIsWaterArea;
    this.reCreateartskartWaterModelArea({
      ass: assessment,
      initialWaterAreas: this.initialWaterAreas,
    });
    const deSelectArea = (area) => {
      area.disabled = 1;
      area.selected = 0;
      area.state0 = 0;
      area.state1 = 0;
      area.state2 = 1;
      area.state3 = 0;
    };
    assessment.artskartWaterModel.areas.forEach((area) => {
      if (selectedItems) {
        if (selectedItems.indexOf(area.globalId) < 0) {
          deSelectArea(area);
        } else {
          area.disabled = 0;
          area.selected = 1;
        }
      } else {
        deSelectArea(area);
      }
    });

    this.selectedWaterArea = assessment.artskartWaterModel.areas
      .filter((x) => x.disabled === 0)
      .map((x) => x.globalId);
  };

  handleOverførFraArtskart = ({
    selectionGeometry,
    countylist,
    newWaterAreas,
    areadata,
    observations,
    editStats,
  }) => {
    const aps = this.props.appState;
    const ass = aps.assessment;

    if (this.GetIsRegionalAssessment(ass)) {
      if (newWaterAreas) {
        newWaterAreas.forEach((x) => {
          const area = ass.artskartWaterModel.areas.find(
            (a) => a.globalId === x.globalId
          );
          if (area) {
            area.state0 = x.intersects ? 1 : 0;
            area.state1 = x.intersects ? 1 : 0;
            area.state2 = !x.intersects ? 1 : 0;
            area.state3 = x.intersects ? 1 : 0;
          }
        });
        this.selectedWaterArea = ass.artskartWaterModel.areas
          .filter((x) => x.disabled === 0)
          .map((x) => x.globalId);
        this.waterIsChanged++;
      }
    }

    ass.riskAssessment.AOOknownInput = areadata.AreaOfOccupancy;
    ass.currentSpreadArea = areadata.AreaExtentOfOccurrence;
    ass.artskartExcludedLocalities = areadata.ExcludedLocalities;
    ass.artskartManuellAdd = editStats.add;
    ass.artskartManuellRemove = editStats.remove;
    ass.artskartSistOverført = new Date();
    ass.artskartSelectionGeometry = selectionGeometry;
    ass.riskAssessment.AOOendyear1 = ass.artskartModel.observationFromYear;
    ass.riskAssessment.AOOendyear2 = ass.artskartModel.observationToYear;
    if (
      ass.riskAssessment.AOOyear2 === undefined ||
      ass.riskAssessment.AOOyear2 == null
    )
      ass.riskAssessment.AOOyear2 = ass.artskartModel.observationToYear;
    if (
      ass.riskAssessment.AOOknown2 === undefined ||
      ass.riskAssessment.AOOknown2 == null
    )
      ass.riskAssessment.AOOknown2 = ass.riskAssessment.AOOknownInput;

    // TODO: Fylkesoversikt - avventer data fra API
    if (countylist) {
      let fo = countylist.reduce((acc, e) => {
        acc[e.NAVN] = e.Status;
        return acc;
      }, {});
      ass.fylkesforekomster.forEach((f) => {
        f.state0 = fo[fylker[f.fylke]] > 0 ? 1 : 0;
        if (f.state0 === 1) {
          f.state2 = 0;
          f.state1 = 1;
          f.state3 = 1;
        } else if (
          parseInt(f.state0) + parseInt(f.state1) + parseInt(f.state3) ===
          0
        ) {
          f.state2 = 1;
        }
      });
      // console.log('ass.fylkesforekomster', ass.fylkesforekomster);
    }

    // Vi ønsker bare lagre redigeringer
    const points2String = (source) =>
      observations.features
        .filter((p) => p.source === source)
        .map((p) => p.geometry.coordinates)
        .map((p) => p[0] + "," + p[1])
        .join(",");
    ass.artskartAdded = points2String("add");
    ass.artskartRemoved = points2String("remove");
    // console.log('assessment52...', ass.artskartAdded, ass.artskartRemoved);
  };

  render() {
    const renderAgain = this.isDirty; // code looks unused, but it makes the Artskart-module listen to changes
    const {
      appState: { assessment },
      appState,
      appState: { infoTabs },
    } = this.props;
    const koder = appState.koder;
    const generalLabels = appState.codeLabels;
    const labels = appState.codeLabels.DistributionHistory;

    return (
      <div>
        <fieldset className="well">
          <h2>Utbredelse i Norge</h2>
          {!this.initialWaterAreas &&
          this.GetIsRegionalAssessment(assessment) ? (
            <>
              <h4>
                Vurderingsområde <i>(beta)</i>
              </h4>
              <div style={{ marginLeft: 20, marginBottom: 30 }}>
                ...henter vannregioner og vannområder
              </div>
            </>
          ) : null}
          {this.initialWaterAreas &&
          this.GetIsRegionalAssessment(assessment) ? (
            <>
              <h4>
                Vurderingsområde <i>(beta)</i>
              </h4>
              <div style={{ marginLeft: 20, marginBottom: 30 }}>
                <ModalSimpleMap
                  evaluationContext={assessment.evaluationContext}
                  labels={labels}
                  artskartWaterModel={assessment.artskartWaterModel}
                  isWaterArea={assessment.artskartWaterModel.isWaterArea}
                  initialWaterAreas={this.initialWaterAreas}
                  onOverførFraSimpleMap={action(this.handleOverførFraSimpleMap)}
                />
              </div>
            </>
          ) : null}
          <h4>Forekomstareal</h4>
          {assessment.isDoorKnocker ? (
            <div>
              <div className="statusField">
                <div className="labels distribution dk">
                  <p>
                    Hvor mange 2 km x 2 km-ruter kan arten kolonisere i løpet av
                    en 10 års-periode basert på én introduksjon til norsk natur
                    (innenfor vurderingsperioden på 50 år)?
                  </p>
                  <p>
                    Hvor mange ytterligere introduksjoner til norsk natur antas
                    arten å få i løpet av samme 10-års periode?
                  </p>
                  <p style={{ marginTop: "180px" }}>
                    Totalt forekomstareal{" "}
                    <b> 10 år etter første introduksjon </b> (km<sup>2</sup>)
                  </p>
                </div>
                <div className="distribution dk">
                  <DistributionTable />
                </div>
              </div>
              <ErrorList
                errorhandler={errorhandler}
                errorids={["(a)warn6", "(a)warn7", "(b)err1", "(b)err2"]}
              />
              <br />
              <div className="changedNature">
                <p>Andel av antatt forekomstareal i sterkt endra natur (%)</p>
                <Xcomp.StringEnum
                  observableValue={[
                    assessment.riskAssessment,
                    "spreadHistoryDomesticAreaInStronglyChangedNatureTypes",
                  ]}
                  codes={koder.KnownDistributionInNature}
                />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginLeft: 20, marginBottom: 30 }}>
                <ModalArtskart
                  taxonId={assessment.taxonId}
                  scientificNameId={assessment.evaluatedScientificNameId}
                  evaluationContext={assessment.evaluationContext}
                  showWaterAreas={this.GetIsRegionalAssessment(assessment)}
                  artskartWaterModel={assessment.artskartWaterModel}
                  waterFeatures={this.getWaterFeatures(assessment)}
                  labels={labels}
                  utvalg={assessment.riskAssessment}
                  artskartModel={assessment.artskartModel}
                  onOverførFraArtskart={action(this.handleOverførFraArtskart)}
                  artskartSelectionGeometry={
                    assessment.artskartSelectionGeometry
                  }
                  artskartAdded={assessment.artskartAdded}
                  artskartRemoved={assessment.artskartRemoved}
                  unused={this.waterIsChanged}
                  token={appState.token}
                />
              </div>
              <div style={{ paddingBottom: 16 }}>
                {assessment.artskartSistOverført &&
                (!!assessment.artskartAdded ||
                  !!assessment.artskartRemoved ||
                  assessment.artskartSelectionGeometry) ? (
                  <span>
                    Sist overført fra Artskart{" "}
                    {beskrivTidSiden(
                      assessment.artskartSistOverført,
                      appState.codeLabels.Timing
                    )}
                    .{" "}
                  </span>
                ) : null}
                {assessment.artskartManuellAdd > 0 ? (
                  <span>
                    {assessment.artskartManuellAdd}{" "}
                    {assessment.artskartManuellAdd === 1 ? "rute" : "ruter"} ble
                    manuelt lagt til.{" "}
                  </span>
                ) : null}
                {assessment.artskartManuellRemove > 0 ? (
                  <span>
                    {assessment.artskartManuellRemove}{" "}
                    {assessment.artskartManuellRemove === 1 ? "rute" : "ruter"}{" "}
                    ble manuelt fjernet.
                  </span>
                ) : null}
                {assessment.artskartSelectionGeometry ? (
                  <span>
                    Et polygon som ekskluderer{" "}
                    <b>{assessment.artskartExcludedLocalities}</b>{" "}
                    {assessment.artskartExcludedLocalities === 1
                      ? "rute"
                      : "ruter"}{" "}
                    har blitt lagt til.
                  </span>
                ) : null}
              </div>
              {!!assessment.artskartAdded ||
              !!assessment.artskartRemoved ||
              assessment.artskartSelectionGeometry ? (
                <div style={{ paddingBottom: 24 }}>
                  <Xcomp.HtmlString
                    label="Hvis nye lokaliteter legges til eller gamle fjernes, eller man har avgrenset utvalget ved å tegne et polygon, skal det dokumenteres (hvorfor og hva)"
                    observableValue={[assessment, "artskartManuellKommentar"]}
                  />
                </div>
              ) : null}
              <p>Basert på periode:</p>
              <div className="distributionYears">
                <div>
                  <p>
                    {" "}
                    f.o.m. år (t<sub>0</sub>)
                  </p>
                  <Xcomp.Number
                    style={{ marginLeft: 20 }}
                    observableValue={[assessment.riskAssessment, "AOOendyear1"]}
                    yearRange={true}
                  />
                </div>
                <div>
                  <p>t.o.m. år</p>
                  <Xcomp.Number
                    // About the name of this property: Se domain!
                    observableValue={[assessment.riskAssessment, "AOOendyear2"]}
                    yearRange={true}
                  />
                </div>
              </div>
              <div className="statusField">
                <div className="labels distribution">
                  <div style={{ display: "flex", marginTop: "90px" }}>
                    <p>
                      Forekomstareal <b>i dag</b> (km<sup>2</sup>):
                    </p>
                    {!assessment.isDoorKnocker ? (
                      <div style={{ width: "100px", marginTop: "-5px" }}>
                        <b>Kjent</b>
                        <Xcomp.Number
                          className={"knownDistribution"}
                          observableValue={[
                            assessment.riskAssessment,
                            "AOOknownInput",
                          ]}
                          observableErrors={[
                            errorhandler,
                            "(a)err6",
                            "(a)err11",
                          ]}
                        />
                      </div>
                    ) : null}
                  </div>
                  <ErrorList
                    className="errorMessages180"
                    errorhandler={errorhandler}
                    errorids={[]}
                  />
                  <p>
                    Forekomstareal <b>om 50 år </b> (km<sup>2</sup>)
                  </p>
                </div>
                <div className="distribution">
                  <DistributionTable />
                </div>
              </div>
              <ErrorList
                errorhandler={errorhandler}
                errorids={[
                  "(a)err1",
                  "(a)err6",
                  "(a)err666",
                  "(a)err18",
                  "(a)err19",
                  "(a)err20",
                  "(a)err23",
                  "(a)err24",
                  "(a)warn4",
                  "(a)warn5",
                ]}
              />
              <br />
              <div className="changedNature">
                <p>Andel av kjent forekomstareal i sterkt endra natur (%) </p>
                <Xcomp.StringEnum
                  observableValue={[
                    assessment.riskAssessment,
                    "spreadHistoryDomesticAreaInStronglyChangedNatureTypes",
                  ]}
                  codes={koder.KnownDistributionInNature}
                />
              </div>
              {assessment.speciesStatus == "C3" ? (
                <div style={{ marginTop: "50px" }}>
                  <p>
                    {" "}
                    {assessment.isRegionallyAlien
                      ? generalLabels.SpeciesStatus
                          .statusInNorwayRegionallyAlien
                      : generalLabels.SpeciesStatus.statusInNorway}{" "}
                    {generalLabels.SpeciesStatus.highestCategoryPerToday}
                  </p>
                  <br />
                  <Xcomp.StringEnum
                    observableValue={[
                      assessment,
                      "speciesEstablishmentCategory",
                    ]}
                    mode="radio"
                    options={this.checkArea(
                      assessment.riskAssessment.AOOtotalBest
                    )}
                    codes={koder.DistributionOptions}
                  />
                </div>
              ) : null}
            </div>
          )}
          <hr></hr>
          <div>
            <Documents />
          </div>
          <div></div>
        </fieldset>
        <fieldset className="well">
          <h4>Regionvis utbredelse</h4>
          {
            assessment.fylkesforekomster
              ? assessment.fylkesforekomster.map((e) => (e.state ? "" : ""))
              : "" /* todo: WHAT??? */
          }
          {!this.GetIsRegionalAssessment(assessment) ? (
            <Fylkesforekomst
              evaluationContext={assessment.evaluationContext}
              taxonId={assessment.TaxonId}
              latinsknavnId={assessment.latinsknavnId}
              utvalg={assessment.artskartModel}
              {...assessment.artskartModel} // Rerender hack
              artskartModel={assessment.artskartModel} // could replace this one?
              fylkesforekomster={assessment.fylkesforekomster}
              assessment={assessment}
              disabled={appState.userContext.readonly}
              onOverførFraArtskart={action(this.handleOverførFraArtskart)}
            />
          ) : null}
          {this.initialWaterAreas &&
          this.GetIsRegionalAssessment(assessment) ? (
            <div>
              {this.initialWaterAreas ? (
                <WaterArea
                  assessment={assessment}
                  initialWaterAreas={this.initialWaterAreas}
                  onWaterCheck={action(this.handleWaterCheck)}
                  waterIsChanged={this.waterIsChanged}
                />
              ) : null}
              <div style={{ display: "inline-flex", width: "100%" }}>
                <div className="waterAreas">
                  <p>Kjent utbredelse i dag</p>
                  <SimpleMap
                    static={true}
                    isWaterArea={assessment.artskartWaterModel.isWaterArea}
                    artskartWaterModel={assessment.artskartWaterModel}
                    waterFeatures={this.getWaterFeatures(assessment)}
                    selectedArea={this.selectedWaterArea}
                    mapIndex={1}
                    waterIsChanged={this.waterIsChanged}
                    onClick={action(this.addRegion)}
                    evaluationContext={assessment.evaluationContext}
                  />
                </div>
                <div className="waterAreas">
                  <p>Antatt utbredelse i dag</p>
                  <SimpleMap
                    static={true}
                    isWaterArea={assessment.artskartWaterModel.isWaterArea}
                    artskartWaterModel={assessment.artskartWaterModel}
                    waterFeatures={this.getWaterFeatures(assessment)}
                    selectedArea={this.selectedWaterArea}
                    mapIndex={2}
                    waterIsChanged={this.waterIsChanged}
                    onClick={action(this.addRegion)}
                    evaluationContext={assessment.evaluationContext}
                  />
                </div>
                <div className="waterAreas">
                  <p>Antatt utbredelse om 50 år</p>
                  <SimpleMap
                    static={true}
                    isWaterArea={assessment.artskartWaterModel.isWaterArea}
                    artskartWaterModel={assessment.artskartWaterModel}
                    waterFeatures={this.getWaterFeatures(assessment)}
                    selectedArea={this.selectedWaterArea}
                    mapIndex={3}
                    waterIsChanged={this.waterIsChanged}
                    onClick={action(this.addRegion)}
                    evaluationContext={assessment.evaluationContext}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <label htmlFor="CurrentPresenceComment">
            {labels.describeAsumption}
          </label>
          <Xcomp.HtmlString
            observableValue={[assessment, "currentPresenceComment"]}
          />
          {assessment.isDoorKnocker ? (
            <p>
              Beskriv antatt utbredelse <i>(overføres til oppsummeringen)</i>
            </p>
          ) : (
            <p>
              Beskriv utbredelseshistorikk og dagens utbredelse i Norge{" "}
              <i>(overføres til oppsummeringen)</i>
            </p>
          )}
          <Xcomp.HtmlString
            observableValue={[
              assessment.riskAssessment,
              "criteriaDocumentationDomesticSpread",
            ]}
          />
        </fieldset>
        {!assessment.isDoorKnocker ? (
          <fieldset className="well">
            <h4>Annen informasjon (ikke obligatorisk)</h4>
            <div className="statusField">
              <div className="labels">
                <p>
                  Kjent utbredelsesområde (km<sup>2</sup>)
                </p>
                {/* <p>Bestandsstørrelse</p> */}
              </div>
              <div className="numbers otherInfo">
                <Xcomp.Number
                  observableValue={[assessment, "currentSpreadArea"]}
                  integer
                />
                {/* <Xcomp.Number observableValue={[assessment, "currentIndividualCount"]} integer/> */}
              </div>
            </div>
          </fieldset>
        ) : null}

        {assessment.spreadHistory.length > 0 ? (
          <fieldset className="well" id="spreadHistoryDomestic">
            <h4>Utbredelseshistorikk 2018</h4>
            <UtbredelseshistorikkInnenlands
              vurdering={assessment}
              appState={appState}
            />
            {assessment.spreadHistoryDomesticDocumentation ? (
              <div>
                <h4>
                  {labels.previousInfo}. <b>{labels.mustTransfer}</b>
                </h4>
                <p
                  dangerouslySetInnerHTML={{
                    __html: assessment.spreadHistoryDomesticDocumentation,
                  }}
                />
                <Xcomp.Button
                  onClick={() => {
                    const existing =
                      assessment.riskAssessment
                        .criteriaDocumentationDomesticSpread;
                    const newstring = !existing
                      ? assessment.spreadHistoryDomesticDocumentation
                      : existing +
                        assessment.spreadHistoryDomesticDocumentation;
                    assessment.riskAssessment.criteriaDocumentationDomesticSpread =
                      newstring;
                    assessment.spreadHistoryDomesticDocumentation = null;
                  }}
                >
                  {labels.transfer}
                </Xcomp.Button>
                <hr />
              </div>
            ) : null}
          </fieldset>
        ) : null}
        {config.showPageHeaders ? (
          <h3>{appState.kodeLabels.DistributionHistory.heading}</h3>
        ) : (
          <br />
        )}
      </div>
    );
  }
}
