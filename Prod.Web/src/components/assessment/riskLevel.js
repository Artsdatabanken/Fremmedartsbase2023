const self = {
    categoryText : ['NK','LO','PH','HI','SE'],
    riskColors: ["#9ba963","#5ea4a1", "#185a6c", "#1b386f", "#5e3063" ],
    riskLevelMatrise: [ 
        // invasjonspotensiale -->
        [2,3,4,4], //        A
        [1,3,3,4], //        |
        [1,1,1,3], //        |
        [0,1,1,2]  // økologisk effekt
    ],
    invasjonspotensiale: (riskAssessment) => {
        // console.log("invasjonspotensiale:::: ")

        const critA = riskAssessment.critA
        const critB = riskAssessment.critB
        const critC = riskAssessment.critC
        // console.log("critA: " + JSON.stringify(critA))
        // console.log("critB: " + JSON.stringify(critB))
        // console.log("critC: " + JSON.stringify(critC))
        const a = critA.value;
        const b = critB.value;
        const c = critC.value;
        const abAdjustment = [ 
                // Crit B -->
                [0,1,1,2], //  Crit A
                [0,1,2,2], //    |
                [1,2,2,3], //    |
                [1,2,3,3], //    V
            ]
        // console.log("RISKLEVEL A B" + JSON.stringify(a) + JSON.stringify(b))
        const adjustedAB = abAdjustment[a][b]
        // console.log("AdjustedAB: " + a + " "  + b + " " + adjustedAB + abAdjustment[0][0])
        const adjustedA = Math.min(adjustedAB, a)
        const adjustedB = Math.min(adjustedAB, b)
        const level = Math.max(adjustedAB, c);
        const decisiveCrits = []
        const critAIsDecisive = adjustedA === level
        if (critAIsDecisive) {
            decisiveCrits.push(critA)
        }

        const critBIsDecisive = adjustedB === level
        if (critBIsDecisive) {
            decisiveCrits.push(critB)
        }
        const uncertaintiesAB = [];
        if (critAIsDecisive || critBIsDecisive) {
            const minUL_A = critA.uncertaintyValues.length === 0 ? a : Math.min(...critA.uncertaintyValues)
            const minUL_B = critB.uncertaintyValues.length === 0 ? b : Math.min(...critB.uncertaintyValues)
            const minUL_AB_adj = abAdjustment[minUL_A][minUL_B]
            const minUL_AB = Math.max(minUL_AB_adj, adjustedAB - 1 )
            const maxUL_A = critA.uncertaintyValues.length === 0 ? a : Math.max(...critA.uncertaintyValues)
            const maxUL_B = critB.uncertaintyValues.length === 0 ? b : Math.max(...critB.uncertaintyValues)
            const maxUL_AB_adj = abAdjustment[maxUL_A][maxUL_B]
            const maxUL_AB = Math.min(maxUL_AB_adj, adjustedAB + 1 )


            for (var i = minUL_AB; i <= maxUL_AB; i++) {
                uncertaintiesAB.push(i);
            }
            // console.log("AB - " + minUL_AB + " " + maxUL_AB + " " + JSON.stringify(uncertaintiesAB))
        }

        if (c === level) {
            decisiveCrits.push(critC)
        }
        const uncertaintiesC = c === level ? critC.uncertaintyValues : []
        const allUncertaintyLevels = [...new Set([...uncertaintiesAB,...uncertaintiesC])].sort()
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
        const result = {level: level, decisiveCriteria:decisiveCrits, uncertaintyLevels: sweepingUncertaintyLevels} // uncertaintyLevels }
        console.log("invationpot uncertanylevels  " + sweepingUncertaintyLevels    )
        return result;
    },
    ecoeffect: (riskAssessment) => {
        console.log("ecoeffect:::: ")
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
        console.log("ecoeffect uncertanylevels  " + sweepingUncertaintyLevels    )
        return result;
    },
    riskLevel: (invasjonspotensiale, ecoeffect) => {
        // console.log("riskLevel:::: ")
        // console.log("inv:" + JSON.stringify(invasjonspotensiale))
        // console.log("eco:" + JSON.stringify(ecoeffect))
        const lev = self.riskLevelMatrise[3 - ecoeffect.level][invasjonspotensiale.level]
        const invLetters = invasjonspotensiale.decisiveCriteria.map(crit => crit.criteriaLetter).join("")
        const invLetters2 = invasjonspotensiale.level === 0 ? "" : invLetters
        const ecoLetters = ecoeffect.decisiveCriteria.map(crit => crit.criteriaLetter).join("")
        const ecoLetters2 = ecoeffect.level === 0 ? "" : ecoLetters
        const decisiveCriteriaLabel = "" + (invasjonspotensiale.level + 1) +  invLetters2 + "," + (ecoeffect.level + 1) + ecoLetters2
        const result = {level: lev,   decisiveCriteriaLabel:decisiveCriteriaLabel}
        return result;
    },
    uncertaintyCategories: (riskLevel, invationpotentialUncertaintyLevels, ecoeffectUncertaintyLevels) => {
        // const categoryText = ['NK','LO','PH','HI','SE']
        // console.log(riskLevel.riskLevelMatrise);
        let usikkerhetskategorier = [];
        for (let index = 0; index < invationpotentialUncertaintyLevels.length; index++) {
            const invEl = invationpotentialUncertaintyLevels[index];
            for (let index = 0; index < ecoeffectUncertaintyLevels.length; index++) {
                const ecoEl = ecoeffectUncertaintyLevels[index];
                const newLocal = self.riskLevelMatrise[3 - ecoEl][invEl];
                if (newLocal != riskLevel)
                {
                    usikkerhetskategorier.push(newLocal);
                }
            }
        }
        usikkerhetskategorier=[...new Set(usikkerhetskategorier)]
        // console.log(usikkerhetskategorier);
        return usikkerhetskategorier.map(x=>self.categoryText[x]);
        // console.log(usikkerhetskategorierText);
    }


}

export default self