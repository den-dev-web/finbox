import initAccounts from "../modules/accounts.js";
import initAccountDialog from "../modules/accounts/dialog.js";
import initShell from "../shell.js";

document.addEventListener("DOMContentLoaded", () => {
  const accounts = initAccounts();
  if (accounts) {
    initAccountDialog(accounts.add);
  }
  initShell();
});
