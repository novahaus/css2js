import css, { Declaration, FontFace, Media, Node, Rule } from "css";
import { camelCase } from "lodash";

type StyleRule = Record<string, string>;

type Style = Record<string, StyleRule | string>;

function removeCommentDeclarations(declarations: Declaration[]) {
  return declarations.filter(
    (declaration) => declaration.type === "declaration"
  );
}

function isCSSVariable(value: string): boolean {
  return value.startsWith("--");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getDeclarationKey(declarationProperty: string): string {
  if (isCSSVariable(declarationProperty))
    return `-${capitalize(camelCase(declarationProperty))}`;

  return camelCase(declarationProperty);
}

function saniziteDeclarationRule(value: string): string {
  return value.trimEnd();
}

function parseDeclarations(declarations: Declaration[]): Style {
  const filteredDeclarations = removeCommentDeclarations(declarations);

  return filteredDeclarations.reduce<Style>((acc, declaration) => {
    if (!declaration.property || !declaration.value) return acc;

    const declarationProperty = getDeclarationKey(declaration.property);
    const declarationValue = saniziteDeclarationRule(declaration.value);

    acc[declarationProperty] = declarationValue;
    return acc;
  }, {});
}

function parseRule(
  selectors: string[],
  declarations: Declaration[],
  rules: Style
): Style {
  const key = selectors.join(",");
  if (rules[key]) {
    const rulesAtKey = rules[key] as StyleRule;
    return {
      [key]: {
        ...rulesAtKey,
        ...parseDeclarations(declarations),
      },
    } as Style;
  }

  return {
    [key]: parseDeclarations(declarations),
  } as Style;
}

function nestMediaQueryRules(
  mediaSelector: string,
  mediaRules: Style,
  rules: Style
): Style {
  return Object.keys(mediaRules).reduce<Style>((acc, selector) => {
    acc[selector] = Object.assign({}, acc[selector], {
      [mediaSelector]: mediaRules[selector],
    });

    return acc;
  }, rules);
}

function parseNodes(nodes: Node[]): Style {
  return nodes.reduce<Style>((acc, node) => {
    if (node.type === "rule") {
      const rule = <Rule>node;

      if (!rule.selectors || !rule.declarations) return acc;

      const parsedRule = parseRule(rule.selectors, rule.declarations, acc);

      acc = { ...acc, ...parsedRule };
    }

    if (node.type === "font-face") {
      const rule = <FontFace>node;

      if (!rule.declarations) return acc;

      const parsedRule = parseRule(["@font-face"], rule.declarations, acc);

      acc = { ...acc, ...parsedRule };
    }

    if (node.type === "media") {
      const media = <Media>node;

      if (!media.rules) return acc;

      const mediaRules = parseNodes(media.rules);
      const mediaSelector = `@media ${media.media}`;

      acc = nestMediaQueryRules(mediaSelector, mediaRules, acc);
    }
    return acc;
  }, {});
}

export function parse(style: string) {
  var { stylesheet } = css.parse(style);

  if (!stylesheet) return {};

  return parseNodes(stylesheet.rules);
}
