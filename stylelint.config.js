// ITCSS namespaces + BEM: c-block__element--modifier
const BEM_CLASS_PATTERN =
  "^(c|o|u|is|has)-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$";

export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // State selectors ([data-state], :hover) intentionally follow base rules
    "no-descending-specificity": null,
    "selector-class-pattern": [
      BEM_CLASS_PATTERN,
      { message: "Use ITCSS-prefixed BEM: c-block__element--modifier" },
    ],
  },
};
