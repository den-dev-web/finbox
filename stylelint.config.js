// ITCSS namespaces + BEM: c-block__element--modifier
const BEM_CLASS_PATTERN =
  "^(c|o|u|is|has)-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$";

// No Autoprefixer: hand-written -webkit- forms required for Safari/iOS >= 15 (matched with the prefix)
const MANUAL_PREFIX_PROPERTIES = [
  "-webkit-backdrop-filter",
  "-webkit-user-select",
  "-webkit-hyphens",
  "-webkit-appearance",
  "-webkit-mask",
  "-webkit-mask-image",
  "-webkit-text-size-adjust",
];

export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // State selectors ([data-state], :hover) intentionally follow base rules
    "no-descending-specificity": null,
    "selector-class-pattern": [
      BEM_CLASS_PATTERN,
      { message: "Use ITCSS-prefixed BEM: c-block__element--modifier" },
    ],
    "color-no-hex": true,
    "color-named": "never",
    "declaration-no-important": true,
    // Range syntax (width >= 768px) needs Safari/iOS 16.4; keeps `stylelint --fix` from rewriting min-width queries
    "media-feature-range-notation": "prefix",
    // Manual prefixes required for the support target; any other prefix still fails
    "property-no-vendor-prefix": [
      true,
      { ignoreProperties: MANUAL_PREFIX_PROPERTIES },
    ],
  },
  overrides: [
    {
      files: ["**/tokens.css"],
      rules: { "color-no-hex": null, "color-named": null },
    },
  ],
};
