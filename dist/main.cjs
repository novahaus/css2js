#!/usr/bin/env node 
var $8zHUo$process = require("process");
var $8zHUo$nodefspromises = require("node:fs/promises");
var $8zHUo$path = require("path");
var $8zHUo$commander = require("commander");
var $8zHUo$nodebuffer = require("node:buffer");
var $8zHUo$css = require("css");
var $8zHUo$lodash = require("lodash");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "main", () => $882b6d93070905b3$export$f22da7240b7add18);
/// <reference types="node" />






function $0f6a681c4346f47b$var$removeCommentDeclarations(declarations) {
    return declarations.filter((declaration)=>declaration.type === "declaration");
}
function $0f6a681c4346f47b$var$isCSSVariable(value) {
    return value.startsWith("--");
}
function $0f6a681c4346f47b$var$capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
function $0f6a681c4346f47b$var$getDeclarationKey(declarationProperty) {
    if ($0f6a681c4346f47b$var$isCSSVariable(declarationProperty)) return `-${$0f6a681c4346f47b$var$capitalize((0, $8zHUo$lodash.camelCase)(declarationProperty))}`;
    return (0, $8zHUo$lodash.camelCase)(declarationProperty);
}
function $0f6a681c4346f47b$var$saniziteDeclarationRule(value) {
    return value.trimEnd();
}
function $0f6a681c4346f47b$var$parseDeclarations(declarations) {
    const filteredDeclarations = $0f6a681c4346f47b$var$removeCommentDeclarations(declarations);
    return filteredDeclarations.reduce((acc, declaration)=>{
        if (!declaration.property || !declaration.value) return acc;
        const declarationProperty = $0f6a681c4346f47b$var$getDeclarationKey(declaration.property);
        const declarationValue = $0f6a681c4346f47b$var$saniziteDeclarationRule(declaration.value);
        acc[declarationProperty] = declarationValue;
        return acc;
    }, {});
}
function $0f6a681c4346f47b$var$parseRule(selectors, declarations, rules) {
    const key = selectors.join(",");
    if (rules[key]) {
        const rulesAtKey = rules[key];
        return {
            [key]: {
                ...rulesAtKey,
                ...$0f6a681c4346f47b$var$parseDeclarations(declarations)
            }
        };
    }
    return {
        [key]: $0f6a681c4346f47b$var$parseDeclarations(declarations)
    };
}
function $0f6a681c4346f47b$var$nestMediaQueryRules(mediaSelector, mediaRules, rules) {
    return Object.keys(mediaRules).reduce((acc, selector)=>{
        let currentRules = mediaRules[selector];
        const current = acc[selector];
        if (current && current[mediaSelector]) currentRules = Object.assign({}, current[mediaSelector], currentRules);
        acc[selector] = Object.assign({}, current, {
            [mediaSelector]: currentRules
        });
        return acc;
    }, rules);
}
function $0f6a681c4346f47b$var$parseNodes(nodes) {
    return nodes.reduce((acc, node)=>{
        if (node.type === "rule") {
            const rule = node;
            if (!rule.selectors || !rule.declarations) return acc;
            const parsedRule = $0f6a681c4346f47b$var$parseRule(rule.selectors, rule.declarations, acc);
            acc = {
                ...acc,
                ...parsedRule
            };
        }
        if (node.type === "font-face") {
            const rule = node;
            if (!rule.declarations) return acc;
            const parsedRule = $0f6a681c4346f47b$var$parseRule([
                "@font-face"
            ], rule.declarations, acc);
            acc = {
                ...acc,
                ...parsedRule
            };
        }
        if (node.type === "media") {
            const media = node;
            if (!media.rules) return acc;
            const mediaRules = $0f6a681c4346f47b$var$parseNodes(media.rules);
            const mediaSelector = `@media ${media.media}`;
            acc = $0f6a681c4346f47b$var$nestMediaQueryRules(mediaSelector, mediaRules, acc);
        }
        return acc;
    }, {});
}
function $0f6a681c4346f47b$export$98e6a39c04603d36(style) {
    var { stylesheet: stylesheet  } = (0, ($parcel$interopDefault($8zHUo$css))).parse(style);
    if (!stylesheet) return {};
    return $0f6a681c4346f47b$var$parseNodes(stylesheet.rules);
}



(0, $8zHUo$commander.program).version("1.0.0").description("A CLI form convert css to js").parse($8zHUo$process.argv);
(0, $8zHUo$commander.program).parse();
const [$882b6d93070905b3$var$entriesFile, $882b6d93070905b3$var$outputFile] = (0, $8zHUo$commander.program).args;
async function $882b6d93070905b3$var$getFileContent(pathFile) {
    try {
        const filePath = new URL((0, ($parcel$interopDefault($8zHUo$path))).resolve(pathFile), "file:///src/index.ts");
        const contents = await (0, $8zHUo$nodefspromises.readFile)(filePath, {
            encoding: "utf8"
        });
        return contents;
    } catch (err) {
        if (err instanceof Error) throw new Error(err.message);
    }
}
async function $882b6d93070905b3$var$writeJsFile(content, outputPath) {
    const controller = new AbortController();
    const { signal: signal  } = controller;
    const output = new Uint8Array((0, $8zHUo$nodebuffer.Buffer).from(`module.exports=${content}`));
    const file = (0, $8zHUo$nodefspromises.writeFile)((0, ($parcel$interopDefault($8zHUo$path))).resolve(outputPath), output, {
        signal: signal
    });
    await file;
}
async function $882b6d93070905b3$export$f22da7240b7add18(entriesFile, outputFile) {
    try {
        const code = await $882b6d93070905b3$var$getFileContent(entriesFile);
        if (!code) return;
        const parseContent = (0, $0f6a681c4346f47b$export$98e6a39c04603d36)(code);
        await $882b6d93070905b3$var$writeJsFile(JSON.stringify(parseContent), outputFile);
    } catch (err) {
        if (err instanceof Error) throw new Error(err.message);
    }
}
$882b6d93070905b3$export$f22da7240b7add18($882b6d93070905b3$var$entriesFile, !!$882b6d93070905b3$var$outputFile ? $882b6d93070905b3$var$outputFile : $882b6d93070905b3$var$entriesFile.replace(".css", ".js"));


//# sourceMappingURL=main.cjs.map
