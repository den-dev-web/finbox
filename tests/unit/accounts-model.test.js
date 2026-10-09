import { describe, expect, it } from "vitest";
import {
  createAccount,
  filterAccounts,
  parseStoredAccounts,
  totalBalance,
  validateAccount,
} from "../../src/js/modules/accounts/model.js";

const VALID = {
  name: "Main checking",
  type: "bank",
  institution: "Monobank",
  balance: "1250.50",
};

const ACCOUNTS = [
  {
    id: "a",
    name: "Main checking",
    type: "bank",
    institution: "Monobank",
    balance: 1000,
  },
  {
    id: "b",
    name: "Travel card",
    type: "card",
    institution: "Revolut",
    balance: -250.5,
  },
  { id: "c", name: "Wallet", type: "cash", institution: "", balance: 80 },
];

describe("validateAccount", () => {
  it("accepts a complete form", () => {
    expect(validateAccount(VALID)).toEqual({});
  });

  it("requires a name, a known type and a balance", () => {
    expect(
      validateAccount({ name: "  ", type: "", institution: "", balance: "" }),
    ).toEqual({
      name: "Enter an account name.",
      type: "Choose an account type.",
      balance: "Enter the current balance.",
    });
  });

  it("limits text length", () => {
    const errors = validateAccount({
      ...VALID,
      name: "x".repeat(41),
      institution: "y".repeat(41),
    });
    expect(errors.name).toBe("Use 40 characters or fewer.");
    expect(errors.institution).toBe("Use 40 characters or fewer.");
  });

  it("accepts thousands separators and negative balances", () => {
    expect(validateAccount({ ...VALID, balance: "-1,250.5" })).toEqual({});
  });

  it("rejects malformed and out-of-range amounts", () => {
    for (const balance of ["12.345", "abc", "1.2.3", "--5"]) {
      expect(validateAccount({ ...VALID, balance }).balance).toBe(
        "Enter a number with up to 2 decimals, e.g. 1250.50.",
      );
    }
    expect(validateAccount({ ...VALID, balance: "10000001" }).balance).toBe(
      "Enter an amount up to 10,000,000.",
    );
  });

  it("rejects types outside the list, including object keys", () => {
    expect(validateAccount({ ...VALID, type: "toString" }).type).toBe(
      "Choose an account type.",
    );
  });
});

describe("createAccount", () => {
  it("trims text and keeps USD as is", () => {
    expect(
      createAccount(
        { ...VALID, name: "  Main  ", institution: " Mono " },
        { id: "x", currency: "USD" },
      ),
    ).toEqual({
      id: "x",
      name: "Main",
      type: "bank",
      institution: "Mono",
      balance: 1250.5,
    });
  });

  it("converts the entered currency back to USD", () => {
    const account = createAccount(
      { ...VALID, balance: "920" },
      { id: "x", currency: "EUR" },
    );
    expect(account.balance).toBe(1000);
  });
});

describe("filterAccounts", () => {
  it("matches name, institution and type label, ignoring case", () => {
    expect(filterAccounts(ACCOUNTS, "revolut").map((a) => a.id)).toEqual(["b"]);
    expect(filterAccounts(ACCOUNTS, "CASH").map((a) => a.id)).toEqual(["c"]);
    expect(filterAccounts(ACCOUNTS, "  ")).toBe(ACCOUNTS);
  });
});

describe("totalBalance", () => {
  it("adds debt as negative", () => {
    expect(totalBalance(ACCOUNTS)).toBe(829.5);
  });
});

describe("parseStoredAccounts", () => {
  it("keeps only well-formed accounts", () => {
    expect(
      parseStoredAccounts([
        ACCOUNTS[0],
        { id: 1 },
        null,
        { ...ACCOUNTS[1], balance: "x" },
      ]),
    ).toEqual([ACCOUNTS[0]]);
  });

  it("returns an empty list for anything else", () => {
    expect(parseStoredAccounts({ accounts: [] })).toEqual([]);
    expect(parseStoredAccounts(null)).toEqual([]);
  });
});
