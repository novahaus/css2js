import { describe, expect, it } from "vitest";
import { parse } from "../src/parser";

describe("hello", () => {
  it("should convert a simple CSS", () => {
    const styleCSS = `
      body {
        background-color: blue;
      }
    `;

    const styleJS = {
      body: {
        backgroundColor: "blue",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should convert a CSS with media query", () => {
    const styleCSS = `
      body {
        background-color: blue;
      }

      @media (max-width: 768px) {
        body {
          color: red;
        }
      }
    `;

    const styleJS = {
      body: {
        backgroundColor: "blue",

        "@media (max-width: 768px)": {
          color: "red",
        },
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should convert a CSS with css var reading", () => {
    const styleCSS = `
      body {
        background-color: var(--primary-color);
      }
    `;

    const styleJS = {
      body: {
        backgroundColor: "var(--primary-color)",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should convert a css with CSS var declaration", () => {
    const styleCSS = `.wk-avatar {
      border-radius: var(--wk-rounded-round);

      --avatar-placeholder-color: var(--wk-color-base-100);
      --avatar-background-color: var(--wk-color-secondary);

      --avatar-size: 3rem; /* 48px */
      --avatar-placeholder-font-size: 1.6875rem /* 27px */;

      width: var(--avatar-size);
      height: var(--avatar-size);
    }`;

    const styleJS = {
      ".wk-avatar": {
        borderRadius: "var(--wk-rounded-round)",
        "-AvatarPlaceholderColor": "var(--wk-color-base-100)",
        "-AvatarBackgroundColor": "var(--wk-color-secondary)",
        "-AvatarSize": "3rem",
        "-AvatarPlaceholderFontSize": "1.6875rem",
        width: "var(--avatar-size)",
        height: "var(--avatar-size)",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should convert a css with nested selectors", () => {
    const styleCSS = `.wk-breadcrumb-item:focus .wk-breadcrumb-icon {
      margin-left: 0.375rem;
    }`;

    const styleJS = {
      ".wk-breadcrumb-item:focus .wk-breadcrumb-icon": {
        marginLeft: "0.375rem",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should nest media css rules", () => {
    const styleCSS = `
      body {
        background-color: var(--primary-color);
      }

      @media (max-width: 768px) {
        body {
          color: red;
        }
      }
    `;

    const styleJS = {
      body: {
        backgroundColor: "var(--primary-color)",
        "@media (max-width: 768px)": {
          color: "red",
        },
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should nest media css rules wrote before", () => {
    const styleCSS = `
      @media (max-width: 768px) {
        body {
          color: red;
        }
      }
      body {
        background-color: var(--primary-color);
      }
    `;

    const styleJS = {
      body: {
        "@media (max-width: 768px)": {
          color: "red",
        },
        backgroundColor: "var(--primary-color)",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should nest media css rules without a parent selector", () => {
    const styleCSS = `
      @media (max-width: 768px) {
        body {
          color: red;
        }
      }
    `;

    const styleJS = {
      body: {
        "@media (max-width: 768px)": {
          color: "red",
        },
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should parse font-face", () => {
    const styleCSS = `
      @font-face {
        font-family: Trickster;
        src: local("Trickster"), url("trickster-COLRv1.otf") format("opentype") tech(color-COLRv1), url("trickster-outline.otf") format("opentype"), url("trickster-outline.woff") format("woff");
      }
    `;

    const styleJS = {
      "@font-face": {
        fontFamily: "Trickster",
        src: `local("Trickster"), url("trickster-COLRv1.otf") format("opentype") tech(color-COLRv1), url("trickster-outline.otf") format("opentype"), url("trickster-outline.woff") format("woff")`,
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should keep the media writing order", () => {
    const styleCSS = `
      .wk-card-carousel-disable-desktop .wk-card-carousel-pagination {
          display: block;
        }
      @media (min-width: 1024px) {
        .wk-card-carousel-disable-desktop .wk-card-carousel-pagination {
          display: none;
        }
      }
      @media (min-width: 1024px) {
        .wk-hero-icon {
          display: block;
        }
      }

      .wk-hero-icon {
        display: none;
      }
    `;

    const styleJS = {
      ".wk-card-carousel-disable-desktop .wk-card-carousel-pagination": {
        display: "block",
        "@media (min-width: 1024px)": {
          display: "none",
        },
      },
      ".wk-hero-icon": {
        display: "none",
        "@media (min-width: 1024px)": {
          display: "block",
        },
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });
});
