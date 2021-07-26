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
// // Occurrences1Best	//integer	// beste anslag på antall forekomster fra 1 introduksjon 
// // Occurrences1Low	//integer	// lavt anslag på antall forekomster fra 1 introduksjon 
// // Occurrences1High	//integer	// høyt anslag på antall forekomster fra 1 introduksjon 
// // IntroductionsBest	//double	// beste anslag på antall introduksjoner i løpet av 10 år 

// // // // --------------------------------------------------
// // // //      fra FAB3:
// // // // SpreadYearlyIncreaseObservations
// // // // SpreadYearlyIncreaseObservationsLowerQuartile
// // // // SpreadYearlyIncreaseObservationsUpperQuartile
// // // // 
// // // // Er denne ny? - finner ikke i fab3: IntroductionsBest	//double	// beste anslag på antall introduksjoner i løpet av 10 år 
// // // // --------------------------------------------------

// // // Variabler som beregnes på fanen 
// // IntroductionsLow	//integer	// lavt anslag på antall introduksjoner i løpet av 10 år 
// // IntroductionsHigh	//integer	// høyt anslag på antall introduksjoner i løpet av 10 år 
// // AOO10yrBest	//integer	// beste anslag på totalt forekomstareal om 10 år  
// // AOO10yrLow	//integer	// lavt anslag på totalt forekomstareal om 10 år 
// // AOO10yrHigh	//integer	// høyt anslag på totalt forekomstareal om 10 år 
// Beregninger 
if (r.Occurrences1Low > r.Occurrences1Best) 
    return {error: "Det nedre anslaget på antall forekomster kan ikke være større enn det beste anslaget."}
if (r.Occurrences1High < r.Occurrences1Best) 
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

const IntroductionsLowNum = introductionNum(introLowTable, r.IntroductionsBest)
const IntroductionsLow = IntroductionsLowNum == 0 ? 0 : round(r.IntroductionsBest) - IntroductionsLowNum

const IntroductionsHighNum = introductionNum(introHighTable, r.IntroductionsBest)
const IntroductionsHigh = IntroductionsHighNum == 0 ? 0 : round(r.IntroductionsBest) - IntroductionsHighNum


const AOO10yrBest = 4 * ((1 + r.Occurrences1Best) * (1 + round(r.IntroductionsBest) / 2) - 1) 
const AOO10yrLow = 4 * ((1 + r.Occurrences1Low) * (1 + IntroductionsLow / 2) - 1) 
const AOO10yrHigh = 4 * ((1 + r.Occurrences1High) * (1 + IntroductionsHigh / 2) - 1) 



// ***********************************************************************
// ***********************************************************************
// **************************  A-kriteriet  ******************************
// ***********************************************************************
// ***********************************************************************

// // // Variabler som beregnes på fanen 
// // AOOchangeBest	//double	// beste anslag på endring i forek.areal i løpet av 50 år 
// // AOOchangeLow	//double	// lavt anslag på endring i forek.areal i løpet av 50 år 
// // AOOchangeHigh	//double	// høyt anslag på endring i forek.areal i løpet av 50 år 
// // AdefaultBest	//integer	// forhåndsberegnet skår på A-kriteriet 
// // AdefaultLow	//integer	// forhåndsberegnet nedre skår for A-kriteriet 
// // AdefaultHigh	//integer	// forhåndsberegnet øvre skår for A-kriteriet 
// // ApossibleLow	//integer	// laveste tillate skår ved endring av A 
// // ApossibleHigh	//integer	// høyeste tillate skår ved endring av A 
// // LifetimeText	//string	// tekstlig beskrivelse av median levetid 
// // ExtinctionText	//string	// tekstlig beskrivelse av utdøingssannsynlighet 
// // Amethod	//string	// metode som ble brukt for å beregne A-kriteriet 
// // MedianLifetime	//integer	// artens mediane levetid i Norge i år 
// // Ascore		//integer	// skår for A-kriteriet 
// // Alow		//integer	// nedre skår for A-kriteriet (inkludert usikkerhet) 
// // Ahigh		//integer	// øvre skår for A-kriteriet (inkludert usikkerhet) 



// // // De første 3 beregnes kun ved forenklet anslag for selvstendig reproduserende arter. 
// // // Metode 2 (num. est.) og 3 (leved.analyse) beregner/angir kun de 5 siste variablene. 

// **************************************************************************************************
// ******************  (A1a) Forenklet anslag – selvstendig reproduserende arter  *******************
// **************************************************************************************************
// // // Beregninger 

if(r.chosenSpreadMedanLifespan ==    "forenklet anslag"     ) { // todo: implement real
    Amethod = "forekomstareal" 
    const AOOchangeBest = r.AOOtotalBest < 4 ? 1 : r.AOO50yrBest / r.AOOtotalBest 
    const AOOchangeLow = r.AOOtotalBest < 4 ? 1 : r.AOO50yrLow / r.AOOtotalBest 
    const AOOchangeHigh = r.AOOtotalBest >= 4 ? 1 : r.AOO50yrHigh / r.AOOtotalBest 

    var AdefaultBest = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.AOO50yrBest < 4) AdefaultBest = 1 
    if (r.AOO50yrBest >= 4) AdefaultBest = 2 
    if (r.AOO50yrBest >= 8 && AOOchangeBest > 0.2) AdefaultBest = 3 
    if (r.AOO50yrBest >= 20 && AOOchangeBest > 0.05) AdefaultBest = 3 
    if (r.AOO50yrBest >= 20 && AOOchangeBest > 0.2) AdefaultBest = 4 

    var AdefaultLow = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.AOO50yrLow < 4) AdefaultLow = max(1, AdefaultBest - 1) 
    if (r.AOO50yrLow >= 4) AdefaultLow = max(2, AdefaultBest - 1) 
    if (r.AOO50yrLow >= 8 && AOOchangeLow > 0.2) AdefaultLow = 3 
    if (r.AOO50yrLow >= 20 && AOOchangeLow > 0.05) AdefaultLow = 3 
    if (r.AOO50yrLow >= 20 && AOOchangeLow > 0.2) AdefaultLow = 4 

    var AdefaultHigh = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.AOO50yrHigh < 4) AdefaultHigh = 1 
    if (r.AOO50yrHigh >= 4) AdefaultHigh = 2 
    if (r.AOO50yrHigh >= 8 && AOOchangeHigh > 0.2) AdefaultHigh = min(3, AdefaultBest + 1) 
    if (r.AOO50yrHigh >= 20 && AOOchangeHigh > 0.05) AdefaultHigh = min(3, AdefaultBest + 1) 
    if (r.AOO50yrHigh >= 20 && AOOchangeHigh > 0.2) AdefaultHigh = min(4, AdefaultBest + 1) 


    var LifetimeText = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    var ExtinctionText = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    if (r.AdefaultBest == 1) {
        LifetimeText = "under 10&nbsp;år" 
        ExtinctionText = "over 97&nbsp;%" 
    }
    if (r.AdefaultBest == 2) {
        LifetimeText = "mellom 10&nbsp;år og 60&nbsp;år" 
        ExtinctionText = "mellom 43&nbsp;% og 97&nbsp;%" 
    }
    if (r.AdefaultBest == 3) {
        LifetimeText = "mellom 60&nbsp;år og 650&nbsp;år" 
        ExtinctionText = "mellom 5&nbsp;% og 43&nbsp;%" 
    }
    if (r.AdefaultBest == 4) {
        LifetimeText = "over 650&nbsp;år" 
        ExtinctionText = "under 5&nbsp;%"
    }

    var ApossibleLow = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    ApossibleLow = 
        (r.AOO50yrBest > 80 && AOOchangeBest > 1) ? 4 :
        (r.AOO50yrBest >= 20 & AOOchangeBest > 0.2) ? 3 :
        (r.AOO50yrBest >= 4) ? 2 : 
        1

    var ApossibleHigh = null // var: denne kan bli ovorskrevet under "introduksjonspress"
    ApossibleHigh =
        (r.AOO50yrBest < 4) ? 2 :
        (r.AOO50yrBest < 20 & AOOchangeBest <= 0.05) ? 3 : 
        4 

    // Utmating 
    const a1aresulttext = `Basert på de beste anslagene på forekomstareal i dag (${AOOtotalBest}&nbsp;km²) og om 50&nbsp;år (${AOO50yrBest}&nbsp;km²) er A-kriteriet forhåndsskåret som ${AdefaultBest} (med usikkerhet: ${AdefaultLow}–${AdefaultHigh}). Dette innebærer at artens mediane levetid ligger ${LifetimeText}, eller at sannsynligheten for utdøing innen 50&nbsp;år er på ${ExtinctionText}.`

    // Resten av beregninga er avhengig av radioknappen som velges nedenfor teksten: 
    if( radio == "Godtar beregnet skår") { // todo: implement real
    Amethod = "forekomstareal forenklet" 
    var Ascore = AdefaultBest 
    var Alow = AdefaultLow 
    var Ahigh = AdefaultHigh 
    var MedianLifetime = 
        Ascore === 1 ? 3 :
        Ascore === 2 ? 25 :
        Ascore === 3 ? 200 :
        Ascore === 4 ? 2000 :
        NaN
    } else if (radio == "Ønsker å justere skår") { // todo: implement real
        Amethod = "forekomstareal justert" 
        // "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
        // Valgbare bokser for beste anslag er skårene fra og med ApossibleLow til og med ApossibleHigh. 
        // Krysset i boksene bestemmer verdien til Ascore (mellom 1 og 4). 
        // Valgbare bokser for usikkerhet er skårene fra og med max(1, Ascore - 1) til og med min(4, Ascore + 1). 
        // Det laveste krysset i boksene bestemmer verdien til Alow (mellom 1 og 4). 
        // Det høyeste krysset i boksene bestemmer verdien til Ahigh (mellom 1 og 4). 

        MedianLifetime = // Samme som i "forekomstareal forenklet"!
            Ascore === 1 ? 3 :
            Ascore === 2 ? 25 :
            Ascore === 3 ? 200 :
            Ascore === 4 ? 2000 :
            NaN
    }
}


// ***************************************************************************************
// ******************  (A1b) Forenklet anslag – dørstokkarter  ***************************
// ***************************************************************************************
// Beregninger 
Amethod = "introduksjonspress" 
if (AOO10yrBest < 1) AdefaultBest = 1 
if (AOO10yrBest > 1) AdefaultBest = 2 
if (AOO10yrBest > 4) AdefaultBest = 3 
if (AOO10yrBest > 16) AdefaultBest = 4 
if (AOO10yrLow < 1) AdefaultLow = max(1, Ascore - 1) 
if (AOO10yrLow > 1) AdefaultLow = max(2, Ascore - 1) 
if (AOO10yrLow > 4) AdefaultLow = 3 
if (AOO10yrLow > 16) AdefaultLow = 4 
if (AOO10yrHigh < 1) AdefaultHigh = 1 
if (AOO10yrHigh > 1) AdefaultHigh = 2 
if (AOO10yrHigh > 4) AdefaultHigh = min(3, Ascore + 1) 
if (AOO10yrHigh > 16) AdefaultHigh = min(4, Ascore + 1) 
if (AdefaultBest == 1) LifetimeText = "under 10&nbsp;år" 
if (AdefaultBest == 1) ExtinctionText = "over 97&nbsp;%" 
if (AdefaultBest == 2) LifetimeText = "mellom 10&nbsp;år og 60&nbsp;år" 
if (AdefaultBest == 2) ExtinctionText = "mellom 43&nbsp;% og 97&nbsp;%" 
if (AdefaultBest == 3) LifetimeText = "mellom 60&nbsp;år og 650&nbsp;år" 
if (AdefaultBest == 3) ExtinctionText = "mellom 5&nbsp;% og 43&nbsp;%" 
if (AdefaultBest == 4) LifetimeText = "over 650&nbsp;år" 
if (AdefaultBest == 4) ExtinctionText = "under 5&nbsp;%"
ApossibleLow = 
    (AOO10yrBest >= 80) ? 4 :
    (AOO10yrBest >= 20) ? 3 :
    (AOO10yrBest >= 1) ? 2 :
    1
ApossibleHigh =
    (AOO10yrBest < 4) ? 1 :
    4

// Utmating 
const aresulttext = `Basert på det beste anslaget på ${Occurrences1Best} forekomster i løpet av 10&nbsp;år og ${IntroductionsBest} introduksjoner innen 50&nbsp;år er A-kriteriet forhåndsskåret som [AdefaultBest] (med usikkerhet: [AdefaultLow]–[AdefaultHigh]). Dette innebærer at artens mediane levetid ligger [LifetimeText], eller at sannsynligheten for utdøing innen 50 år er på [ExtinctionText].`



// Resten av beregninga er avhengig av radioknappen som velges nedenfor teksten: 
if (radio === "Godtar beregnet skår") {//todo: replace with real
    Amethod = "introduksjonspress forenklet" 
    // resten er identisk med det tilsvarende avsnittet for selvstendig reprod. arter 
    Ascore = AdefaultBest 
    Alow = AdefaultLow 
    Ahigh = AdefaultHigh 
    MedianLifetime = // Samme som i "forekomstareal forenklet"!
        Ascore === 1 ? 3 :
        Ascore === 2 ? 25 :
        Ascore === 3 ? 200 :
        Ascore === 4 ? 2000 :
        NaN
} else if (radio === "Ønsker å justere skår") {//todo: replace with real
    Amethod = "introduksjonspress justert" 

    // todo: implement score/usikkerhet thing. Beskrivelse under her
    // resten er identisk med det tilsvarende avsnittet for selvstendig reprod. arter 
    // "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
    // Valgbare bokser for beste anslag er skårene fra og med ApossibleLow til og med ApossibleHigh. 
    // Krysset i boksene bestemmer verdien til Ascore (mellom 1 og 4). 
    // Valgbare bokser for usikkerhet er skårene fra og med max(1, Ascore - 1) til og med min(4, Ascore + 1). 
    // Det laveste krysset i boksene bestemmer verdien til Alow (mellom 1 og 4). 
    // Det høyeste krysset i boksene bestemmer verdien til Ahigh (mellom 1 og 4). 

    MedianLifetime = // Samme som i "forekomstareal forenklet"!
        Ascore === 1 ? 3 :
        Ascore === 2 ? 25 :
        Ascore === 3 ? 200 :
        Ascore === 4 ? 2000 :
        NaN

}



// ************************************************************************************
// ****************************  (A2) Numerisk estimering  ****************************
// ************************************************************************************

// Variabler som angis på fanen 
// PopulationSize	//integer	// bestandens nåværende størrelse (individtall) 
// GrowthRate	//double	// bestandens multiplikative vekstrate 
// EnvVariance	//double	// miljøvarians 
// DemVariance	//double	// demografisk varians 
// CarryingCapacity	//integer	// bestandens bæreevne (individtall) 
// ExtinctionThreshold	//integer	// kvasiutdøingsterskel (individtall) 
// MedianLifetime	//integer	// artens mediane levetid i Norge i år 
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
Amethod = "numerisk estimering" 

Ascore = 
    MedianLifetime >= 650 ? 4 :
    MedianLifetime >= 60 ? 3 :
    MedianLifetime >= 10 ? 2 :
    MedianLifetime < 10 ? 1 :
    NaN

// avrunding til to signifikante desimaler: 


MedianLifetime = roundToSignificantDecimals(MedianLifetime)

// "Skårtabellen" åpnes for avkrysning, men bare for usikkerhet, der ikke-valgbare bokser er grået ut. 
// Valgbare bokser for usikkerhet er skårene fra og med max(1, Ascore - 1) til og med min(4, Ascore + 1). 
// Det laveste krysset i usikkerhetsboksene bestemmer verdien til Alow (mellom 1 og 4). 
// Det høyeste krysset i usikkerhetsboksene bestemmer verdien til Ahigh (mellom 1 og 4). 
// (A3) Levedyktighetsanalyse 
// Variabler som angis på fanen 
// MedianLifetime	//integer	// artens mediane levetid i Norge i år 
// LifetimeLowerQ	//integer	// nedre kvartil for artens levetid i Norge i år 
// LifetimeUpperQ	//integer	// øvre kvartil for artens levetid i Norge i år 
// Beregninger 
Amethod = "levedyktighetsanalyse" 

if (r.LifetimeLowerQ > MedianLifetime) 
    return {error: "Levetidens nedre kvartil må være mindre enn medianen."}
if (r.LifetimeUpperQ <= MedianLifetime) 
    return {error: "Levetidens øvre kvartil må være større enn medianen."}

Ascore = 
    MedianLifetime >= 650 ? 4 :
    MedianLifetime >= 60 ? 3 :
    MedianLifetime >= 10 ? 2 :
    MedianLifetime < 10 ? 1 :
    NaN

Alow = 
    r.LifetimeLowerQ >= 650 ? 4 :
    r.LifetimeLowerQ >= 60 ? 3 :
    r.LifetimeLowerQ >= 10 ? max(2, Ascore - 1)  :
    r.LifetimeLowerQ < 10 ? max(1, Ascore - 1)  :
    NaN

Ahigh = 
    r.LifetimeLowerQ >= 650 ? min(4, Ascore + 1) :
    r.LifetimeLowerQ >= 60 ? min(3, Ascore + 1) :
    r.LifetimeLowerQ >= 10 ? 2 :
    r.LifetimeLowerQ < 10 ? 1 :
    NaN

// avrunding til to signifikante desimaler: 
MedianLifetime = roundToSignificantDecimals(MedianLifetime)
r.LifetimeLowerQ = roundToSignificantDecimals(r.LifetimeLowerQ)  // todo: check! denne forandrer inputvariablen!?
r.LifetimeUpperQ = roundToSignificantDecimals(r.LifetimeUpperQ)  // todo: check! denne forandrer inputvariablen!?



// *************************************************************************
// *************************************************************************
// ***************************   B-kriteriet   *****************************
// *************************************************************************
// *************************************************************************

// Variabler som beregnes på fanen for alle arter (og uansett metode) 
var Bmethod = null	//string	// metode som ble brukt for å beregne B-kriteriet 
// ExpansionSpeed	//integer	// ekspansjonshastighet i meter per år 
// Bscore		//integer	// skår for B-kriteriet 
// Blow		//integer	// nedre skår for B-kriteriet (inkludert usikkerhet) 
// Bhigh		//integer	// øvre skår for B-kriteriet (inkludert usikkerhet) 


// ****************************************************************************************
// ****************************************************************************************
// ****************  (B1) Datasett med tid- og stedfestede observasjoner  *****************
// ****************************************************************************************
// ****************************************************************************************

// // Variabler som angis på fanen 
// ExpansionSpeed	//integer	// ekspansjonshastighet i meter per år 
// ExpansionLowerQ	//integer	// nedre kvartil for ekspansjonshastighet i meter per år 
// ExpansionUpperQ	//integer	// øvre kvartil for ekspansjonshastighet i meter per år 
// // // // --------------------------------------------------------------------------------
// // // //      fra FAB3
// // // // SpreadYearlyIncreaseCalculatedExpansionSpeed (SpreadYearlyIncreaseObservations?)
// // // // SpreadYearlyIncreaseOccurrenceAreaLowerQuartile (?)
// // // // SpreadYearlyIncreaseOccurrenceAreaUpperQuartile (?)
// // // // --------------------------------------------------------------------------------


// // Beregninger 

if (  "B1"   ) { // todo: implement real
    Bmethod = "modellering" 
    // var Bscore = NaN
    var Bscore = 
        (r.ExpansionSpeed >= 500) ? 4 :
        (r.ExpansionSpeed >= 160) ? 3 :
        (r.ExpansionSpeed >= 50) ? 2 :
        (r.ExpansionSpeed < 50) ? 1 :
        NaN

    if (r.ExpansionLowerQ > r.ExpansionSpeed)
        return {error:  "Ekspansjonshastighetens nedre kvartil må være mindre enn medianen."}
    if (r.ExpansionUpperQ <= r.ExpansionSpeed) 
        return {error: "Ekspansjonshastighetens øvre kvartil må være større enn medianen."}
    var Blow =
        (r.ExpansionLowerQ >= 500) ? 4 :
        (r.ExpansionLowerQ >= 160) ? 3 :
        (r.ExpansionLowerQ >= 50) ? max(2, Bscore - 1) :
        (r.ExpansionLowerQ < 50) ? max(1, Bscore - 1) :
        NaN

    var Bhigh =
        (r.ExpansionUpperQ >= 500) ? min(4, Bscore + 1) :
        (r.ExpansionUpperQ >= 160) ? min(3, Bscore + 1) :
        (r.ExpansionUpperQ >= 50) ? 2 :
        (r.ExpansionUpperQ < 50) ? 1 :
        NaN
    // avrunding til to signifikante desimaler: 
    r.ExpansionSpeed = roundToSignificantDecimals(r.ExpansionSpeed) // ???!
    r.ExpansionLowerQ = roundToSignificantDecimals(r.ExpansionLowerQ) // ???!
    r.ExpansionUpperQ = roundToSignificantDecimals(r.ExpansionUpperQ) // ???!
}

// ******************************************************************************************************
// ******************  (B2a) Økning i forekomstareal – selvstendig reproduserende arter  ****************
// ******************************************************************************************************
// Variabler som angis på fanen 
// AOOyear1	//integer	// årstallet for det første forekomstarealet 
// AOOyear2	//integer	// årstallet for det andre forekomstarealet 
// AAO1		//integer	// forekomstarealet i år 1 
// AAO2		//integer	// forekomstarealet i år 2 
// Beregninger 
Bmethod = "forekomstareal" 
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
r.ExpansionSpeed = round(sqrt(AOOdarkfigureBest) * (sqrt(r.AOO2) - sqrt(r.AOO1)) / ((r.AOOyear2 - r.AOOyear1) * sqrt(pi))) 

Bscore =
    (r.ExpansionSpeed >= 500) ? 4 :
    (r.ExpansionSpeed >= 160) ? 3 :
    (r.ExpansionSpeed >= 50) ? 2 :
    (r.ExpansionSpeed < 50) ? 1 :
    Nan

// avrunding til to signifikante desimaler: 

r.ExpansionSpeed = roundToSignificantDecimals(r.ExpansionSpeed)
round(ExpansionSpeed / 10) * 10 
// Utmating 
const b2aresulttext = `Ekspansjonshastigheten er beregnet til ${ExpansionSpeed}&nbsp;m/år basert på økningen i artens forekomstareal i perioden fra ${AOOyear1} til ${AOOyear2} og et mørketall på ${AOOdarkfigureBest}.`


// "Skårtabellen" åpnes for avkrysning, men bare for usikkerhet, der ikke-valgbare bokser er grået ut. 
// Valgbare bokser for usikkerhet er skårene fra og med max(1, Bscore - 1) til og med min(4, Bscore + 1). 
// Det laveste krysset i usikkerhetsboksene bestemmer verdien til Blow (mellom 1 og 4). 
// Det høyeste krysset i usikkerhetsboksene bestemmer verdien til Bhigh (mellom 1 og 4). 


// ***************************************************************************************************
// *********************  (B2b) Antatt økning i forekomstareal – dørstokkarter  **********************
// ***************************************************************************************************

// Variabler som beregnes på fanen 
// ExpansionLowerQ	//integer	// nedre kvartil for ekspansjonshastighet i meter per år 
// ExpansionUpperQ	//integer	// øvre kvartil for ekspansjonshastighet i meter per år 
// ExpansionText	//string	// tekstlig beskrivelse av ekspansjonshastighet 
// Beregninger 
Bmethod = "introduksjonspress" 
r.ExpansionSpeed = round(200 * (sqrt(AOO10yrBest / 4) - 1) / sqrt(pi)) 
r.ExpansionLowerQ = round(200 * (sqrt(AOO10yrLow / 4) - 1) / sqrt(pi)) 
r.ExpansionUpperQ = round(200 * (sqrt(AOO10yrHigh / 4) - 1) / sqrt(pi)) 
Bscore =
    (r.ExpansionSpeed >= 500) ? 4 :
    (r.ExpansionSpeed >= 160) ? 3 :
    (r.ExpansionSpeed >= 50) ? 2 :
    (r.ExpansionSpeed < 50) ? 1 :
    Nan

var Blow =
    (r.ExpansionLowerQ >= 500) ? 4 :
    (r.ExpansionLowerQ >= 160) ? 3 :
    (r.ExpansionLowerQ >= 50) ? max(2, Bscore - 1) :
    (r.ExpansionLowerQ < 50) ? max(1, Bscore - 1) :
    NaN

var Bhigh =  // todo: check with Hanno. his code sets Blow here!! That must be wrong!!
    (r.ExpansionUpperQ >= 500) ? min(4, Bscore + 1) :
    (r.ExpansionUpperQ >= 160) ? min(3, Bscore + 1) :
    (r.ExpansionUpperQ >= 50) ? 2 :
    (r.ExpansionUpperQ < 50) ? 1 :
    NaN


const ExpansionText =
    Bscore === 1 ? "under 50&nbsp;m/år" :
    Bscore === 2 ? "mellom 50&nbsp;m/år og 160&nbsp;m/år"  :
    Bscore === 3 ? "mellom 160&nbsp;m/år og 500&nbsp;m/år" :
    Bscore === 4 ? "over 500&nbsp;m/år" :
    null
// avrunding til to signifikante desimaler: 
r.ExpansionSpeed = roundToSignificantDecimals(r.ExpansionSpeed)
// Utmating 
const b2bresulttext = `Basert på det beste anslaget på ${Occurrences1Best} forekomster i løpet av 10&nbsp;år og ${IntroductionsBest} introduksjoner innen 50&nbsp;år er B-kriteriet skåret som ${Bscore} (med usikkerhet: £{Blow}–${Bhigh}). Dette innebærer at artens ekspansjonshastighet ligger ${ExpansionText} (beste anslag: ${ExpansionSpeed}&nbsp;m/år).`
 