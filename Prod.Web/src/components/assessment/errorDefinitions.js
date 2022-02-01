function getErrorDefinitions(assessment) {
    const a = assessment
    const r = assessment.riskAssessment
    const errorDefinitions = [{
            id: "(a)err1", 
            get cond() {return r.AOOtotalBest === 0},
            msg: "En selvstendig reproduserende art må ha et forekomstareal på minst 4_km²!"
        },
        {
            id: "(a)err2", 
            get cond() {return r.AOOtotalLow > r.AOOtotalBest},
            msg: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(a)err3", 
            get cond() {return r.AOOtotalHigh < r.AOOtotalBest},
            msg: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "(a)err4", 
            get cond() {return r.AOO50yrLow > r.AOO50yrBest},
            msg: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(a)err5", 
            get cond() {return r.AOO50yrHigh < r.AOO50yrBest},
            msg: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "(a)err6", 
            get cond() {return r.AOOtotalBest < r.AOOknown},
            msg: "Det beste anslaget på det totale nåværende forekomstarealet kan ikke være mindre enn det kjente!"
        },
        {
            id: "(b)err1", 
            get cond() {return r.occurrences1Low > r.occurrences1Best},
            msg: "Det nedre anslaget på antall forekomster kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(b)err2", 
            get cond() {return r.occurrences1High < r.occurrences1Best},
            msg: "Det øvre anslaget på antall forekomster kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "Aerr1", 
            get cond() {return r.ametodkey === "AmethodInvalid"},
            msg: "Metode for A-kriteriet er ikke valgt."
        },
        {
            id: "A3err1", 
            get cond() {return r.lifetimeLowerQ > r.medianLifetime},
            msg: "Levetidens nedre kvartil må være mindre enn medianen."
        },
        {
            id: "A3err2", 
            get cond() {return r.lifetimeUpperQ <= r.medianLifetime},
            msg: "Levetidens øvre kvartil må være større enn medianen."
        },
        {
            id: "Berr1", 
            get cond() {return (r.bmetodkey === "BmethodNotChosen" || r.bmetodkey === "B2bX") },
            msg: "Metode for B-kriteriet er ikke valgt."
        },
        {
            id: "B1err1", 
            get cond() {return r.expansionLowerQ > r.expansionSpeed},
            msg: "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen."
        },
        {
            id: "B1err2", 
            get cond() {return r.expansionUpperQ <= r.expansionSpeed},
            msg: "Ekspansjonshastighetens øvre kvartil må være større enn medianen."
        }
    ]
    return errorDefinitions
}
export default getErrorDefinitions
