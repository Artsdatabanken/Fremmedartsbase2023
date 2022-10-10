import { has } from "mobx"

function getErrorDefinitions(assessment, errorHelpers) {
    const a = assessment
    const r = assessment.riskAssessment
    const resolveid = errorHelpers.resolveid
    const isTrueteogsjeldnenaturtype = errorHelpers.isTrueteogsjeldnenaturtype
    const hasnum = (value) => !(value === null || isNaN(value))
    
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
            msg: "Etableringsklasse på fanen Artens Status er ikke valgt!"
        },
        {
            id: "(a)err1",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && a.productionSpecies != true && (hasnum(r.AOOtotalBestInput) && r.AOOtotalBestInput < 4)},
            msg: "En selvstendig reproduserende art må ha et forekomstareal på minst 4 km²!"
        },
        {
            id: "(a)err2",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOOtotalLowInput > r.AOOtotalBestInput)},
            msg: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(a)err3",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOOtotalHighInput < r.AOOtotalBestInput)},
            msg: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "(a)err4",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOO50yrLowInput > r.AOO50yrBestInput)},
            msg: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget!"
        },
        {
            id: "(a)err5",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOO50yrHighInput < r.AOO50yrBestInput)},
            msg: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget!"
        },
        {
            id: "(a)err6",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && !isNaN(r.AOOtotalBestInput) && (r.AOOtotalBestInput < r.AOOknownInput)},
            msg: "Det beste anslaget på det totale nåværende forekomstarealet kan ikke være mindre enn det kjente!"
        },
        {
            id: "(a)err7",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && !isNaN(r.AOO1) && (r.AOO1 < r.AOOknown1)},
            msg: "Estimatet kan ikke justeres til å være lavere enn kjent forekomstareal!"
            // for ">"  se: (a)warn2 
        },
        {
            id: "(a)err8",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && !isNaN(r.AOO2) &&(r.AOO2 < r.AOOknown2)},
            msg: "Estimatet kan ikke justeres til å være lavere enn kjent forekomstareal!"
            // for ">"  se: (a)warn3
        },
        {
            id: "(a)err9",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && (r.AOO1 != null) && (r.AOO1 <= 0)},
            msg: "Forekomstarealet kan ikke være 0!"
        },
        {
            id: "(a)err10",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && (r.AOO2 != null) && (r.AOO2 <= 0)},
            msg: "Forekomstarealet kan ikke være 0!"
        },
        {
            id: "(a)err11",
            get cond() {return a.doFullAssessment && !r.doorKnocker && hasnum(r.AOOknownInput) && ((r.AOOknownInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err12",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && hasnum(r.AOOtotalLowInput) && ((r.AOOtotalLowInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err13",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && hasnum(r.AOOtotalBestInput) && ((r.AOOtotalBestInput % 4) !== 0) },
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err14",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && hasnum(r.AOOtotalHighInput) && ((r.AOOtotalHighInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err15",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && hasnum(r.AOO50yrLowInput) && ((r.AOO50yrLowInput % 4) !== 0) },
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err16",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && hasnum(r.AOO50yrBestInput) && ((r.AOO50yrBestInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        {
            id: "(a)err17",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && hasnum(r.AOO50yrHighInput) && ((r.AOO50yrHighInput % 4) !== 0)},
            msg: "Forekomstarealene må være multippel av 4_km²!"
        },
        // {
        //     id: "(a)err666",
        //     get cond() {return !r.doorKnocker && ((r.AOOknownInput % 4) !== 0 || (r.AOOtotalLowInput % 4) !== 0 || (r.AOOtotalBestInput % 4) !== 0 || (r.AOOtotalHighInput % 4) !== 0 || (r.AOO50yrLowInput % 4) !== 0 || (r.AOO50yrBestInput % 4) !== 0 || (r.AOO50yrHighInput % 4) !== 0)},
        //     msg: "Forekomstarealet er ikke gyldig. Det må være delbart med 4 (forekomstareal = antall forekomster x 4 km²!"
        // },
        {
            id: "(a)err666",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (resolveid("(a)err11") || resolveid("(a)err12") || resolveid("(a)err13") || resolveid("(a)err14") || resolveid("(a)err15") || resolveid("(a)err16") || resolveid("(a)err17"))},
            msg: "Forekomstarealet er ikke gyldig. Det må være delbart med 4 (forekomstareal = antall forekomster x 4 km²)!"
        },
        {
            id: "(a)err18",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOOtotalLowInput > r.AOOtotalBestInput)},
            msg: "Lavt anslag kan ikke være større enn beste anslag!"
        },
        {
            id: "(a)err19",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOOtotalLowInput > r.AOOtotalHighInput)},
            msg: "Lavt anslag kan ikke være større enn høyt anslag!"
        },
        {
            id: "(a)err20",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOOtotalBestInput > r.AOOtotalHighInput)},
            msg: "Beste anslag kan ikke være større enn høyt anslag!"
        },
        // {
        //     id: "(a)err22", //Dette er en duplikat av "(a)err6"
        //     get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOOtotalBestInput < r.AOOknownInput)},
        //     msg: "Det beste anslaget på det totale nåværende forekomstarealet kan ikke være mindre enn det kjente!"
        // },
        {
            id: "(a)err23",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOO50yrLowInput > r.AOO50yrBestInput)},
            msg: "Lavt anslag kan ikke være større enn beste anslag!"
        },
        {
            id: "(a)err24",
            get cond() {return a.isAlienSpecies && !r.doorKnocker && (r.AOO50yrHighInput < r.AOO50yrBestInput)},
            msg: "Beste anslag kan ikke være større enn høyt anslag!"
        },
        {
            id: "(a)err25",
            get cond() {return a.doFullAssessment && a.isAlienSpecies && !r.doorKnocker && r.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" && (!hasnum(r.AOOtotalBestInput) || !hasnum(r.AOOtotalLowInput) || !hasnum(r.AOOtotalHighInput) || !hasnum(r.AOOtotalLowInput) || !hasnum(r.AOO50yrLowInput) || !hasnum(r.AOO50yrBestInput) || !hasnum(r.AOO50yrHighInput)) },
            msg: "Informasjon om forekomstareal må legges inn før metoden Forenklet anslag kan brukes på A-kriteriet"
        },
        {
            id: "(a)err27",
            get cond() {return a.doFullAssessment && r.doorKnocker && r.chosenSpreadMedanLifespan == "LifespanA1aSimplifiedEstimate" && (!hasnum(r.AOO10yrBest) || !hasnum(r.AOO10yrLow) || !hasnum(r.AOO10yrHigh)) },
            msg: "Informasjon om forekomstareal må legges inn før metoden Forenklet anslag kan brukes på A-kriteriet"
        },
        {
            id: "(a)err28", //egentlig en Artens status -error
            get cond() {return a.isAlienSpecies && a.productionSpecies == null},
            msg: "Spørsmål om arten er en bruksart må besvares på fanen Artens status"
        },
        {
            id: "(a)err29",
            get cond() {return a.doFullAssessment && a.isAlienSpecies && !r.doorKnocker && (!hasnum(r.AOOknownInput) || !hasnum(r.AOO50yrLowInput) || !hasnum(r.AOOtotalLowInput))},
            msg: "Informasjon om forekomstareal må angis før vurderingen kan ferdigstilles"
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
            msg: "Estimatet skal kun justeres om forekomster som er utgått pga. tiltak ble tatt ut av estimatet for kjent forekomstareal"
        },
        {
            id: "(a)warn3",
            get cond() {return a.doFullAssessment && (r.AOO2 > r.AOOknown2)},
            type: "warning",
            msg: "Estimatet skal kun justeres om forekomster som er utgått pga. tiltak ble tatt ut av estimatet for kjent forekomstareal"
        },
        {
            id: "(a)warn4",
            get cond() {return !r.doorKnocker &&  r.AOO50yrBestInput != null && (r.AOO50yrBestInput < r.AOOtotalBestInput)},
            type: "warning",
            msg: "Er det korrekt at det er forventet en nedgang i artens forekomstareal i løpet av de neste 50 år?"
        },
        {
            id: "(a)warn5",
            get cond() {return !r.doorKnocker && a.productionSpecies == true && (r.AOOtotalBestInput < 4 && r.AOOtotalBestInput != null)},
            type: "warning",
            msg: "Er det riktig at arten kun reproduserer i sitt eget produksjonsareal?"
        },
        {
            id: "(a)warn6",
            get cond() {return r.doorKnocker && a.terrestrial == true && a.limnic == false && (r.AOO10yrHigh > 365000)}, //Norges landareal = 365 123 km2
            type: "warning",
            msg: "Er det sannsynlig at arten kan kolonisere hele Norges landareal innen 10 år etter første introduksjon?"
        },
        {
            id: "(a)warn7",
            get cond() {return r.doorKnocker && a.terrestrial == true && a.limnic == false && (r.AOO10yrHigh > 33100 && r.AOO10yrHigh <= 365000)}, //Norges landareal = 365 123 km2
            type: "warning",
            msg: "Er det sannsynlig at arten kan ha et større forekomstareal enn hagelupin (33 100 km²) 10 år etter første introduksjon?"
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
            id: "(b)info1",
            get cond() {return a.assessmentConclusion == "AssessedSelfReproducing" && !isNaN(r.existenceAreaIn50Yr) && hasnum(r.AOO50yrBestInput) && r.existenceAreaIn50Yr != r.AOO50yrBestInput && (r.chosenSpreadYearlyIncrease == "a" || (r.chosenSpreadYearlyIncrease == "b" && r.AOOfirstOccurenceLessThan10Years != "no"))}, //&& !isEmpty(chosenSpreadYearlyIncrease) && (chosenSpreadYearlyIncrease == "a" || (chosenSpreadYearlyIncrease == "b" && AOOfirstOccurenceLessThan10Years == "yes"))
            type: "info",
            get msg() {return `Basert på det antatte forekomstarealet i dag på ${r.AOOtotalBest} km² og en ekspansjonshastighet på ${r.expansionSpeed} meter/år, beregnes forekomstarealet om 50 år å være ${r.existenceAreaIn50Yr} km². Under fanen Utbredelse i Norge er forekomstarealet om 50 år anslått til ${r.AOO50yrBestInput} km². Vurder om dette stemmer overens.`}
        },
        {
            id: "Aerr1",
            get cond() {return a.doFullAssessment && (r.ametodkey === "AmethodInvalid")},
            msg: "Metode for A-kriteriet er ikke valgt."
        },
        {
            id: "A3err1",
            get cond() {return a.doFullAssessment && r.ametodkey === "A3" && hasnum(r.lifetimeLowerQ) && hasnum(r.medianLifetime) && (r.lifetimeLowerQ > r.medianLifetime)},
            msg: "Levetidens nedre kvartil må være mindre enn medianen."
        },
        {
            id: "A3err2",
            get cond() {return a.doFullAssessment && r.ametodkey === "A3" && hasnum(r.lifetimeUpperQ) && hasnum(r.medianLifetime) && (r.lifetimeUpperQ <= r.medianLifetime)},
            msg: "Levetidens øvre kvartil må være større enn medianen."
        },
        {
            id: "Berr1",
            get cond() {return a.doFullAssessment && ((r.bmetodkey === "BmethodNotChosen") || (r.bmetodkey === "B2bX")) },
            msg: "Metode for B-kriteriet er ikke valgt."
        },
        {
            id: "B1err1",
            get cond() {return a.doFullAssessment && r.bmetodkey === "B1" && (r.expansionLowerQInput >= r.expansionSpeedInput) },
            msg: "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen."
        },
        {
            id: "B1err2",
            get cond() {return a.doFullAssessment && r.bmetodkey === "B1" && (r.expansionUpperQInput <= r.expansionSpeedInput) },
            msg: "Ekspansjonshastighetens øvre kvartil må være større enn medianen."
        },
        {
            id: "B2err1",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && (r.AOOyear1 != null) && (r.AOOyear2 != null) && (((r.AOOyear2 - r.AOOyear1) < 10 ) || ((r.AOOyear2 - r.AOOyear1) > 20 )) },
            msg: "Valgt periode (t2-t1) kan ikke overstige 20 år eller være mindre enn 10 år. Juster perioden."
        },
        {
            id: "B2err2",
            get cond() {return a.doFullAssessment && r.doorKnocker && r.bmetodkey === "B2b" && (!hasnum(r.AOO10yrBest) || !hasnum(r.AOO10yrLow) || !hasnum(r.AOO10yrHigh))},
            msg: "Informasjon om forekomstareal må legges inn før metoden Anslått økning i forekomstareal kan brukes på B-kriteriet"
        },
        {
            id: "B2err3",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && hasnum(r.AOOyear1) && !hasnum(r.AOO1)},
            get msg() {return "Kjent forekomstareal per år "+ r.AOOyear1 + " må angis"}
        },
        {
            id: "B2err4",
            get cond() {return a.doFullAssessment && (r.bmetodkey === "B2a1") && hasnum(r.AOOyear2) && !hasnum(r.AOO2)},
            get msg() {return "Kjent forekomstareal per år "+ r.AOOyear2 + " må angis"}
        },
        {
            id: "(nat)err1",
            get cond() {return a.doFullAssessment && a.impactedNatureTypes.length > 0 && a.impactedNatureTypes.some((nt) => isTrueteogsjeldnenaturtype(nt.niNCode)) },
            get msg() {return "Naturtypen " + a.impactedNatureTypes.find((nt) => isTrueteogsjeldnenaturtype(nt.niNCode)).name.toLowerCase() + " valgt fra NiN 2.3 er truet eller sjelden. Velg i stedet " + a.impactedNatureTypes.find((nt) => isTrueteogsjeldnenaturtype(nt.niNCode)).name.toLowerCase() + " fra Rødlista for naturtyper og slett rad med kode " + a.impactedNatureTypes.find((nt) => isTrueteogsjeldnenaturtype(nt.niNCode)).niNCode + "."}
        },
        {
            id: "(nat)err2",
            get cond() {return a.doFullAssessment && !a.limnic && !a.marine && !a.terrestrial},
            get msg() {return "Livsmiljø må angis under Artsinformasjon."}
        },
        // {
        //     id: "(nat)warn1",
        //     get cond() {return a.doFullAssessment && a.impactedNatureTypes.length > 0 && a.impactedNatureTypes.Redlisted !a.impactedNatureTypes.some((nt) => isTrueteogsjeldnenaturtype(nt.niNCode)) },
        //     type: "warning",
        //     get msg() {"Naturtypen valgt fra NiN 2.3 er truet eller sjelden. Velg tilsvarende naturtype fra Rødlista for naturtyper!"}
        // },
        {
            id: "Climateerr1",
            get cond() {return a.doFullAssessment && r.riskLevelCode != "NK" && (r.climateEffectsInvationpotential === null || r.climateEffectsEcoEffect === null)},
            msg: "Hvorvidt klimaendringer påvirker risikovurderingen må angis under fanen Klimaeffekter"
        },
        {
            id: "(sum)err1",
            get cond() {return assessment.categoryHasChangedFromPreviousAssessment && assessment.reasonForChangeOfCategory.length === 0 },
            msg: "Årsak til endring i kategori er ikke oppgitt."
        }
    ]
    return errorDefinitions
}
export default getErrorDefinitions
