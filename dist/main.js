import {argv as $hgUW1$argv} from "process";
import {readFile as $hgUW1$readFile, writeFile as $hgUW1$writeFile} from "node:fs/promises";
import $hgUW1$path from "path";
import {program as $hgUW1$program} from "commander";
import {Buffer as $hgUW1$Buffer} from "node:buffer";
import $hgUW1$css from "css";
import {camelCase as $hgUW1$camelCase} from "lodash";

/// <reference types="node" />






function $a5221086de520fb0$var$removeCommentDeclarations(declarations) {
    return declarations.filter((declaration)=>declaration.type === "declaration");
}
function $a5221086de520fb0$var$isCSSVariable(value) {
    return value.startsWith("--");
}
function $a5221086de520fb0$var$hasVendorSpecificPrefix(value) {
    return !!value.match(/^[-_][a-z]/);
}
function $a5221086de520fb0$var$capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
function $a5221086de520fb0$var$getDeclarationKey(declarationProperty) {
    if ($a5221086de520fb0$var$isCSSVariable(declarationProperty)) return `-${$a5221086de520fb0$var$capitalize((0, $hgUW1$camelCase)(declarationProperty))}`;
    if ($a5221086de520fb0$var$hasVendorSpecificPrefix(declarationProperty)) return `${declarationProperty.startsWith("-") ? "-" : "_"}${(0, $hgUW1$camelCase)(declarationProperty)}`;
    return (0, $hgUW1$camelCase)(declarationProperty);
}
function $a5221086de520fb0$var$sanitizeDeclarationRule(value) {
    return value.trimEnd();
}
function $a5221086de520fb0$var$parseDeclarations(declarations) {
    const filteredDeclarations = $a5221086de520fb0$var$removeCommentDeclarations(declarations);
    return filteredDeclarations.reduce((acc, declaration)=>{
        if (!declaration.property || !declaration.value) return acc;
        const declarationProperty = $a5221086de520fb0$var$getDeclarationKey(declaration.property);
        const declarationValue = $a5221086de520fb0$var$sanitizeDeclarationRule(declaration.value);
        if (!!acc[declarationProperty]) {
            acc[declarationProperty] = [
                acc[declarationProperty],
                declarationValue
            ].flat();
            return acc;
        }
        acc[declarationProperty] = declarationValue;
        return acc;
    }, {});
}
function $a5221086de520fb0$var$parseRule(selectors, declarations, rules) {
    const key = selectors.join(",");
    if (rules[key]) {
        const rulesAtKey = rules[key];
        return {
            [key]: {
                ...rulesAtKey,
                ...$a5221086de520fb0$var$parseDeclarations(declarations)
            }
        };
    }
    return {
        [key]: $a5221086de520fb0$var$parseDeclarations(declarations)
    };
}
function $a5221086de520fb0$var$nestMediaQueryRules(mediaSelector, mediaRules, rules) {
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
function $a5221086de520fb0$var$parseNodes(nodes) {
    return nodes.reduce((acc, node)=>{
        if (node.type === "rule") {
            const rule = node;
            if (!rule.selectors || !rule.declarations) return acc;
            const parsedRule = $a5221086de520fb0$var$parseRule(rule.selectors, rule.declarations, acc);
            acc = {
                ...acc,
                ...parsedRule
            };
        }
        if (node.type === "font-face") {
            const rule = node;
            if (!rule.declarations) return acc;
            const parsedRule = $a5221086de520fb0$var$parseRule([
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
            const mediaRules = $a5221086de520fb0$var$parseNodes(media.rules);
            const mediaSelector = `@media ${media.media}`;
            acc = $a5221086de520fb0$var$nestMediaQueryRules(mediaSelector, mediaRules, acc);
        }
        return acc;
    }, {});
}
function $a5221086de520fb0$export$98e6a39c04603d36(style) {
    var { stylesheet: stylesheet  } = (0, $hgUW1$css).parse(style);
    if (!stylesheet) return {};
    return $a5221086de520fb0$var$parseNodes(stylesheet.rules);
}



(0, $hgUW1$program).version("1.0.0").description("A CLI form convert css to js").parse($hgUW1$argv);
(0, $hgUW1$program).parse();
const [$149c1bd638913645$var$entriesFile, $149c1bd638913645$var$outputFile] = (0, $hgUW1$program).args;
async function $149c1bd638913645$var$getFileContent(pathFile) {
    try {
        const filePath = new URL((0, $hgUW1$path).resolve(pathFile), "file:///src/index.ts");
        const contents = await (0, $hgUW1$readFile)(filePath, {
            encoding: "utf8"
        });
        return contents;
    } catch (err) {
        if (err instanceof Error) throw new Error(err.message);
    }
}
async function $149c1bd638913645$var$writeJsFile(content, outputPath) {
    const controller = new AbortController();
    const { signal: signal  } = controller;
    const output = new Uint8Array((0, $hgUW1$Buffer).from(`module.exports=${content}`));
    const file = (0, $hgUW1$writeFile)((0, $hgUW1$path).resolve(outputPath), output, {
        signal: signal
    });
    await file;
}
async function $149c1bd638913645$export$f22da7240b7add18(entriesFile, outputFile) {
    try {
        const code = await $149c1bd638913645$var$getFileContent(entriesFile);
        if (!code) return;
        const parseContent = (0, $a5221086de520fb0$export$98e6a39c04603d36)(code);
        await $149c1bd638913645$var$writeJsFile(JSON.stringify(parseContent), outputFile);
    } catch (err) {
        if (err instanceof Error) throw new Error(err.message);
    }
}
$149c1bd638913645$export$f22da7240b7add18($149c1bd638913645$var$entriesFile, !!$149c1bd638913645$var$outputFile ? $149c1bd638913645$var$outputFile : $149c1bd638913645$var$entriesFile.replace(".css", ".js"));


export {$149c1bd638913645$export$f22da7240b7add18 as main};
//# sourceMappingURL=main.js.map
