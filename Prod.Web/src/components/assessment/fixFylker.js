import fylker from "../fylkesforekomst/fylker_2017"

export default function fixFylker(assessment) {
    // Fix missing fylker
    const fylkeNames = [];
    for (const key in fylker) {
        fylkeNames.push(key);
    }

    // remove unused fylker
    const unusedFylker = [];
    assessment.fylkesforekomster.forEach((f) => {
        const fylke = fylkeNames.find(name => name === f.fylke);
        if (!fylke) unusedFylker.push(f);
    });
    if (unusedFylker && unusedFylker.length > 0) {
        unusedFylker.forEach((f) => {
            const index = assessment.fylkesforekomster.indexOf(f);
            if (index > -1) {
                assessment.fylkesforekomster.splice(index, 1);
            }
        });
    }

    // add missing fylker
    const missingFylker = [];
    fylkeNames.forEach((name) => {
        const fylke = assessment.fylkesforekomster.find(f => f.fylke === name);
        if (!fylke) missingFylker.push(name);
    });
    missingFylker.forEach((name) => {
        assessment.fylkesforekomster.push({ fylke: name, state: 2 });
    })
    // assessment.fylkesforekomster.forEach((f) => console.log("Fylke", f.fylke, f.state));
}
