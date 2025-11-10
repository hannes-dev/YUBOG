const path = require('path');
const marked = require('marked');

const logDebug = (debugMsg) => {
    console.log(`%c[ManualParser]%c${debugMsg}`, "color: purple;");
};

async function parseManuals(module_list) {
    let parsedManuals = [];
    for (let module of module_list) {
        logDebug(`Loading ${module}`);

        parsedManuals.push(marked.parse(
                await getManual(module),
                {
                    gfm: true,
                }
            ).replaceAll(/<f>(.*)<\/f>/sg, "<p class='flavour-text'>$1</p>")
                .replaceAll(/<thead>\s*<tr>\s*<th>\s*<\/th>\s*<\/tr>\s*<\/thead>/gs, "")
        );
    }
    return parsedManuals;

}

async function getManual(module_location) {
    module_location = module_location.replace(/\/[^\/]*$/, "/manual.md")
    let response = await fetch(module_location);
    return response.text();
}


// Exports
let Parser = window.Parser || {};
Parser.parseManuals = parseManuals;
window.Parser = Parser;