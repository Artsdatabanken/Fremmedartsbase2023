﻿Scripter 
# Det som er tatt med her, er alle beregninger som skal gjøres på fanene for A- og B-kriteriet, samt de som skal gjøres på utbredelsesfanen, gitt at de påvirker A- og B-kriteriet. 
Utbredelse i Norge 
(a) Forekomstareal – selvstendig reproduserende arter 
# Variabler som angis på fanen 
# bare variabler som er relevante for A- og B-kriteriet er tatt med her 
AOOknown	#integer	# kjent forekomstareal 
AOOtotalBest	#integer	# beste anslag på totalt forekomstareal nå 
AOOtotalLow	#integer	# lavt anslag på totalt forekomstareal nå 
AOOtotalHigh	#integer	# høyt anslag på totalt forekomstareal nå 
AOO50yrBest	#integer	# beste anslag på totalt forekomstareal om 50 år 
AOO50yrLow	#integer	# lavt anslag på totalt forekomstareal om 50 år 
AOO50yrHigh	#integer	# høyt anslag på totalt forekomstareal om 50 år 
# Variabler som beregnes på fanen 
AOOdarkfigureBest	#double	# beste anslag på forekomstarealets mørketall 
AOOdarkfigureLow	#double	# lavt anslag på forekomstarealets mørketall 
AOOdarkfigureHigh	#double	# høyt anslag på forekomstareal mørketall 
# Beregninger 
if (AOOtotalLow > AOOtotalBest) FEILMELDING ("Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget.") 
if (AOOtotalHigh < AOOtotalBest) FEILMELDING ("Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget.") 
if (AOO50yrLow > AOO50yrBest) FEILMELDING ("Det nedre anslaget på forekomstarealet kan ikke være større enn det beste anslaget.") 
if (AOO50yrHigh < AOO50yrBest) FEILMELDING ("Det øvre anslaget på forekomstarealet kan ikke være mindre enn det beste anslaget.") 
if (AOOtotalLow == AOOknown) ADVARSEL ("Er det realistisk at det ikke eksisterer noen uoppdagede forekomster av arten?") 
if (AOOtotalLow < AOOknown) ADVARSEL ("Er det korrekt at artens totale nåværende forekomstareal kan være mindre enn det kjente?") 
if (AOO50yrBest < AOOtotalBest) ADVARSEL ("Er det korrekt at det er forventet en nedgang i artens forekomstareal i løpet av de neste 50&nbsp;år?") 
AOOdarkfigureBest <- AOOtotalBest / AOOknown 
AOOdarkfigureLow <- AOOtotalLow / AOOknown 
AOOdarkfigureHigh <- AOOtotalHigh / AOOknown 
# alternativt, hvis det er teknisk mulig, var vi inne på tanken at det er valgfritt om man angir mørketall eller totalt forekomstareal, og at den variabelen som ikke angis, beregnes fra den som angis, samt det kjente forekomstarealet 
(b) Forekomstareal – dørstokkarter 
# Variabler som angis på fanen 
# bare variabler som er relevante for A- og B-kriteriet er tatt med her 
Occurrences1Best	#integer	# beste anslag på antall forekomster fra 1 introduksjon 
Occurrences1Low	#integer	# lavt anslag på antall forekomster fra 1 introduksjon 
Occurrences1High	#integer	# høyt anslag på antall forekomster fra 1 introduksjon 
IntroductionsBest	#double	# beste anslag på antall introduksjoner i løpet av 10 år 
# Variabler som beregnes på fanen 
IntroductionsLow	#integer	# lavt anslag på antall introduksjoner i løpet av 10 år 
IntroductionsHigh	#integer	# høyt anslag på antall introduksjoner i løpet av 10 år 
AOO10yrBest	#integer	# beste anslag på totalt forekomstareal om 10 år  
AOO10yrLow	#integer	# lavt anslag på totalt forekomstareal om 10 år 
AOO10yrHigh	#integer	# høyt anslag på totalt forekomstareal om 10 år 
# Beregninger 
if (Occurrences1Low > Occurrences1Best) FEILMELDING ("Det nedre anslaget på antall forekomster kan ikke være større enn det beste anslaget.") 
if (Occurrences1High < Occurrences1Best) FEILMELDING ("Det øvre anslaget på antall forekomster kan ikke være mindre enn det beste anslaget.") 
IntroductionsLow <- 0 
IntroductionsHigh <- 0 
if (IntroductionsBest > 0.25) IntroductionsHigh <- 1 
if (IntroductionsBest >= 1) IntroductionsLow <- round(IntroductionsBest) - 1 
if (IntroductionsBest >= 1) IntroductionsHigh <- round(IntroductionsBest) + 1 
if (IntroductionsBest >= 5) IntroductionsLow <- round(IntroductionsBest) - 2 
if (IntroductionsBest >= 6) IntroductionsHigh <- round(IntroductionsBest) + 2 
if (IntroductionsBest >= 13) IntroductionsLow <- round(IntroductionsBest) - 3 
if (IntroductionsBest >= 15) IntroductionsHigh <- round(IntroductionsBest) + 3 
if (IntroductionsBest >= 26) IntroductionsLow <- round(IntroductionsBest) - 4 
if (IntroductionsBest >= 29) IntroductionsHigh <- round(IntroductionsBest) + 4 
if (IntroductionsBest >= 43) IntroductionsLow <- round(IntroductionsBest) - 5 
if (IntroductionsBest >= 47) IntroductionsHigh <- round(IntroductionsBest) + 5 
if (IntroductionsBest >= 65) IntroductionsLow <- round(IntroductionsBest) - 6 
if (IntroductionsBest >= 69) IntroductionsHigh <- round(IntroductionsBest) + 6 
if (IntroductionsBest >= 91) IntroductionsLow <- round(IntroductionsBest) - 7 
if (IntroductionsBest >= 96) IntroductionsHigh <- round(IntroductionsBest) + 7 
if (IntroductionsBest >= 121) IntroductionsLow <- round(IntroductionsBest) - 8 
if (IntroductionsBest >= 127) IntroductionsHigh <- round(IntroductionsBest) + 8 
if (IntroductionsBest >= 156) IntroductionsLow <- round(IntroductionsBest) - 9 
if (IntroductionsBest >= 163) IntroductionsHigh <- round(IntroductionsBest) + 9 
if (IntroductionsBest >= 195) IntroductionsLow <- round(IntroductionsBest) - 10 
if (IntroductionsBest >= 204) IntroductionsHigh <- round(IntroductionsBest) + 10 
AOO10yrBest <- 4 * ((1 + Occurrences1Best) * (1 + round(IntroductionsBest) / 2) - 1) 
AOO10yrLow <- 4 * ((1 + Occurrences1Low) * (1 + IntroductionsLow / 2) - 1) 
AOO10yrHigh <- 4 * ((1 + Occurrences1High) * (1 + IntroductionsHigh / 2) - 1) 
A-kriteriet 
# Variabler som beregnes på fanen 
AOOchangeBest	#double	# beste anslag på endring i forek.areal i løpet av 50 år 
AOOchangeLow	#double	# lavt anslag på endring i forek.areal i løpet av 50 år 
AOOchangeHigh	#double	# høyt anslag på endring i forek.areal i løpet av 50 år 
AdefaultBest	#integer	# forhåndsberegnet skår på A-kriteriet 
AdefaultLow	#integer	# forhåndsberegnet nedre skår for A-kriteriet 
AdefaultHigh	#integer	# forhåndsberegnet øvre skår for A-kriteriet 
ApossibleLow	#integer	# laveste tillate skår ved endring av A 
ApossibleHigh	#integer	# høyeste tillate skår ved endring av A 
LifetimeText	#string	# tekstlig beskrivelse av median levetid 
ExtinctionText	#string	# tekstlig beskrivelse av utdøingssannsynlighet 
Amethod	#string	# metode som ble brukt for å beregne A-kriteriet 
MedianLifetime	#integer	# artens mediane levetid i Norge i år 
Ascore		#integer	# skår for A-kriteriet 
Alow		#integer	# nedre skår for A-kriteriet (inkludert usikkerhet) 
Ahigh		#integer	# øvre skår for A-kriteriet (inkludert usikkerhet) 
# De første 3 beregnes kun ved forenklet anslag for selvstendig reproduserende arter. 
# Metode 2 (num. est.) og 3 (leved.analyse) beregner/angir kun de 5 siste variablene. 
(A1a) Forenklet anslag – selvstendig reproduserende arter 
# Beregninger 
Amethod <- "forekomstareal" 
if (AOOtotalBest < 4) AOOchangeBest <- 1 
if (AOOtotalBest < 4) AOOchangeLow <- 1 
if (AOOtotalBest < 4) AOOchangeHigh <- 1 
if (AOOtotalBest >= 4) AOOchangeBest <- AOO50yrBest / AOOtotalBest 
if (AOOtotalBest >= 4) AOOchangeLow <- AOO50yrLow / AOOtotalBest 
if (AOOtotalBest >= 4) AOOchangeHigh <- AOO50yrHigh / AOOtotalBest 
if (AOO50yrBest < 4) AdefaultBest <- 1 
if (AOO50yrBest >= 4) AdefaultBest <- 2 
if (AOO50yrBest >= 8 & AOOchangeBest > 0.2) AdefaultBest <- 3 
if (AOO50yrBest >= 20 & AOOchangeBest > 0.05) AdefaultBest <- 3 
if (AOO50yrBest >= 20 & AOOchangeBest > 0.2) AdefaultBest <- 4 
if (AOO50yrLow < 4) AdefaultLow <- max(1, AdefaultBest - 1) 
if (AOO50yrLow >= 4) AdefaultLow <- max(2, AdefaultBest - 1) 
if (AOO50yrLow >= 8 & AOOchangeLow > 0.2) AdefaultLow <- 3 
if (AOO50yrLow >= 20 & AOOchangeLow > 0.05) AdefaultLow <- 3 
if (AOO50yrLow >= 20 & AOOchangeLow > 0.2) AdefaultLow <- 4 
if (AOO50yrHigh < 4) AdefaultHigh <- 1 
if (AOO50yrHigh >= 4) AdefaultHigh <- 2 
if (AOO50yrHigh >= 8 & AOOchangeHigh > 0.2) AdefaultHigh <- min(3, AdefaultBest + 1) 
if (AOO50yrHigh >= 20 & AOOchangeHigh > 0.05) AdefaultHigh <- min(3, AdefaultBest + 1) 
if (AOO50yrHigh >= 20 & AOOchangeHigh > 0.2) AdefaultHigh <- min(4, AdefaultBest + 1) 
if (AdefaultBest == 1) LifetimeText <- "under 10&nbsp;år" 
if (AdefaultBest == 1) ExtinctionText <- "over 97&nbsp;%" 
if (AdefaultBest == 2) LifetimeText <- "mellom 10&nbsp;år og 60&nbsp;år" 
if (AdefaultBest == 2) ExtinctionText <- "mellom 43&nbsp;% og 97&nbsp;%" 
if (AdefaultBest == 3) LifetimeText <- "mellom 60&nbsp;år og 650&nbsp;år" 
if (AdefaultBest == 3) ExtinctionText <- "mellom 5&nbsp;% og 43&nbsp;%" 
if (AdefaultBest == 4) LifetimeText <- "over 650&nbsp;år" 
if (AdefaultBest == 4) ExtinctionText <- "under 5&nbsp;%" 
ApossibleLow <- 1 
if (AOO50yrBest >= 4) ApossibleLow <- 2 
if (AOO50yrBest >= 20 & AOOchangeBest > 0.2) ApossibleLow <- 3 
if (AOO50yrBest > 80 & AOOchangeBest > 1) ApossibleLow <- 4 
ApossibleHigh <- 4 
if (AOO50yrBest < 20 & AOOchangeBest <= 0.05) ApossibleHigh <- 3 
if (AOO50yrBest < 4) ApossibleHigh <- 2 
# Utmating 
Basert på de beste anslagene på forekomstareal i dag ([AOOtotalBest]&nbsp;km²) og om 50&nbsp;år ([AOO50yrBest]&nbsp;km²) er A-kriteriet forhåndsskåret som [AdefaultBest] (med usikkerhet: [AdefaultLow]–[AdefaultHigh]). Dette innebærer at artens mediane levetid ligger [LifetimeText], eller at sannsynligheten for utdøing innen 50&nbsp;år er på [ExtinctionText]. 
# Resten av beregninga er avhengig av radioknappen som velges nedenfor teksten: 
# Hvis "Godtar beregnet skår" er valgt 
Amethod <- "forekomstareal forenklet" 
Ascore <- AdefaultBest 
Alow <- AdefaultLow 
Ahigh <- AdefaultHigh 
if (Ascore == 1) MedianLifetime <- 3 
if (Ascore == 2) MedianLifetime <- 25 
if (Ascore == 3) MedianLifetime <- 200 
if (Ascore == 4) MedianLifetime <- 2000 
# Hvis "Ønsker å justere skår" er valgt 
Amethod <- "forekomstareal justert" 
# "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
# Valgbare bokser for beste anslag er skårene fra og med ApossibleLow til og med ApossibleHigh. 
# Krysset i boksene bestemmer verdien til Ascore (mellom 1 og 4). 
# Valgbare bokser for usikkerhet er skårene fra og med max(1, Ascore - 1) til og med min(4, Ascore + 1). 
# Det laveste krysset i boksene bestemmer verdien til Alow (mellom 1 og 4). 
# Det høyeste krysset i boksene bestemmer verdien til Ahigh (mellom 1 og 4). 
if (Ascore == 1) MedianLifetime <- 3 
if (Ascore == 2) MedianLifetime <- 25 
if (Ascore == 3) MedianLifetime <- 200 
if (Ascore == 4) MedianLifetime <- 2000 
(A1b) Forenklet anslag – dørstokkarter 
# Beregninger 
Amethod <- "introduksjonspress" 
if (AOO10yrBest < 1) AdefaultBest <- 1 
if (AOO10yrBest > 1) AdefaultBest <- 2 
if (AOO10yrBest > 4) AdefaultBest <- 3 
if (AOO10yrBest > 16) AdefaultBest <- 4 
if (AOO10yrLow < 1) AdefaultLow <- max(1, Ascore - 1) 
if (AOO10yrLow > 1) AdefaultLow <- max(2, Ascore - 1) 
if (AOO10yrLow > 4) AdefaultLow <- 3 
if (AOO10yrLow > 16) AdefaultLow <- 4 
if (AOO10yrHigh < 1) AdefaultHigh <- 1 
if (AOO10yrHigh > 1) AdefaultHigh <- 2 
if (AOO10yrHigh > 4) AdefaultHigh <- min(3, Ascore + 1) 
if (AOO10yrHigh > 16) AdefaultHigh <- min(4, Ascore + 1) 
if (AdefaultBest == 1) LifetimeText <- "under 10&nbsp;år" 
if (AdefaultBest == 1) ExtinctionText <- "over 97&nbsp;%" 
if (AdefaultBest == 2) LifetimeText <- "mellom 10&nbsp;år og 60&nbsp;år" 
if (AdefaultBest == 2) ExtinctionText <- "mellom 43&nbsp;% og 97&nbsp;%" 
if (AdefaultBest == 3) LifetimeText <- "mellom 60&nbsp;år og 650&nbsp;år" 
if (AdefaultBest == 3) ExtinctionText <- "mellom 5&nbsp;% og 43&nbsp;%" 
if (AdefaultBest == 4) LifetimeText <- "over 650&nbsp;år" 
if (AdefaultBest == 4) ExtinctionText <- "under 5&nbsp;%" 
ApossibleLow <- 1 
if (AOO10yrBest >= 4) ApossibleLow <- 2 
if (AOO10yrBest >= 20) ApossibleLow <- 3 
if (AOO10yrBest >= 80) ApossibleLow <- 4 
ApossibleHigh <- 4 
if (AOO10yrBest < 4) ApossibleHigh <- 1 
# Utmating 
Basert på det beste anslaget på [Occurrences1Best] forekomster i løpet av 10&nbsp;år og [IntroductionsBest] introduksjoner innen 50&nbsp;år er A-kriteriet forhåndsskåret som [AdefaultBest] (med usikkerhet: [AdefaultLow]–[AdefaultHigh]). Dette innebærer at artens mediane levetid ligger [LifetimeText], eller at sannsynligheten for utdøing innen 50 år er på [ExtinctionText]. 
# Resten av beregninga er avhengig av radioknappen som velges nedenfor teksten: 
# Hvis "Godtar beregnet skår" er valgt 
Amethod <- "introduksjonspress forenklet" 
# resten er identisk med det tilsvarende avsnittet for selvstendig reprod. arter 
Ascore <- AdefaultBest 
Alow <- AdefaultLow 
Ahigh <- AdefaultHigh 
if (Ascore == 1) MedianLifetime <- 3 
if (Ascore == 2) MedianLifetime <- 25 
if (Ascore == 3) MedianLifetime <- 200 
if (Ascore == 4) MedianLifetime <- 2000 
# Hvis "Ønsker å justere skår" er valgt 
Amethod <- "introduksjonspress justert" 
# resten er identisk med det tilsvarende avsnittet for selvstendig reprod. arter 
# "Skårtabellen" åpnes for avkrysning, med ett mulig kryss for beste anslag og opptil tre kryss for usikkerhet, der ikke-valgbare bokser er grået ut. 
# Valgbare bokser for beste anslag er skårene fra og med ApossibleLow til og med ApossibleHigh. 
# Krysset i boksene bestemmer verdien til Ascore (mellom 1 og 4). 
# Valgbare bokser for usikkerhet er skårene fra og med max(1, Ascore - 1) til og med min(4, Ascore + 1). 
# Det laveste krysset i boksene bestemmer verdien til Alow (mellom 1 og 4). 
# Det høyeste krysset i boksene bestemmer verdien til Ahigh (mellom 1 og 4). 
if (Ascore == 1) MedianLifetime <- 3 
if (Ascore == 2) MedianLifetime <- 25 
if (Ascore == 3) MedianLifetime <- 200 
if (Ascore == 4) MedianLifetime <- 2000 
(A2) Numerisk estimering 
# Variabler som angis på fanen 
PopulationSize	#integer	# bestandens nåværende størrelse (individtall) 
GrowthRate	#double	# bestandens multiplikative vekstrate 
EnvVariance	#double	# miljøvarians 
DemVariance	#double	# demografisk varians 
CarryingCapacity	#integer	# bestandens bæreevne (individtall) 
ExtinctionThreshold	#integer	# kvasiutdøingsterskel (individtall) 
MedianLifetime	#integer	# artens mediane levetid i Norge i år 
# Angivelsen av fire variabler (fra EnvVariance til ExtinctionThreshold) er valgfritt. 
# Beregninger 
Amethod <- "numerisk estimering" 
if (MedianLifetime < 10) Ascore <- 1 
if (MedianLifetime >= 10) Ascore <- 2 
if (MedianLifetime >= 60) Ascore <- 3 
if (MedianLifetime >= 650) Ascore <- 4 
# avrunding til to signifikante desimaler: 
if (MedianLifetime >= 9950000) MedianLifetime <- round(MedianLifetime / 1000000) * 1000000 
if (MedianLifetime >= 995000) MedianLifetime <- round(MedianLifetime / 100000) * 100000 
if (MedianLifetime >= 99500) MedianLifetime <- round(MedianLifetime / 10000) * 10000 
if (MedianLifetime >= 9950) MedianLifetime <- round(MedianLifetime / 1000) * 1000 
if (MedianLifetime >= 995) MedianLifetime <- round(MedianLifetime / 100) * 100 
if (MedianLifetime >= 100) MedianLifetime <- round(MedianLifetime / 10) * 10 
# "Skårtabellen" åpnes for avkrysning, men bare for usikkerhet, der ikke-valgbare bokser er grået ut. 
# Valgbare bokser for usikkerhet er skårene fra og med max(1, Ascore - 1) til og med min(4, Ascore + 1). 
# Det laveste krysset i usikkerhetsboksene bestemmer verdien til Alow (mellom 1 og 4). 
# Det høyeste krysset i usikkerhetsboksene bestemmer verdien til Ahigh (mellom 1 og 4). 
(A3) Levedyktighetsanalyse 
# Variabler som angis på fanen 
MedianLifetime	#integer	# artens mediane levetid i Norge i år 
LifetimeLowerQ	#integer	# nedre kvartil for artens levetid i Norge i år 
LifetimeUpperQ	#integer	# øvre kvartil for artens levetid i Norge i år 
# Beregninger 
Amethod <- "levedyktighetsanalyse" 
if (LifetimeLowerQ > MedianLifetime) FEILMELDING ("Levetidens nedre kvartil må være mindre enn medianen.") 
if (LifetimeUpperQ <= MedianLifetime) FEILMELDING ("Levetidens øvre kvartil må være større enn medianen.") 
if (MedianLifetime < 10) Ascore <- 1 
if (MedianLifetime >= 10) Ascore <- 2 
if (MedianLifetime >= 60) Ascore <- 3 
if (MedianLifetime >= 650) Ascore <- 4 
if (LifetimeLowerQ < 10) Alow <- max(1, Ascore - 1) 
if (LifetimeLowerQ >= 10) Alow <- max(2, Ascore - 1) 
if (LifetimeLowerQ >= 60) Alow <- 3 
if (LifetimeLowerQ >= 650) Alow <- 4 
if (LifetimeUpperQ < 10) Ahigh <- 1 
if (LifetimeUpperQ >= 10) Ahigh <- 2 
if (LifetimeUpperQ >= 60) Ahigh <- min(3, Ascore + 1) 
if (LifetimeUpperQ >= 650) Ahigh <- min(4, Ascore + 1) 
# avrunding til to signifikante desimaler: 
if (MedianLifetime >= 9950000) MedianLifetime <- round(MedianLifetime / 1000000) * 1000000 
if (MedianLifetime >= 995000) MedianLifetime <- round(MedianLifetime / 100000) * 100000 
if (MedianLifetime >= 99500) MedianLifetime <- round(MedianLifetime / 10000) * 10000 
if (MedianLifetime >= 9950) MedianLifetime <- round(MedianLifetime / 1000) * 1000 
if (MedianLifetime >= 995) MedianLifetime <- round(MedianLifetime / 100) * 100 
if (MedianLifetime >= 100) MedianLifetime <- round(MedianLifetime / 10) * 10 
if (LifetimeLowerQ >= 9950000) LifetimeLowerQ <- round(LifetimeLowerQ / 1000000) * 1000000 
if (LifetimeLowerQ >= 995000) LifetimeLowerQ <- round(LifetimeLowerQ / 100000) * 100000 
if (LifetimeLowerQ >= 99500) LifetimeLowerQ <- round(LifetimeLowerQ / 10000) * 10000 
if (LifetimeLowerQ >= 9950) LifetimeLowerQ <- round(LifetimeLowerQ / 1000) * 1000 
if (LifetimeLowerQ >= 995) LifetimeLowerQ <- round(LifetimeLowerQ / 100) * 100 
if (LifetimeLowerQ >= 100) LifetimeLowerQ <- round(LifetimeLowerQ / 10) * 10 
if (LifetimeUpperQ >= 9950000) LifetimeUpperQ <- round(LifetimeUpperQ / 1000000) * 1000000 
if (LifetimeUpperQ >= 995000) LifetimeUpperQ <- round(LifetimeUpperQ / 100000) * 100000 
if (LifetimeUpperQ >= 99500) LifetimeUpperQ <- round(LifetimeUpperQ / 10000) * 10000 
if (LifetimeUpperQ >= 9950) LifetimeUpperQ <- round(LifetimeUpperQ / 1000) * 1000 
if (LifetimeUpperQ >= 995) LifetimeUpperQ <- round(LifetimeUpperQ / 100) * 100 
if (LifetimeUpperQ >= 100) LifetimeUpperQ <- round(LifetimeUpperQ / 10) * 10 
B-kriteriet 
# Variabler som beregnes på fanen for alle arter (og uansett metode) 
Bmethod	#string	# metode som ble brukt for å beregne B-kriteriet 
ExpansionSpeed	#integer	# ekspansjonshastighet i meter per år 
Bscore		#integer	# skår for B-kriteriet 
Blow		#integer	# nedre skår for B-kriteriet (inkludert usikkerhet) 
Bhigh		#integer	# øvre skår for B-kriteriet (inkludert usikkerhet) 
(B1) Datasett med tid- og stedfestede observasjoner 
# Variabler som angis på fanen 
ExpansionSpeed	#integer	# ekspansjonshastighet i meter per år 
ExpansionLowerQ	#integer	# nedre kvartil for ekspansjonshastighet i meter per år 
ExpansionUpperQ	#integer	# øvre kvartil for ekspansjonshastighet i meter per år 
# Beregninger 
Bmethod <- "modellering" 
if (ExpansionSpeed < 50) Bscore <- 1 
if (ExpansionSpeed >= 50) Bscore <- 2 
if (ExpansionSpeed >= 160) Bscore <- 3 
if (ExpansionSpeed >= 500) Bscore <- 4 
if (ExpansionLowerQ > ExpansionSpeed) FEILMELDING ("Ekspansjonshastighetens nedre kvartil må være mindre enn medianen.") 
if (ExpansionUpperQ <= ExpansionSpeed) FEILMELDING ("Ekspansjonshastighetens øvre kvartil må være større enn medianen.") 
if (ExpansionLowerQ < 50) Blow <- max(1, Bscore - 1) 
if (ExpansionLowerQ >= 50) Blow <- max(2, Bscore - 1) 
if (ExpansionLowerQ >= 160) Blow <- 3 
if (ExpansionLowerQ >= 500) Blow <- 4 
if (ExpansionUpperQ < 50) Bhigh <- 1 
if (ExpansionUpperQ >= 50) Bhigh <- 2 
if (ExpansionUpperQ >= 160) Bhigh <- min(3, Bscore + 1) 
if (ExpansionUpperQ >= 500) Bhigh <- min(4, Bscore + 1) 
# avrunding til to signifikante desimaler: 
if (ExpansionSpeed >= 9950) ExpansionSpeed <- round(ExpansionSpeed / 1000) * 1000 
if (ExpansionSpeed >= 995) ExpansionSpeed <- round(ExpansionSpeed / 100) * 100 
if (ExpansionSpeed > 100) ExpansionSpeed <- round(ExpansionSpeed / 10) * 10 
if (ExpansionLowerQ >= 9950) ExpansionLowerQ <- round(ExpansionLowerQ / 1000) * 1000 
if (ExpansionLowerQ >= 995) ExpansionLowerQ <- round(ExpansionLowerQ / 100) * 100 
if (ExpansionLowerQ > 100) ExpansionLowerQ <- round(ExpansionLowerQ / 10) * 10 
if (ExpansionUpperQ >= 9950) ExpansionUpperQ <- round(ExpansionUpperQ / 1000) * 1000 
if (ExpansionUpperQ >= 995) ExpansionUpperQ <- round(ExpansionUpperQ / 100) * 100 
if (ExpansionUpperQ > 100) ExpansionUpperQ <- round(ExpansionUpperQ / 10) * 10 
(B2a) Økning i forekomstareal – selvstendig reproduserende arter 
# Variabler som angis på fanen 
AOOyear1	#integer	# årstallet for det første forekomstarealet 
AOOyear2	#integer	# årstallet for det andre forekomstarealet 
AAO1		#integer	# forekomstarealet i år 1 
AAO2		#integer	# forekomstarealet i år 2 
# Beregninger 
Bmethod <- "forekomstareal" 
# avrunding til to signifikante desimaler: 
if (AOOdarkfigureBest >= 99.5) AOOdarkfigureBest <- round(AOOdarkfigureBest / 10) * 10 
if (AOOdarkfigureBest >= 9.95) AOOdarkfigureBest <- round(AOOdarkfigureBest) 
if (AOOdarkfigureBest > 2) AOOdarkfigureBest <- round(AOOdarkfigureBest * 10) / 10 
if (AOOdarkfigureBest < 2) AOOdarkfigureBest <- round(AOOdarkfigureBest * 100) / 100 
ExpansionSpeed <- round(sqrt(AOOdarkfigureBest) * (sqrt(AOO2) - sqrt(AOO1)) / ((AOOyear2 - AOOyear1) * sqrt(pi))) 
if (ExpansionSpeed < 50) Bscore <- 1 
if (ExpansionSpeed >= 50) Bscore <- 2 
if (ExpansionSpeed >= 160) Bscore <- 3 
if (ExpansionSpeed >= 500) Bscore <- 4 
# avrunding til to signifikante desimaler: 
if (ExpansionSpeed >= 9950) ExpansionSpeed <- round(ExpansionSpeed / 1000) * 1000 
if (ExpansionSpeed >= 995) ExpansionSpeed <- round(ExpansionSpeed / 100) * 100 
if (ExpansionSpeed >= 100) ExpansionSpeed <- round(ExpansionSpeed / 10) * 10 
# Utmating 
Ekspansjonshastigheten er beregnet til [ExpansionSpeed]&nbsp;m/år basert på økningen i artens forekomstareal i perioden fra [AOOyear1] til [AOOyear2] og et mørketall på [AOOdarkfigureBest]. 
# "Skårtabellen" åpnes for avkrysning, men bare for usikkerhet, der ikke-valgbare bokser er grået ut. 
# Valgbare bokser for usikkerhet er skårene fra og med max(1, Bscore - 1) til og med min(4, Bscore + 1). 
# Det laveste krysset i usikkerhetsboksene bestemmer verdien til Blow (mellom 1 og 4). 
# Det høyeste krysset i usikkerhetsboksene bestemmer verdien til Bhigh (mellom 1 og 4). 
(B2b) Antatt økning i forekomstareal – dørstokkarter 
# Variabler som beregnes på fanen 
ExpansionLowerQ	#integer	# nedre kvartil for ekspansjonshastighet i meter per år 
ExpansionUpperQ	#integer	# øvre kvartil for ekspansjonshastighet i meter per år 
ExpansionText	#string	# tekstlig beskrivelse av ekspansjonshastighet 
# Beregninger 
Bmethod <- "introduksjonspress" 
ExpansionSpeed <- round(200 * (sqrt(AOO10yrBest / 4) - 1) / sqrt(pi)) 
ExpansionLowerQ <- round(200 * (sqrt(AOO10yrLow / 4) - 1) / sqrt(pi)) 
ExpansionUpperQ <- round(200 * (sqrt(AOO10yrHigh / 4) - 1) / sqrt(pi)) 
if (ExpansionSpeed < 50) Bscore <- 1 
if (ExpansionSpeed >= 50) Bscore <- 2 
if (ExpansionSpeed >= 160) Bscore <- 3 
if (ExpansionSpeed >= 500) Bscore <- 4 
if (ExpansionLowerQ < 50) Blow <- max(1, Bscore - 1) 
if (ExpansionLowerQ >= 50) Blow <- max(2, Bscore - 1) 
if (ExpansionLowerQ >= 160) Blow <- 3 
if (ExpansionLowerQ >= 500) Blow <- 4 
if (ExpansionUpperQ < 50) Blow <- 1 
if (ExpansionUpperQ >= 50) Blow <- 2 
if (ExpansionUpperQ >= 160) Blow <- min(3, Bscore + 1) 
if (ExpansionUpperQ >= 500) Blow <- min(4, Bscore + 1) 
if (Bscore == 1) ExpansionText <- "under 50&nbsp;m/år" 
if (Bscore == 2) ExpansionText <- "mellom 50&nbsp;m/år og 160&nbsp;m/år" 
if (Bscore == 3) ExpansionText <- "mellom 160&nbsp;m/år og 500&nbsp;m/år" 
if (Bscore == 4) ExpansionText <- "over 500&nbsp;m/år" 
# avrunding til to signifikante desimaler: 
if (ExpansionSpeed >= 9950) ExpansionSpeed <- round(ExpansionSpeed / 1000) * 1000 
if (ExpansionSpeed >= 995) ExpansionSpeed <- round(ExpansionSpeed / 100) * 100 
if (ExpansionSpeed >= 100) ExpansionSpeed <- round(ExpansionSpeed / 10) * 10 
# Utmating 
Basert på det beste anslaget på [Occurrences1Best] forekomster i løpet av 10&nbsp;år og [IntroductionsBest] introduksjoner innen 50&nbsp;år er B-kriteriet skåret som [Bscore] (med usikkerhet: [Blow]–[Bhigh]). Dette innebærer at artens ekspansjonshastighet ligger [ExpansionText] (beste anslag: [ExpansionSpeed]&nbsp;m/år). 
 