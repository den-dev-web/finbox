import { displayCurrency } from "../../utils/format.js";
import { createAccount, validateAccount } from "./model.js";

/** @typedef {import("../../types").Account} Account */
/** @typedef {import("./model.js").AccountForm} AccountForm */

/** @type {(keyof AccountForm)[]} */
const FIELDS = ["name", "type", "institution", "balance"];

// <dialog>.showModal() arrived in Safari 15.4; older versions get a plain overlay
const supportsModal = () => "showModal" in document.createElement("dialog");

// Unique enough for ids that live in one browser's storage
const newId = () =>
  `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * "Add account" dialog: validates the form and hands a new account to onAdd.
 * @param {(account: Account) => void} onAdd
 */
export default function initAccountDialog(onAdd) {
  const dialog = /** @type {HTMLDialogElement | null} */ (
    document.querySelector("[data-account-dialog]")
  );
  const form = /** @type {HTMLFormElement | null} */ (
    document.querySelector("[data-account-form]")
  );
  const openButton = /** @type {HTMLButtonElement | null} */ (
    document.querySelector("[data-account-add]")
  );
  if (!dialog || !form || !openButton) {
    return;
  }

  /** @param {keyof AccountForm} field */
  const input = (field) =>
    /** @type {HTMLInputElement | HTMLSelectElement} */ (
      form.elements.namedItem(field)
    );
  /** @param {keyof AccountForm} field */
  const errorElement = (field) =>
    /** @type {HTMLElement} */ (form.querySelector(`#account-${field}-error`));

  /** @returns {AccountForm} */
  const readForm = () =>
    /** @type {AccountForm} */ (
      Object.fromEntries(FIELDS.map((field) => [field, input(field).value]))
    );

  /**
   * @param {keyof AccountForm} field
   * @param {string | undefined} message
   */
  const showError = (field, message) => {
    const error = errorElement(field);
    error.textContent = message ?? "";
    error.hidden = !message;
    input(field).setAttribute("aria-invalid", String(Boolean(message)));
  };

  const open = () => {
    form.reset();
    FIELDS.forEach((field) => showError(field, undefined));
    const currency = form.querySelector("[data-account-currency]");
    if (currency) {
      currency.textContent = displayCurrency();
    }
    if (supportsModal()) {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
      input("name").focus();
    }
  };

  const close = () => {
    if (supportsModal()) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    openButton.focus();
  };

  openButton.addEventListener("click", open);
  form.querySelector("[data-account-cancel]")?.addEventListener("click", close);

  // Native modals close on Escape by themselves; the fallback needs it too
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !supportsModal()) {
      close();
    }
  });

  // Once a field shows an error, re-check it while the user corrects it
  form.addEventListener("input", (event) => {
    const field = /** @type {keyof AccountForm} */ (
      /** @type {HTMLInputElement} */ (event.target).name
    );
    if (input(field)?.getAttribute("aria-invalid") === "true") {
      showError(field, validateAccount(readForm())[field]);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = readForm();
    const errors = validateAccount(values);
    FIELDS.forEach((field) => showError(field, errors[field]));

    const firstInvalid = FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      input(firstInvalid).focus();
      return;
    }
    onAdd(createAccount(values, { id: newId(), currency: displayCurrency() }));
    close();
  });
}
