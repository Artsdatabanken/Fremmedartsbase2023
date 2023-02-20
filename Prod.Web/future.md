# Fremtidige versjoner av applikasjonen

Dette dokumentet er skrevet i januar 2023 og er Helges betraktninger på videre utvikling av denne kodebasen

Ved neste liste, som trolig er Rødliste 2025 så skal det i prinsippet være mulig a erstatte /src/components/assessment med kildekoden fra /src/components/assessment fra RL2019.
Det skal bety at man har fått oppdatert kodebasen får rødlista med alt det nye (f.eks autentisering) fra FA 2023. 
I praksis må det helt sikkert i tillegg gjøres endringer for kartkomponenter.
RL 2019 hadde en del av navigasjonsloggikken liggende utenfor assessment-mappen så her må det gjøres en ryddejobb
Med litt justering vil bytte mellem RL og FA gå lettere for hver gang.

I forbindelse med at vi nå bruker nyeste versjon av Mobx kan det være behov for justering av noen bindinger, da ført og fremst for computed values, men det har også vært noen endringer i Mobx mht. transaksjoner som kan kreve mindre inngrep.

Oppdatter alle bibliotek til nyeste utgave. Erfaringsmessig vil det kunne kreve mindre tiltak i koden for å få ting til å fungere.

Et sterkt råd for å få en langlivet applikasjon er å mest mulig gå for mest mulig mainstream pakker i håp om at disse pakkene vil vedlikeholdes også i fremtiden. Vi har bevist prøvd å unngå komplekse pakker for CSS o.l. da disse typisk endres mye over tid.

