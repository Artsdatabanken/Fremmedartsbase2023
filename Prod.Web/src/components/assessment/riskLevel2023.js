// Det som er tatt med her, er alle beregninger som skal gjøres på fanene for A- og B-kriteriet, samt de som skal gjøres på utbredelsesfanen, gitt at de påvirker A- og B-kriteriet. 

function round(num){return Math.round(num)}
function min(num1,num2){return Math.min(num1,num2)}
function max(num1,num2){return Math.max(num1,num2)}
function sqrt(num){return Math.sqrt(num)}
const pi = Math.PI
function roundToSignificantDecimals(num) {
    const result = 
        (num >= 9950000) ? round(num / 1000000) * 1000000 :
        (num >= 995000 ) ? round(num / 100000)  * 100000  :
        (num >= 99500  ) ? round(num / 10000)   * 10000   :
        (num >= 9950   ) ? round(num / 1000)    * 1000    :
        (num >= 995    ) ? round(num / 100)     * 100     :
        (num >= 100    ) ? round(num / 10)      * 10      :
        num 
    return result
}
function roundToSignificantDecimals2(num) {
    const result = 
        (num >= 99.5    ) ? round(num / 10)      * 10     :
        (num >= 9.95    ) ? round(num / 1)       * 1      :
        (num >= 2    ) ? round(num / 0.1)        * 0.1    :
        (num <  2    ) ? round(num / 0.01)       * 0.01   :
        num 
    return result
}



// Utbredelse i Norge 
// ********* (a) Forekomstareal – selvstendig reproduserende arter ***********

// // // Variabler som angis på fanen 
// // // bare variabler som er relevante for A- og B-kriteriet er tatt med her 
// // AOOknown	//integer	// kjent forekomstareal 
// // AOOtotalBest	//integer	// beste anslag på totalt forekomstareal nå 
// // AOOtotalLow	//integer	// lavt anslag på totalt forekomstareal nå 
// // AOOtotalHigh	//integer	// høyt anslag på totalt forekomstareal nå 
// ---------------------------------------------
// // // //    Fra FAB3:
// // // // CurrentExistenceArea
// // // // CurrentExistenceAreaMultiplier
// // // // CurrentExistenceAreaCalculated
// // // // CurrentExistenceAreaLowMultiplier
// // // // CurrentExistenceAreaLowCalculated
// // // // CurrentExistenceAreaHighMultiplier
// // // // CurrentExistenceAreaHighCalculated
// ----------------------------------------------

// // AOO50yrBest	//integer	// beste anslag på totalt forekomstareal om 50 år 
// // AOO50yrLow	//integer	// lavt anslag på totalt forekomstareal om 50 år 
// // AOO50yrHigh	//integer	// høyt anslag på totalt forekomstareal om 50 år 
// ---------------------------------------------
// // // //    Fra FAB3:
// // // // PotentialExistenceArea
// // // // PotentialExistenceAreaLowQuartile
// // // // PotentialExistenceAreaHighQuartile
// ---------------------------------------------


// // // Variabler som beregnes på fanen 
// // AOOdarkfigureBest	//double	// beste anslag på forekomstarealets mørketall 
// // AOOdarkfigureLow	//double	// lavt anslag på forekomstarealets mørketall 
// // AOOdarkfigureHigh	//double	// høyt anslag på forekomstareal mørketall 
// // // Beregninger 
const r = {}
const warnings = []
if (r.AOOtotalLow > r.AOOtotalBest) 
    return {error: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget."} 
if (r.AOOtotalHigh < r.AOOtotalBest) 
    return {error: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget."}
if (r.AOO50yrLow > r.AOO50yrBest) 
    return {error: "Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget."}
if (r.AOO50yrHigh < r.AOO50yrBest) 
    return {error: "Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget."}
if (r.AOOtotalLow == r.AOOknown) 
    warnings.push("Er det realistisk at det ikke eksisterer noen uoppdagede forekomster av arten?") 
if (r.AOOtotalLow < r.AOOknown) 
    warnings.push("Er det korrekt at artens totale nåværende forekomstareal kan være mindre enn det kjente?") 
if (AOO50yrBest < AOOtotalBest) 
    warnings.push("Er det korrekt at det er forventet en nedgang i artens forekomstareal i løpet av de neste 50&nbsp;år?") 

var AOOdarkfigureBest = r.AOOtotalBest / r.AOOknown 
var AOOdarkfigureLow = r.AOOtotalLow / r.AOOknown 
var AOOdarkfigureHigh = r.AOOtotalHigh / r.AOOknown


// *********************************************************
// ********** (b) Forekomstareal – dørstokkarter  **********
// *********************************************************
// // Variabler som angis på fanen 
// // bare variabler som er relevante for A- og B-kriteriet er tatt med her 
// // occurrences1Best	//integer	// beste anslag på antall forekomster fra 1 introduksjon 
// // occurrences1Low	//integer	// lavt anslag på antall forekomster fra 1 introduksjon 
// // occurrences1High	//integer	// høyt anslag på antall forekomster fra 1 introduksjon 
// // introductionsBest	//double	// beste anslag på antall introduksjoner i løpet av 10 år 

// // // // --------------------------------------------------
// // // //      fra FAB3:
// // // // SpreadYearlyIncreaseObservations
// // // // SpreadYearlyIncreaseObservationsLowerQuartile
// // // // SpreadYearlyIncreaseObservationsUpperQuartile
// // // // 
// // // // Er denne ny? - finner ikke i fab3: introductionsBest	//double	// beste anslag på antall introduksjoner i løpet av 10 år 
// // // // --------------------------------------------------

// // // Variabler som beregnes på fanen 
// // introductionsLow	//integer	// lavt anslag på antall introduksjoner i løpet av 10 år 
// // introductionsHigh	//integer	// høyt anslag på antall introduksjoner i løpet av 10 år 
// // AOO10yrBest	//integer	// beste anslag på totalt forekomstareal om 10 år  
// // AOO10yrLow	//integer	// lavt anslag på totalt forekomstareal om 10 år 
// // AOO10yrHigh	//integer	// høyt anslag på totalt forekomstareal om 10 år 
// Beregninger 
if (r.occurrences1Low > r.occurrences1Best) 
    return {error: "Det nedre anslaget på antall forekomster kan ikke være større enn det beste anslaget."}
if (r.occurrences1High < r.occurrences1Best) 
    return {error: "Det øvre anslaget på antall forekomster kan ikke være mindre enn det beste anslaget."}


const introLowTable = {
    1: 1,
    5: 2,
    13: 3,
    26: 4,
    43: 5,
    65: 6,
    91: 7,
    121: 8,
    156: 9,
    195: 10
}
const introHighTable = {
    1: 1,
    6: 2,
    15: 3,
    29: 4,
    47: 5,
    69: 6,
    96: 7,
    127: 8,
    163: 9,
    204: 10
}

function introductionNum(table, best) {
    const keys = Object.keys(table).reverse()
    var i = 0
    for(key of keys) {
        if(best >= key) {
            i = key
            break
        }
    }
    return i
}

const introductionsLowNum = introductionNum(introLowTable, r.introductionsBest)
const introductionsLow = introductionsLowNum == 0 ? 0 : round(r.introductionsBest) - introductionsLowNum

const introductionsHighNum = introductionNum(introHighTable, r.introductionsBest)
const introductionsHigh = introductionsHighNum == 0 ? 0 : round(r.introductionsBest) - introductionsHighNum


const AOO10yrBest = 4 * ((1 + r.occurrences1Best) * (1 + round(r.introductionsBest) / 2) - 1) 
const AOO10yrLow = 4 * ((1 + r.occurrences1Low) * (1 + introductionsLow / 2) - 1) 
const AOO10yrHigh = 4 * ((1 + r.occurrences1High) * (1 + introductionsHigh / 2) - 1) 



// ***********************************************************************
// ***********************************************************************
// **************************  A-kriteriet  ******************************
// ***********************************************************************
// ***********************************************************************

// // // Variabler som beregnes på fanen 
// // AOOchangeBest	//double	// beste anslag på endring i forek.areal i løpet av 50 år 
// // AOOchangeLow	//double	// lavt anslag på endring i forek.areal i løpet av 50 år 
// // AOOchangeHigh	//double	// høyt anslag på endring i forek.areal i løpet av 50 år 
// // adefaultBest	//integer	// forhåndsberegnet skår på A-kriteriet 
// // adefaultLow	//integer	// forhåndsberegnet nedre skår for A-kriteriet 
// // adefaultHigh	//integer	// forhåndsberegnet øvre skår for A-kriteriet 
// // apossibleLow	//integer	// laveste tillate skår ved endring av A 
// // apossibleHigh	//integer	// høyeste tillate skår ved endring av A 
// // lifetimeText	//string	// tekstlig beskrivelse av median levetid 
// // extinctionText	//string	// tekstlig beskrivelse av utdøingssannsynlighet 
// // amethod	//string	// metode som ble brukt for å beregne A-kriteriet 
// // medianLifetime	//integer	// artens mediane levetid i Norge i år 
// // ascore		//integer	// skår for A-kriteriet 
// // alow		//integer	// nedre skår for A-kriteriet (inkludert usikkerhet) 
// // ahigh		//integer	// øvre skår for A-kriteriet (inkludert usikkerhet) 



// // // De første 3 beregnes kun ved forenklet anslag for selvstendig reproduserende arter. 
// // // Metode 2 (num. est.) og 3 (leved.analyse) beregner/angir kun de 5 siste variablene. 

// **************************************************************************************************
// ******************  (A1a) Forenklet anslag – selvstendig reproduserende arter  *******************
// **************************************************************************************************
// // // Beregninger 

if(r.chosenSpreadMedanLifespan ==    "forenklet anslag"     ) { // todo: implement real
    amethod = "forekomstareal" 
    const AOOchangeBest = r.AOOtotalBest < 4 ? 1 : r.AOO50yrBest / r.AOOtotalBest 
    const AOOchangeLow = r.AOOtotalBest < 4 ? 1 : r.AOO50yrLow / r.AOOtotalBest 
    const AOOchangeHigh = r.AOOtotalBest >= 4 ? 1 : r.AOO50yrHigh / r.AOOtotalBest 

    var adefaultBest = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.AOO50yrBest < 4) adefaultBest = 1 
    if (r.AOO50yrBest >= 4) adefaultBest = 2 
    if (r.AOO50yrBest >= 8 && AOOchangeBest > 0.2) adefaultBest = 3 
    if (r.AOO50yrBest >= 20 && AOOchangeBest > 0.05) adefaultBest = 3 
    if (r.AOO50yrBest >= 20 && AOOchangeBest > 0.2) adefaultBest = 4 

    var adefaultLow = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.AOO50yrLow < 4) adefaultLow = max(1, adefaultBest - 1) 
    if (r.AOO50yrLow >= 4) adefaultLow = max(2, adefaultBest - 1) 
    if (r.AOO50yrLow >= 8 && AOOchangeLow > 0.2) adefaultLow = 3 
    if (r.AOO50yrLow >= 20 && AOOchangeLow > 0.05) adefaultLow = 3 
    if (r.AOO50yrLow >= 20 && AOOchangeLow > 0.2) adefaultLow = 4 

    var adefaultHigh = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.AOO50yrHigh < 4) adefaultHigh = 1 
    if (r.AOO50yrHigh >= 4) adefaultHigh = 2 
    if (r.AOO50yrHigh >= 8 && AOOchangeHigh > 0.2) adefaultHigh = min(3, adefaultBest + 1) 
    if (r.AOO50yrHigh >= 20 && AOOchangeHigh > 0.05) adefaultHigh = min(3, adefaultBest + 1) 
    if (r.AOO50yrHigh >= 20 && AOOchangeHigh > 0.2) adefaultHigh = min(4, adefaultBest + 1) 


    var lifetimeText = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    var extinctionText = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.adefaultBest == 1) {
        lifetimeText = "under 10&nbsp;år" 
        extinctionText = "over 97&nbsp;%" 
    }
    if (r.adefaultBest == 2) {
        lifetimeText = "mellom 10&nbsp;år og 60&nbsp;år" 
        extinctionText = "mellom 43&nbsp;% og 97&nbsp;%" 
    }
    if (r.adefaultBest == 3) {
        lifetimeText = "mellom 60&nbsp;år og 650&nbsp;år" 
        extinctionText = "mellom 5&nbsp;% og 43&nbsp;%" 
    }
    if (r.adefaultBest == 4) {
        lifetimeText = "over 650&nbsp;år" 
        extinctionText = "under 5&nbsp;%"
    }

    var apossibleLow = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    apossibleLow = 
        (r.AOO50yrBest > 80 && AOOchangeBest > 1) ? 4 :
        (r.AOO50yrBest >= 20 & AOOchangeBest > 0.2) ? 3 :
        (r.AOO50yrBest >= 4) ? 2 : 
        1

    var apossibleHigh = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    apossibleHigh =
        (r.AOO50yrBest < 4) ? 2 :
        (r.AOO50yrBest < 20 & AOOchangeBest <= 0.05) ? 3 : 
        4 

    // Utmating 
    const a1aresulttext = `Basert på de beste anslagene på forekomstareal i dag (${AOOtotalBest}&nbsp;km²) og om 50&nbsp;år (${AOO50yrBest}&nbsp;km²) er A-kriteriet forhåndsskåret som ${adefaultBest} (med usikkerhet: ${adefaultLow}–${adefaultHigh}). Dette innebærer at artens mediane levetid ligger ${lifetimeText}, eller at sannsynligheten for utdøing innen 50&nbsp;år er på ${extinctionText}.`

    // Resten av beregninga er avhengig av radioknappen som velges nedenfor teksten: 
    if( radio == "Godtar beregnet skår") { // todo: implement real
    amethod = "forekomstareal forenklet" 
    var ascore = adefaultBest 
    var alow = adefaultLow 
    var ahigh = adefaultHigh 
    var medianLifetime = 
        ascore === 1 ? 3 :
        ascore === 2 ? 25 :
        ascore === 3 ? 200 :
        ascore === 4 ? 2000 :
        NaN
    } else if (radio == "Ønsker å justere skår") { // todo: implement real
        amethod = "forekomstareal justert" 
        // "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
        // Valgbare bokser for beste anslag er skårene fra og med apossibleLow til og med apossibleHigh. 
        // Krysset i boksene bestemmer verdien til ascore (mellom 1 og 4). 
        // Valgbare bokser for usikkerhet er skårene fra og med max(1, ascore - 1) til og med min(4, ascore + 1). 
        // Det laveste krysset i boksene bestemmer verdien til alow (mellom 1 og 4). 
        // Det høyeste krysset i boksene bestemmer verdien til ahigh (mellom 1 og 4). 

        medianLifetime = // Samme som i "forekomstareal forenklet"!
            ascore === 1 ? 3 :
            ascore === 2 ? 25 :
            ascore === 3 ? 200 :
            ascore === 4 ? 2000 :
            NaN
    }
}


// ***************************************************************************************
// ******************  (A1b) Forenklet anslag – dørstokkarter  ***************************
// ***************************************************************************************
// Beregninger 
amethod = "introduksjonspress" 
if (AOO10yrBest < 1) adefaultBest = 1 
if (AOO10yrBest > 1) adefaultBest = 2 
if (AOO10yrBest > 4) adefaultBest = 3 
if (AOO10yrBest > 16) adefaultBest = 4 
if (AOO10yrLow < 1) adefaultLow = max(1, ascore - 1) 
if (AOO10yrLow > 1) adefaultLow = max(2, ascore - 1) 
if (AOO10yrLow > 4) adefaultLow = 3 
if (AOO10yrLow > 16) adefaultLow = 4 
if (AOO10yrHigh < 1) adefaultHigh = 1 
if (AOO10yrHigh > 1) adefaultHigh = 2 
if (AOO10yrHigh > 4) adefaultHigh = min(3, ascore + 1) 
if (AOO10yrHigh > 16) adefaultHigh = min(4, ascore + 1) 
if (adefaultBest == 1) lifetimeText = "under 10&nbsp;år" 
if (adefaultBest == 1) extinctionText = "over 97&nbsp;%" 
if (adefaultBest == 2) lifetimeText = "mellom 10&nbsp;år og 60&nbsp;år" 
if (adefaultBest == 2) extinctionText = "mellom 43&nbsp;% og 97&nbsp;%" 
if (adefaultBest == 3) lifetimeText = "mellom 60&nbsp;år og 650&nbsp;år" 
if (adefaultBest == 3) extinctionText = "mellom 5&nbsp;% og 43&nbsp;%" 
if (adefaultBest == 4) lifetimeText = "over 650&nbsp;år" 
if (adefaultBest == 4) extinctionText = "under 5&nbsp;%"
apossibleLow = 
    (AOO10yrBest >= 80) ? 4 :
    (AOO10yrBest >= 20) ? 3 :
    (AOO10yrBest >= 1) ? 2 :
    1
apossibleHigh =
    (AOO10yrBest < 4) ? 1 :
    4

// Utmating 
const aresulttext = `Basert på det beste anslaget på ${occurrences1Best} forekomster i løpet av 10&nbsp;år og ${introductionsBest} introduksjoner innen 50&nbsp;år er A-kriteriet forhåndsskåret som [adefaultBest] (med usikkerhet: [adefaultLow]–[adefaultHigh]). Dette innebærer at artens mediane levetid ligger [lifetimeText], eller at sannsynligheten for utdøing innen 50 år er på [extinctionText].`



// Resten av beregninga er avhengig av radioknappen som velges nedenfor teksten: 
if (radio === "Godtar beregnet skår") {//todo: replace with real
    amethod = "introduksjonspress forenklet" 
    // resten er identisk med det tilsvarende avsnittet for selvstendig reprod. arter 
    ascore = adefaultBest 
    alow = adefaultLow 
    ahigh = adefaultHigh 
    medianLifetime = // Samme som i "forekomstareal forenklet"!
        ascore === 1 ? 3 :
        ascore === 2 ? 25 :
        ascore === 3 ? 200 :
        ascore === 4 ? 2000 :
        NaN
} else if (radio === "Ønsker å justere skår") {//todo: replace with real
    amethod = "introduksjonspress justert" 

    // todo: implement score/usikkerhet thing. Beskrivelse under her
    // resten er identisk med det tilsvarende avsnittet for selvstendig reprod. arter 
    // "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
    // Valgbare bokser for beste anslag er skårene fra og med apossibleLow til og med apossibleHigh. 
    // Krysset i boksene bestemmer verdien til ascore (mellom 1 og 4). 
    // Valgbare bokser for usikkerhet er skårene fra og med max(1, ascore - 1) til og med min(4, ascore + 1). 
    // Det laveste krysset i boksene bestemmer verdien til alow (mellom 1 og 4). 
    // Det høyeste krysset i boksene bestemmer verdien til ahigh (mellom 1 og 4). 

    medianLifetime = // Samme som i "forekomstareal forenklet"!
        ascore === 1 ? 3 :
        ascore === 2 ? 25 :
        ascore === 3 ? 200 :
        ascore === 4 ? 2000 :
        NaN

}



// ************************************************************************************
// ****************************  (A2) Numerisk estimering  ****************************
// ************************************************************************************

// Variabler som angis på fanen 
// PopulationSize	//integer	// bestandens nåværende størrelse (individtall)     //todo: NB! Denne blir aldri anvendt!!
// GrowthRate	//double	// bestandens multiplikative vekstrate                  //todo: NB! Denne blir aldri anvendt!!
// EnvVariance	//double	// miljøvarians                                         //todo: NB! Denne blir aldri anvendt!!
// DemVariance	//double	// demografisk varians                                  //todo: NB! Denne blir aldri anvendt!!
// CarryingCapacity	//integer	// bestandens bæreevne (individtall)                //todo: NB! Denne blir aldri anvendt!!
// ExtinctionThreshold	//integer	// kvasiutdøingsterskel (individtall)           //todo: NB! Denne blir aldri anvendt!!
// medianLifetime	//integer	// artens mediane levetid i Norge i år 
// // // // ------------------------------------------------------------------------------------------
// // // //       Fra FAB3
// // // // SpreadRscriptSpeciesCount
// // // // SpreadRscriptPopulationGrowth
// // // // SpreadRscriptEnvironmantVariance
// // // // SpreadRscriptDemographicVariance
// // // // SpreadRscriptSustainabilityK
// // // // SpreadRscriptEstimatedSpeciesLongevity  (ActiveSpreadRscriptEstimatedSpeciesLongevity?)
// // // // ChosenSpreadMedanLifespan (?)
// // // // ------------------------------------------------------------------------------------------

// Angivelsen av fire variabler (fra EnvVariance til ExtinctionThreshold) er valgfritt. 
// Beregninger 
amethod = "numerisk estimering" 

ascore = 
    medianLifetime >= 650 ? 4 :
    medianLifetime >= 60 ? 3 :
    medianLifetime >= 10 ? 2 :
    medianLifetime < 10 ? 1 :
    NaN

// avrunding til to signifikante desimaler: 


medianLifetime = roundToSignificantDecimals(medianLifetime)

// "Skårtabellen" åpnes for avkrysning, men bare for usikkerhet, der ikke-valgbare bokser er grået ut. 
// Valgbare bokser for usikkerhet er skårene fra og med max(1, ascore - 1) til og med min(4, ascore + 1). 
// Det laveste krysset i usikkerhetsboksene bestemmer verdien til alow (mellom 1 og 4). 
// Det høyeste krysset i usikkerhetsboksene bestemmer verdien til ahigh (mellom 1 og 4). 
// (A3) Levedyktighetsanalyse 
// Variabler som angis på fanen 
// medianLifetime	//integer	// artens mediane levetid i Norge i år 
// LifetimeLowerQ	//integer	// nedre kvartil for artens levetid i Norge i år 
// LifetimeUpperQ	//integer	// øvre kvartil for artens levetid i Norge i år 
// Beregninger 
amethod = "levedyktighetsanalyse" 

if (r.LifetimeLowerQ > medianLifetime) 
    return {error: "Levetidens nedre kvartil må være mindre enn medianen."}
if (r.LifetimeUpperQ <= medianLifetime) 
    return {error: "Levetidens øvre kvartil må være større enn medianen."}

ascore = 
    medianLifetime >= 650 ? 4 :
    medianLifetime >= 60 ? 3 :
    medianLifetime >= 10 ? 2 :
    medianLifetime < 10 ? 1 :
    NaN

alow = 
    r.LifetimeLowerQ >= 650 ? 4 :
    r.LifetimeLowerQ >= 60 ? 3 :
    r.LifetimeLowerQ >= 10 ? max(2, ascore - 1)  :
    r.LifetimeLowerQ < 10 ? max(1, ascore - 1)  :
    NaN

ahigh = 
    r.LifetimeLowerQ >= 650 ? min(4, ascore + 1) :
    r.LifetimeLowerQ >= 60 ? min(3, ascore + 1) :
    r.LifetimeLowerQ >= 10 ? 2 :
    r.LifetimeLowerQ < 10 ? 1 :
    NaN

// avrunding til to signifikante desimaler: 
medianLifetime = roundToSignificantDecimals(medianLifetime)
r.LifetimeLowerQ = roundToSignificantDecimals(r.LifetimeLowerQ)  // todo: check! denne forandrer inputvariablen!?
r.LifetimeUpperQ = roundToSignificantDecimals(r.LifetimeUpperQ)  // todo: check! denne forandrer inputvariablen!?



// *************************************************************************
// *************************************************************************
// ***************************   B-kriteriet   *****************************
// *************************************************************************
// *************************************************************************

// Variabler som beregnes på fanen for alle arter (og uansett metode) 
var bmethod = null	//string	// metode som ble brukt for å beregne B-kriteriet 
// expansionSpeed	//integer	// ekspansjonshastighet i meter per år 
// bscore		//integer	// skår for B-kriteriet 
// blow		//integer	// nedre skår for B-kriteriet (inkludert usikkerhet) 
// bhigh		//integer	// øvre skår for B-kriteriet (inkludert usikkerhet) 


// ****************************************************************************************
// ****************************************************************************************
// ****************  (B1) Datasett med tid- og stedfestede observasjoner  *****************
// ****************************************************************************************
// ****************************************************************************************

// // Variabler som angis på fanen 
// expansionSpeed	//integer	// ekspansjonshastighet i meter per år 
// expansionLowerQ	//integer	// nedre kvartil for ekspansjonshastighet i meter per år 
// expansionUpperQ	//integer	// øvre kvartil for ekspansjonshastighet i meter per år 
// // // // --------------------------------------------------------------------------------
// // // //      fra FAB3
// // // // SpreadYearlyIncreaseCalculatedExpansionSpeed (SpreadYearlyIncreaseObservations?)
// // // // SpreadYearlyIncreaseOccurrenceAreaLowerQuartile (?)
// // // // SpreadYearlyIncreaseOccurrenceAreaUpperQuartile (?)
// // // // --------------------------------------------------------------------------------


// // Beregninger 

if (  "B1"   ) { // todo: implement real
    bmethod = "modellering" 
    // var bscore = NaN
    var bscore = 
        (r.expansionSpeed >= 500) ? 4 :
        (r.expansionSpeed >= 160) ? 3 :
        (r.expansionSpeed >= 50) ? 2 :
        (r.expansionSpeed < 50) ? 1 :
        NaN

    if (r.expansionLowerQ > r.expansionSpeed)
        return {error:  "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen."}
    if (r.expansionUpperQ <= r.expansionSpeed) 
        return {error: "Ekspansjonshastighetens øvre kvartil må være større enn medianen."}
    var blow =
        (r.expansionLowerQ >= 500) ? 4 :
        (r.expansionLowerQ >= 160) ? 3 :
        (r.expansionLowerQ >= 50) ? max(2, bscore - 1) :
        (r.expansionLowerQ < 50) ? max(1, bscore - 1) :
        NaN

    var bhigh =
        (r.expansionUpperQ >= 500) ? min(4, bscore + 1) :
        (r.expansionUpperQ >= 160) ? min(3, bscore + 1) :
        (r.expansionUpperQ >= 50) ? 2 :
        (r.expansionUpperQ < 50) ? 1 :
        NaN
    // avrunding til to signifikante desimaler: 
    r.expansionSpeed = roundToSignificantDecimals(r.expansionSpeed) // ???!
    r.expansionLowerQ = roundToSignificantDecimals(r.expansionLowerQ) // ???!
    r.expansionUpperQ = roundToSignificantDecimals(r.expansionUpperQ) // ???!
}

// ******************************************************************************************************
// ******************  (B2a) Økning i forekomstareal – selvstendig reproduserende arter  ****************
// ******************************************************************************************************
// Variabler som angis på fanen 
// AOOyear1	//integer	// årstallet for det første forekomstarealet 
// AOOyear2	//integer	// årstallet for det andre forekomstarealet 
// AAO1		//integer	// forekomstarealet i år 1                      //todo: NB! Denne blir aldri anvendt!!
// AAO2		//integer	// forekomstarealet i år 2                      //todo: NB! Denne blir aldri anvendt!!
// Beregninger 
bmethod = "forekomstareal" 
// avrunding til to signifikante desimaler: 
function roundToSignificantDecimals2(num) {   // todo: spør om grenseverdiene (100 vs 99.5, og 2(?))
    const result = 
        // (num >= 9950000) ? round(num / 1000000) * 1000000 :
        // (num >= 995000 ) ? round(num / 100000)  * 100000  :
        // (num >= 99500  ) ? round(num / 10000)   * 10000   :
        // (num >= 9950   ) ? round(num / 1000)    * 1000    :
        // (num >= 995    ) ? round(num / 100)     * 100     :
        // (num >= 100    ) ? round(num / 10)      * 10      :
        (num >= 99.5    ) ? round(num / 10)      * 10      :
        (num >= 9.95    ) ? round(num / 1)       * 1      :
        (num >= 2    ) ? round(num / 0.1)      * 0.1      :
        (num <  2    ) ? round(num / 0.01)      * 0.01      :
        num 
    return result
}
AOOdarkfigureBest = roundToSignificantDecimals2(AOOdarkfigureBest)
r.expansionSpeed = round(sqrt(AOOdarkfigureBest) * (sqrt(r.AOO2) - sqrt(r.AOO1)) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi))) 

bscore =
    (r.expansionSpeed >= 500) ? 4 :
    (r.expansionSpeed >= 160) ? 3 :
    (r.expansionSpeed >= 50) ? 2 :
    (r.expansionSpeed < 50) ? 1 :
    Nan

// avrunding til to signifikante desimaler: 

r.expansionSpeed = roundToSignificantDecimals(r.expansionSpeed)
round(expansionSpeed / 10) * 10 
// Utmating 
const b2aresulttext = `Ekspansjonshastigheten er beregnet til ${expansionSpeed}&nbsp;m/år basert på økningen i artens forekomstareal i perioden fra ${AOOyear1} til ${AOOyear2} og et mørketall på ${AOOdarkfigureBest}.`


// "Skårtabellen" åpnes for avkrysning, men bare for usikkerhet, der ikke-valgbare bokser er grået ut. 
// Valgbare bokser for usikkerhet er skårene fra og med max(1, bscore - 1) til og med min(4, bscore + 1). 
// Det laveste krysset i usikkerhetsboksene bestemmer verdien til blow (mellom 1 og 4). 
// Det høyeste krysset i usikkerhetsboksene bestemmer verdien til bhigh (mellom 1 og 4). 


// ***************************************************************************************************
// *********************  (B2b) Antatt økning i forekomstareal – dørstokkarter  **********************
// ***************************************************************************************************

// Variabler som beregnes på fanen 
// expansionLowerQ	//integer	// nedre kvartil for ekspansjonshastighet i meter per år 
// expansionUpperQ	//integer	// øvre kvartil for ekspansjonshastighet i meter per år 
// expansionText	//string	// tekstlig beskrivelse av ekspansjonshastighet 
// Beregninger 
bmethod = "introduksjonspress" 
r.expansionSpeed = round(200 * (sqrt(AOO10yrBest / 4) - 1) / sqrt(pi)) 
r.expansionLowerQ = round(200 * (sqrt(AOO10yrLow / 4) - 1) / sqrt(pi)) 
r.expansionUpperQ = round(200 * (sqrt(AOO10yrHigh / 4) - 1) / sqrt(pi)) 
bscore =
    (r.expansionSpeed >= 500) ? 4 :
    (r.expansionSpeed >= 160) ? 3 :
    (r.expansionSpeed >= 50) ? 2 :
    (r.expansionSpeed < 50) ? 1 :
    Nan

var blow =
    (r.expansionLowerQ >= 500) ? 4 :
    (r.expansionLowerQ >= 160) ? 3 :
    (r.expansionLowerQ >= 50) ? max(2, bscore - 1) :
    (r.expansionLowerQ < 50) ? max(1, bscore - 1) :
    NaN

var bhigh =  // todo: check with Hanno. his code sets blow here!! That must be wrong!!
    (r.expansionUpperQ >= 500) ? min(4, bscore + 1) :
    (r.expansionUpperQ >= 160) ? min(3, bscore + 1) :
    (r.expansionUpperQ >= 50) ? 2 :
    (r.expansionUpperQ < 50) ? 1 :
    NaN


const expansionText =
    bscore === 1 ? "under 50&nbsp;m/år" :
    bscore === 2 ? "mellom 50&nbsp;m/år og 160&nbsp;m/år"  :
    bscore === 3 ? "mellom 160&nbsp;m/år og 500&nbsp;m/år" :
    bscore === 4 ? "over 500&nbsp;m/år" :
    null
// avrunding til to signifikante desimaler: 
r.expansionSpeed = roundToSignificantDecimals(r.expansionSpeed)
// Utmating 
const b2bresulttext = `Basert på det beste anslaget på ${occurrences1Best} forekomster i løpet av 10&nbsp;år og ${introductionsBest} introduksjoner innen 50&nbsp;år er B-kriteriet skåret som ${bscore} (med usikkerhet: £{blow}–${bhigh}). Dette innebærer at artens ekspansjonshastighet ligger ${expansionText} (beste anslag: ${expansionSpeed}&nbsp;m/år).`
 