import css, {
  Declaration,
  FontFace,
  KeyFrame,
  KeyFrames,
  Media,
  Node,
  Rule,
} from "css";
import { camelCase } from "lodash";

type StyleRule = Record<string, string | string[]>;

type Style = Record<string, StyleRule | string | string[]>;

function removeCommentDeclarations(declarations: Declaration[]) {
  return declarations.filter(
    (declaration) => declaration.type === "declaration"
  );
}

function isCSSVariable(value: string): boolean {
  return value.startsWith("--");
}

function hasVendorSpecificPrefix(value: string): boolean {
  return !!value.match(/^[-_][a-z]/);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getDeclarationKey(declarationProperty: string): string {
  if (isCSSVariable(declarationProperty))
    return `-${capitalize(camelCase(declarationProperty))}`;

  if (hasVendorSpecificPrefix(declarationProperty))
    return `${declarationProperty.startsWith("-") ? "-" : "_"}${camelCase(
      declarationProperty
    )}`;

  return camelCase(declarationProperty);
}

function sanitizeDeclarationRule(value: string): string {
  return value.trimEnd();
}

function parseDeclarations(declarations: Declaration[]): Style {
  const filteredDeclarations = removeCommentDeclarations(declarations);

  return filteredDeclarations.reduce<Style>((acc, declaration) => {
    if (!declaration.property || !declaration.value) return acc;

    const declarationProperty = getDeclarationKey(declaration.property);
    const declarationValue = sanitizeDeclarationRule(declaration.value);

    if (!!acc[declarationProperty]) {
      acc[declarationProperty] = [
        acc[declarationProperty],
        declarationValue,
      ].flat() as string[];
      return acc;
    }

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
    let currentRules = mediaRules[selector];
    const current = acc[selector] as StyleRule;

    if (current && current[mediaSelector]) {
      currentRules = Object.assign({}, current[mediaSelector], currentRules);
    }

    acc[selector] = Object.assign({}, current, {
      [mediaSelector]: currentRules,
    });

    return acc;
  }, rules);
}

function parseKeyFrameDeclaration(
  keyFrameDeclaration: Declaration[]
): StyleRule {
  return keyFrameDeclaration.reduce<StyleRule>((acc, curr) => {
    acc = {
      ...acc,
      [curr.property as string]: curr.value as string,
    };

    return acc;
  }, {});
}

function parseKeyFrames(name: string, keyframes: KeyFrame[]): Style {
  return keyframes.reduce<KeyFrame>((acc, curr) => {
    const key = (curr.values ?? []).join(", ");
    const keyFrameRule = (acc as Style)[`@keyframes ${name}`] as StyleRule;
    acc = {
      ...acc,
      [`@keyframes ${name}`]: {
        ...keyFrameRule,
        [key]: parseKeyFrameDeclaration(curr.declarations as Declaration[]),
      },
    };
    return acc;
  }, {}) as Style;
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

    if (node.type === "keyframes") {
      const keyframes = <KeyFrames>node;

      if (!keyframes.keyframes) return acc;

      const parsedKeyFrames = parseKeyFrames(
        keyframes.name as string,
        keyframes.keyframes
      );

      acc = {
        ...acc,
        ...{
          ...((acc as Style)["keyframes"] as any),
          ...(parsedKeyFrames as any),
        },
      };
    }
    return acc;
  }, {});
}

export function parse(style: string) {
  var { stylesheet } = css.parse(style);

  if (!stylesheet) return {};

  return parseNodes(stylesheet.rules);
}
