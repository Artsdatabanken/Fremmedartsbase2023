import { extendObservable, observable, autorun, toJS } from 'mobx'
import { loadData } from './apiService'
import { extractFloat } from '../utils'
import { codeLists } from "./codeLists";


export class ArtskartModel {
    constructor() {
        extendObservable(this, {
            utvalgsparametre: {
                fromMonth: 1,
                toMonth: 12,
                includeObjects: true,
                includeObservations: true,
                includeNorge: true,
                includeSvalbard: true
            },
            visArtskart: false,
            koder: [],
            fylker: [],
            expandedSpreadHistory: {},
            spredningshistorikkMal: {
                ObservationFromYear: "1950",
                ObservationYear: "2017",
                Comment: "",
                Location: "",
                Regions: "",
                RegionsAssumed: "",
                SpeciesCount: 0,
                ExistenceArea: 0,
                ExistenceAreaCount: 0,
                SpreadArea: 0,
                SpeciesCountDarkFigure: 1,
                ExistenceAreaDarkFigure: 1,
                ExistenceAreaCountDarkFigure: 1,
                SpreadAreaDarkFigure: 1,
                SpeciesCountCalculated: 0,
                ExistenceAreaCalculated: 0,
                ExistenceAreaCountCalculated: 0,
                SpreadAreaCalculated: 0,
                SelectionGeometry: '',
                Observations: {
                    "type": "FeatureCollection",
                    "features": []
                },
                mapurl: "",
                loadProgress: 3,
                RegionalPresence: codeLists.countyListLand.map(item => {
                    return { Navn: item.Navn, Tekst: item.Text, Id: item.Value, Known: false, Assumed: false }
                })
            }
        })

        // // todo: Burde slippe å laste denne to ganger...
        // loadData('api/kode', data => {
        //     // const grupper = data.Grupper
        //     const grupper = data.Children
        //     this.koder = grupper
        // })

        // autorun(() => {
        //     if (this.koder && this.koder.countyListLand) {
        //         this.spredningshistorikkMal.RegionalPresence = this
        //             .koder
        //             .countyListLand
        //             .map(item => {
        //                 return {Navn: item.Navn, Tekst: item.Text, Id: item.Value, Known: false, Assumed: false}
        //             })
        //     }
        // })
        autorun(() => {
            const h = this.expandedSpreadHistory;
            if (h)
                h.SpeciesCountCalculated = ArtskartModel.gangeDerTomMultiplierBetyr1(h.SpeciesCount, h.SpeciesCountDarkFigure)
        })
        autorun(() => {
            const h = this.expandedSpreadHistory;
            if (h) {
                //                if (!h.ExistenceArea) {
                h.ExistenceAreaCalculated = ArtskartModel.gangeDerTomMultiplierBetyr1(h.ExistenceArea, h.ExistenceAreaCountDarkFigure)
                h.ExistenceAreaCountCalculated = ArtskartModel.gangeDerTomMultiplierBetyr1(h.ExistenceArea, h.ExistenceAreaCountDarkFigure)
                h.SpreadAreaCalculated = ArtskartModel.gangeDerTomMultiplierBetyr1(h.SpreadArea, h.SpreadAreaDarkFigure)
                //              }
            }
        })
    }

    // static gangeDerTomMultiplierBetyr1(a, multiplier) {
    //     if (!a) 
    //         return null
    //     if (!multiplier || multiplier.length === 0) 
    //         return a
    //     return Math.round(a * multiplier)
    // }
    static gangeDerTomMultiplierBetyr1(a, multiplier) {
        const multi = !multiplier || multiplier.length === 0 ? 1 : multiplier
        const result = Math.round(extractFloat(a) * extractFloat(multi))
        return result ? result : ''
    }


    // api/listhelper/66319/areadata?bbox=-600001,6250000,1350000,9350000&width=600&
    // h eight=800&fromYear=1950&toYear=2015&type=all&region=all
    // listhelper/66319/countylist?bbox=-600001,6250000,1350000,9350000&width=600&he
    // i ght=800&fromYear=1950&toYear=2015&type=all&region=all
    hentFulltFylkeNavn(kortnavn) {
        if (!this.koder)
            return kortnavn
        if (!this.koder.countyListLand)
            return kortnavn
        for (let i = 0; i < this.koder.countyListLand.length; i++) {
            const referenceId = this.koder.countyListLand[i].Value
            if (referenceId === kortnavn)
                return this.koder.countyListLand[i].Text
        }
    }
    hentKortFylkeNavn(fylkenavn) {
        if (!this.koder)
            return fylkenavn
        if (!this.koder.countyListLand)
            return fylkenavn
        for (let i = 0; i < this.koder.countyListLand.length; i++) {
            const referenceId = this.koder.countyListLand[i].Text
            if (referenceId === fylkenavn)
                return this.koder.countyListLand[i].Value
        }
    }

    regionListe() {
        return this
            .koder
            .countyListLand
            .map((r) => {
                return { key: r.Value, title: r.Text }
            })
    }

    S4() {
        return (((1 + Math.random()) * 0x10000) | 0)
            .toString(16)
            .substring(1)
    }

    Guid() {
        return (`${this.S4() + this.S4()}-${this.S4()}-4${this.S4().substr(0, 3)}-${this.S4()}-${this.S4()}${this.S4()}${this.S4()}`).toLowerCase()
    }

    addSpreadHistory(vurdering) {
        const ny = toJS(this.spredningshistorikkMal)
        ny.Id = this.Guid()
        ny.Observations = this.emptyGeoJson
        ny.regionalPresenceKnown = this.enhanceRegionalPresence("")
        ny.regionalPresenceAssumed = this.enhanceRegionalPresence("")
        if (!vurdering.SpreadHistory)
            vurdering.SpreadHistory = []
        vurdering
            .SpreadHistory
            .push(ny)
        this.expandSpreadHistory(ny)
    }

    expandSpreadHistory(item) {
        if (this.expandedSpreadHistory == item) {
            this.expandedSpreadHistory = {}
            return
        }
        if (item.Observations === undefined)
            item.Observations = {
                "type": "FeatureCollection",
                "features": []
            }
        if (item.visArtskart === undefined)
            item.visArtskart = false
        this.expandedSpreadHistory = item
    }

    mapRegionalPresenceFromArtskart(data) {
        const r = []
        for (let i = 0; i < data.length; i++)
            if (data[i].Status > 0) {
                const kortnavn = this.hentKortFylkeNavn(data[i].NAVN)
                r.push(kortnavn)
            }
        return r.join(',')
    }

    enhanceRegionalPresence(regionalPresenceString) {
        if (regionalPresenceString === null)
            regionalPresenceString = ''
        const regionalPresence = regionalPresenceString
            .split(',')
            .map(x => x.trim())
        const regions = regionalPresence.reduce((acc, item) => {
            acc[item] = true
            return acc
        }, {})
        const regs = this
            .koder
            .countyListLand
            .reduce((acc, r) => {
                acc[r.Value] = regions[r.Value] === true
                return acc
            }, {})
        return observable((regs))
    }

    mapSpreadHistoryToUI(spreadHistory) {
        for (let i = 0; i < spreadHistory.length; i++) {
            const v = spreadHistory[i]
            //            if (v.SpreadAreaCalculated == 1 || !v.SpreadAreaCalculated)
            // v.SpreadAreaCalculated =
            // ArtskartModel.gangeDerTomMultiplierBetyr1(h.SpreadArea,
            // h.SpreadAreaDarkFigure)

            v.Observations = {
                "type": "FeatureCollection",
                "features": []
            }
            if (!v.SelectionGeometry)
                v.SelectionGeometry = ''

            v.regionalPresenceKnown = this.enhanceRegionalPresence(v.Regions)
            v.regionalPresenceAssumed = this.enhanceRegionalPresence(v.RegionsAssumed)
        }
    }
}
