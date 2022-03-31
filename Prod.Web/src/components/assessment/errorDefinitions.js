function getErrorDefinitions(assessment) {
    const a = assessment
    const r = assessment.riskAssessment
    
    
    // DOORKNOCKER
    // occurrences1Low
    // occurrences1Best
    // occurrences1High
    // introductionsLow
    // introductionsBest
    // introductionsHigh
    // AOO10yrLow
    // AOO10yrBest
    // AOO10yrHigh
    
    // REPRODUCING
    // AOOtotalLowInput
    // AOOtotalBestInput
    // AOOtotalHighInput
    // AOOdarkfigureLow
    // AOOdarkfigureBest
    // AOOdarkfigureHigh
    // AOO50yrLowInput
    // AOO50yrBestInput
    // AOO50yrHighInput
        

    const errorDefinitions = [
        {
            id: "Error1",
            get cond() {return a.alienSpeciesCategory === "NotDefined"},
            msg: "Overordnet kategori i Artens Status er ikke valgt!"
        },
        {
            id: "(a)err1",
            get cond() {return !r.doorKnocker && (r.AOOtotalBestInput < 4)},
            msg: "En selvstendig reproduserende art må ha et forekomstareal på minst 4_km²!"
        },
        {
            id: "(a)err2",
            get cond() {return !r.doorKnocker && (r.AOOtotalLowInput > r.AOOtotalBestInput)},
            msg: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(a)err3",
            get cond() {return !r.doorKnocker && (r.AOOtotalHighInput < r.AOOtotalBestInput)},
            msg: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "(a)err4",
            get cond() {return !r.doorKnocker && (r.AOO50yrLowInput > r.AOO50yrBestInput)},
            msg: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(a)err5",
            get cond() {return !r.doorKnocker && (r.AOO50yrHighInput < r.AOO50yrBestInput)},
            msg: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "(a)err6",
            get cond() {return !r.doorKnocker && (r.AOOtotalBestInput < r.AOOknownInput)},
            msg: "Estimatet kan ikke justeres til å være lavere enn kjent forekomstareal!"
        },
        {
            id: "(a)err7",
            get cond() {return a.doFullAssessment && (r.AOO1 < r.AOOknown1)},
            msg: "Det beste anslaget på det totale nåværende forekomstarealet kan ikke være mindre enn det kjente!"
            // for ">"  se: (a)warn2
        },
        {
            id: "(a)err8",
            get cond() {return a.doFullAssessment && (r.AOO2 < r.AOOknown2)},
            msg: "Det beste anslaget på det totale nåværende forekomstarealet kan ikke være mindre enn det kjente!"
            // for ">"  se: (a)warn3
        },
        {
            id: "(a)err9",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && (r.AOO1 <= 0)},
            msg: "Forekomstarealet kan ikke være 0!"
        },
        {
            id: "(a)err10",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && (r.AOO2 <= 0)},
            msg: "Forekomstarealet kan ikke være 0!"
        },
        {
            id: "(a)err11",
            get cond() {return a.doFullAssessment && !r.doorKnocker && ((r.AOOknownInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err666",
            get cond() {return !r.doorKnocker && ((r.AOOknownInput % 4) !== 0 || (r.AOOtotalLowInput % 4) !== 0 || (r.AOOtotalBestInput % 4) !== 0 || (r.AOOtotalHighInput % 4) !== 0 || (r.AOO50yrLowInput % 4) !== 0 || (r.AOO50yrBestInput % 4) !== 0 || (r.AOO50yrHighInput % 4) !== 0)},
            msg: "Forekomstarealet er ikke gyldig. Det må være delbart med 4 (forekomstareal = antall forekomster x 4 km²!"
        },
        {
            id: "(a)err12",
            get cond() {return !r.doorKnocker && ((r.AOOtotalLowInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err13",
            get cond() {return !r.doorKnocker && r.AOOtotalBestInput % 4 !== 0 },
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err14",
            get cond() {return !r.doorKnocker && ((r.AOOtotalHighInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err15",
            get cond() {return !r.doorKnocker && ((r.AOO50yrLowInput % 4) !== 0) },
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err16",
            get cond() {return !r.doorKnocker && ((r.AOO50yrBestInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err17",
            get cond() {return !r.doorKnocker && ((r.AOO50yrHighInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err18",
            get cond() {return !r.doorKnocker && (r.AOOtotalLowInput > r.AOOtotalBestInput)},
            msg: "Lavt anslag kan ikke være større enn beste anslag!"
        },
        {
            id: "(a)err19",
            get cond() {return !r.doorKnocker && (r.AOOtotalLowInput > r.AOOtotalHighInput)},
            msg: "Lavt anslag kan ikke være større enn høyt anslag!"
        },
        {
            id: "(a)err20",
            get cond() {return !r.doorKnocker && (r.AOOtotalBestInput > r.AOOtotalHighInput)},
            msg: "Beste anslag kan ikke være større enn høyt anslag!"
        },
        {
            id: "(a)err22",
            get cond() {return !r.doorKnocker && (r.AOOtotalBestInput < r.AOOknownInput)},
            msg: "Det beste anslaget på det totale nåværende forekomstarealet kan ikke være mindre enn det kjente!"
        },
        {
            id: "(a)err23",
            get cond() {return !r.doorKnocker && (r.AOO50yrLowInput > r.AOO50yrBestInput)},
            msg: "Lavt anslag kan ikke være større enn beste anslag!"
        },
        {
            id: "(a)err24",
            get cond() {return !r.doorKnocker && (r.AOO50yrHighInput < r.AOO50yrBestInput)},
            msg: "Beste anslag kan ikke være større enn høyt anslag!"
        },


        // {
        //     id: "(a)warn1",
        //     get cond() {return a.doFullAssessment && (!r.doorKnocker && (r.AOOknownInput % 4 || r.AOOtotalLowInput % 4 || r.AOOtotalBestInput % 4 || r.AOOtotalHighInput % 4 || r.AOO50yrLowInput % 4 || r.AOO50yrBestInput % 4 || r.AOO50yrHighInput % 4 || false))},
        //     type: "warning",
        //     msg: "MERK: Forekomstarealene vil bli avrundet oppover til nærmeste større multippel av 4_km²."
        // },
        {
            id: "(a)warn2",
            get cond() {return a.doFullAssessment && (r.AOO1 > r.AOOknown1)},
            type: "warning",
            msg: "MERK: Estimatet skal kun justeres om forekomster som er utgått pga. tiltak ble tatt ut av estimatet for kjent forekomstareal"
        },
        {
            id: "(a)warn3",
            get cond() {return a.doFullAssessment && (r.AOO2 > r.AOOknown2)},
            type: "warning",
            msg: "MERK: Estimatet skal kun justeres om forekomster som er utgått pga. tiltak ble tatt ut av estimatet for kjent forekomstareal"
        },
        {
            id: "(a)warn4",
            get cond() {return !r.doorKnocker && (r.AOO50yrBestInput < r.AOOtotalBestInput)},
            type: "warning",
            msg: "MERK: Er det korrekt at det er forventet en nedgang i artens forekomstareal i løpet av de neste 50 år?"
        },


        {
            id: "(b)err1",
            get cond() {return r.doorKnocker && (r.occurrences1Low > r.occurrences1Best)},
            msg: "Det nedre anslaget på antall forekomster kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(b)err2",
            get cond() {return r.doorKnocker && (r.occurrences1High < r.occurrences1Best)},
            msg: "Det øvre anslaget på antall forekomster kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "Aerr1",
            get cond() {return a.doFullAssessment && (r.ametodkey === "AmethodInvalid")},
            msg: "Metode for A-kriteriet er ikke valgt."
        },
        {
            id: "A3err1",
            get cond() {return a.doFullAssessment && r.ametodkey === "A3" && (r.lifetimeLowerQ > r.medianLifetime)},
            msg: "Levetidens nedre kvartil må være mindre enn medianen."
        },
        {
            id: "A3err2",
            get cond() {return a.doFullAssessment && r.ametodkey === "A3" && (r.lifetimeUpperQ <= r.medianLifetime)},
            msg: "Levetidens øvre kvartil må være større enn medianen."
        },
        {
            id: "Berr1",
            get cond() {return a.doFullAssessment && ((r.bmetodkey === "BmethodNotChosen") || (r.bmetodkey === "B2bX")) },
            msg: "Metode for B-kriteriet er ikke valgt."
        },
        {
            id: "B1err1",
            get cond() {return a.doFullAssessment && (r.expansionLowerQ > r.expansionSpeed) },
            msg: "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen."
        },
        {
            id: "B1err2",
            get cond() {return a.doFullAssessment && (r.expansionUpperQ <= r.expansionSpeed) },
            msg: "Ekspansjonshastighetens øvre kvartil må være større enn medianen."
        },
        {
            id: "B2err1",
            get cond() {return a.doFullAssessment && (((r.AOOyear2 - r.AOOyear1) < 10 ) || ((r.AOOyear2 - r.AOOyear1) > 20 )) },
            msg: "Valgt periode (t2-t1) kan ikke overstige 20 år eller være mindre enn 10 år. Juster perioden."
        }
    ]
    return errorDefinitions
}
export default getErrorDefinitions
