const self = {
    riskColors: ["#9ba963","#5ea4a1", "#185a6c", "#1b386f", "#5e3063" ],
    riskLevelMatrise: [ 
        // invasjonspotensiale -->
        [2,3,4,4], //        A
        [1,3,3,4], //        |
        [1,1,1,3], //        |
        [0,1,1,2]  // økologisk effekt
    ],
    // riskLevelCode: [
    //     "NK",
    //     "LO",
    //     "PH",
    //     "HI",
    //     "SE"
    // ],
    // riskLevelText: [
    //     "Ingen kjent risiko",
    //     "Lav risiko",
    //     "Potensielt høy risiko",
    //     "Høy risiko",
    //     "Svært høy risiko"
    // ],
    invasjonspotensiale: (riskAssessment) => {
        const getCriterion = (riskAssessment, akse, letter) => {
            const result = riskAssessment.criteria.filter(c => c.akse === akse && c.criteriaLetter === letter)[0]; 
            return result;
        };        
        const aCrit = getCriterion(riskAssessment, 0, "A");
        const bCrit = getCriterion(riskAssessment, 0, "B");
        const cCrit = getCriterion(riskAssessment, 0, "C");

        console.log("aCrit: " + JSON.stringify(aCrit))
        console.log("bCrit: " + JSON.stringify(bCrit))
        console.log("cCrit: " + JSON.stringify(cCrit))



        const a = aCrit.value;
        const b = bCrit.value;
        const c = cCrit.value;


        // console.log("========a: " + JSON.stringify(aCrit))
        // console.log("========abc: " + a + " " + b + " " + c)


        const abAdjustment = [ 
                // Crit B -->
                [0,1,1,2], //  Crit A
                [0,1,2,2], //    |
                [1,2,2,3], //    |
                [1,2,3,3], //    V
            ]
        // const adjustedA = a === 0 ? 0 : a === 1 && b < 1 ? 0 : a === 1 ? 1 : a === 2 && b < 1 ? 1 : a === 2 ? 2 : a === 3 && b < 3 ? b + 1 : a === 3 ? 3 : NaN;
        // const adjustedB = b === 3 && a < 3 ? 2 : b === 3 ? 3 : b === 2 && a < 2 ? 1 : b === 2 ? 2 : b; 
        // const level = Math.max(adjustedA, adjustedB, c);
        const adjustedAB = abAdjustment[a][b]
        // console.log("AdjustedAB: " + a + " "  + b + " " + adjustedAB + abAdjustment[0][0])
        const adjustedA = Math.min(adjustedAB, a)
        const adjustedB = Math.min(adjustedAB, b)
        const level = Math.max(adjustedAB, c);
        const decisiveCrits = []
        //const uncertentyLevelsAB = []

        // console.log("#1")

        const critAIsDecisive = adjustedA === level
        if (critAIsDecisive) {
            decisiveCrits.push(aCrit)
        }
        // const uncertentyLevelsA = critAIsDecisive ?
        //     aCrit.uncertaintyValues.map(lev => lev + adjustedA - a).filter(lev => lev >= 0 && lev < 4) :
        //     []

        const critBIsDecisive = adjustedB === level
        if (critBIsDecisive) {
            decisiveCrits.push(bCrit)
        }
        // const uncertentyLevelsB = critBIsDecisive ?
        //     bCrit.uncertaintyValues.map(lev => lev + adjustedB - b).filter(lev => lev >= 0 && lev < 4) :
        //     []

        // console.log("#3")

        const uncertaintiesAB = [];
        if (critAIsDecisive || critBIsDecisive) {
            const minUL_A = aCrit.uncertaintyValues.length === 0 ? a : Math.min(...aCrit.uncertaintyValues)
            const minUL_B = bCrit.uncertaintyValues.length === 0 ? b : Math.min(...bCrit.uncertaintyValues)
            const minUL_AB_adj = abAdjustment[minUL_A][minUL_B]
            const minUL_AB = Math.max(minUL_AB_adj, adjustedAB - 1 )
            const maxUL_A = aCrit.uncertaintyValues.length === 0 ? a : Math.max(...aCrit.uncertaintyValues)
            const maxUL_B = bCrit.uncertaintyValues.length === 0 ? b : Math.max(...bCrit.uncertaintyValues)
            const maxUL_AB_adj = abAdjustment[maxUL_A][maxUL_B]
            const maxUL_AB = Math.min(maxUL_AB_adj, adjustedAB + 1 )


            for (var i = minUL_AB; i <= maxUL_AB; i++) {
                uncertaintiesAB.push(i);
            }
            // console.log("AB - " + minUL_AB + " " + maxUL_AB + " " + JSON.stringify(uncertaintiesAB))
        }

        // console.log("#4")

        // if (adjustedB === level) {
        //     decisiveCrits.push(bCrit)
        //     bCrit.uncertaintyValues.map(lev => lev + adjustedB - b).filter(lev => lev >= 0 && lev < 4).map(lev => alluncertentyLevels.push(lev))
        // }
        if (c === level) {
            decisiveCrits.push(cCrit)
            // cCrit.uncertaintyValues.map(lev => alluncertentyLevels.push(lev))
        }

        // console.log("#5")

        const uncertaintiesC = c === level ? cCrit.uncertaintyValues : []
        // console.log("#6")

        const allUncertaintyLevels = [...new Set([...uncertaintiesAB,...uncertaintiesC])].sort()
        // console.log("#7")
        // console.log("ABC - " + JSON.stringify(allUncertaintyLevels))



        // console.log("ucl:" + JSON.stringify(uncertaintyLevels))
        const decisiveUncertainties = []
        if (critAIsDecisive || critBIsDecisive) {
            decisiveUncertainties.push(uncertaintiesAB)
        }
        if (c === level) {
            decisiveUncertainties.push(uncertaintiesC)
        }
        // console.log("ABC decisiveUncertainties - " + JSON.stringify(decisiveUncertainties))

        const sweepingUncertaintyLevels = decisiveUncertainties.reduce((acc, uv) => acc.filter(n => n >= level || uv.indexOf(n) > -1), allUncertaintyLevels) 
        // console.log("#8")
        const result = {level: level, decisiveCriteria:decisiveCrits, uncertaintyLevels: sweepingUncertaintyLevels} // uncertaintyLevels }
        // console.log("#9")
        return result;
    },
    ecoeffect: (riskAssessment) => {
        const crits = riskAssessment.criteria.filter(c => c.akse === 1)
        const level = Math.max(...crits.map(crit => crit.value));
        const decisiveCrits = crits.filter(crit => crit.value === level)

        //console.log("level " + level   )
        //console.log("crits count " + crits.length    )
        //console.log("descrits count " + decisiveCrits.length    )
        //console.log("descrits " + JSON.stringify(decisiveCrits.map(crit => crit.uncertaintyValues.slice()) )   )
        //console.log("" + JSON.stringify(crits))

        const alluncertentyLevels = decisiveCrits.map(crit => crit.uncertaintyValues.slice()).reduce((a, b) => a.concat(b)) 
        const uncertaintyLevels = [...new Set(alluncertentyLevels)].sort()
        const sweepingUncertaintyLevels = decisiveCrits.reduce((acc, crit) => acc.filter(n => n >= level || crit.uncertaintyValues.indexOf(n) > -1), uncertaintyLevels) 
        const result = {level: level, decisiveCriteria:decisiveCrits, uncertaintyLevels: sweepingUncertaintyLevels} // uncertaintyLevels }
        return result;
    },
    riskLevel: (invasjonspotensiale, ecoeffect) => {
        const lev = self.riskLevelMatrise[3 - ecoeffect.level][invasjonspotensiale.level]
        // const code =  self.riskLevelCode[lev]
        // const text =  self.riskLevelText[lev]
        // const label = code + " - " + text
        const invLetters = invasjonspotensiale.decisiveCriteria.map(crit => crit.criteriaLetter).join("")
        const invLetters2 = invasjonspotensiale.level === 0 ? "" : invLetters
        const ecoLetters = ecoeffect.decisiveCriteria.map(crit => crit.criteriaLetter).join("")
        const ecoLetters2 = ecoeffect.level === 0 ? "" : ecoLetters
        const decisiveCriteriaLabel = "" + (invasjonspotensiale.level + 1) +  invLetters2 + "," + (ecoeffect.level + 1) + ecoLetters2
        // const result = {level: lev, code: code, text: text, label: label, decisiveCriteriaLabel:decisiveCriteriaLabel}
        const result = {level: lev,   decisiveCriteriaLabel:decisiveCriteriaLabel}
        return result;
    }
}

export default self