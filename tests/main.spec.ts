import { describe, expect, it } from "vitest";
import { parse } from "../src/parser";

describe("hello", () => {
  it("should convert a simple CSS", () => {
    const styleCSS = /* css */ `
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
    const styleCSS = /* css */ `
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
    const styleCSS = /* css */ `
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
    const styleCSS = /* css */ `.wk-avatar {
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
    const styleCSS = /* css */ `.wk-breadcrumb-item:focus .wk-breadcrumb-icon {
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
    const styleCSS = /* css */ `
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
    const styleCSS = /* css */ `
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
    const styleCSS = /* css */ `
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
    const styleCSS = /* css */ `
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
    const styleCSS = /* css */ `
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

  it("should merge duplicated media queries", () => {
    const styleCSS = /* css */ `
      .wk-test-class {
        display: block;
      }

      @media (min-width: 1024px) {
        .wk-test-class {
          display: none;
        }
      }
      @media (min-width: 1024px) {
        .wk-test-class {
          height: 200px;
        }
      }
    `;

    const styleJS = {
      ".wk-test-class": {
        "@media (min-width: 1024px)": {
          display: "none",
          height: "200px",
        },
        display: "block",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should keep vendor specific prefixes on property", () => {
    const styleCSS = /* css */ `
      .wk-test-class {
        -webkit-wk: lorem;
        _moz-wk: lorem;
        --wk-var: lorem;
      }
    `;

    const styleJS = {
      ".wk-test-class": {
        "-webkitWk": "lorem",
        _mozWk: "lorem",
        "-WkVar": "lorem",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should maintain duplicated properties on same class", () => {
    const styleCSS = /* css */ `
      .wk-test-class {
        property: -webkit-lorem;
        property: -moz-lorem;
      }
    `;

    const styleJS = {
      ".wk-test-class": {
        property: ["-webkit-lorem", "-moz-lorem"],
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });

  it("should convert a CSS with keyframes animation", () => {
    const styleCSS = /* css */ `
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes bounce {
        0%, 100% {
          transform: translateY(-25%);
          animation-timing-function: cubic-bezier(0.8,0,1,1);
        }
        50% {
          transform: none;
          animation-timing-function: cubic-bezier(0,0,0.2,1);
        }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
      .animate-bounce {
        animation: bounce 1s infinite;
      }
    `;

    const styleJS = {
      "@keyframes spin": {
        to: {
          transform: 'rotate(360deg)'
        }
      },
      "@keyframes bounce": {
        "0%, 100%": {
          transform: "translateY(-25%)",
          "animation-timing-function": "cubic-bezier(0.8,0,1,1)",
        },
        "50%": {
          transform: "none",
          "animation-timing-function": "cubic-bezier(0,0,0.2,1)",
        },
      },
      ".animate-spin": {
        animation: "spin 1s linear infinite",
      },
      ".animate-bounce": {
        animation: "bounce 1s infinite",
      },
    };

    const result = parse(styleCSS);

    expect(result).toEqual(styleJS);
  });
});
