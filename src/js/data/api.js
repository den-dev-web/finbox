const DATA_DIR = `${import.meta.env.BASE_URL}data/`;

const sleep = (minMs = 300, maxMs = 800) =>
  new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    setTimeout(resolve, delay);
  });

// Error state is opt-in for demos: append ?fail=1 to the URL
const shouldFail = () =>
  new URLSearchParams(window.location.search).get("fail") === "1";

/** @typedef {import("../types").Period} Period */
/** @typedef {import("../types").DashboardData} DashboardData */
/** @typedef {import("../types").ReportsData} ReportsData */
/** @typedef {import("../types").AccountsData} AccountsData */

/**
 * Fetches a mock JSON file with simulated latency, like a real API call.
 * @param {string} file name inside public/data/
 * @returns {Promise<any>}
 */
const loadMock = async (file) => {
  await sleep();

  if (shouldFail()) {
    throw new Error("Mock request failed");
  }

  let response;
  try {
    response = await fetch(`${DATA_DIR}${file}`);
  } catch (error) {
    throw new Error(`Failed to fetch mock data. Check public/data/${file}.`, {
      cause: error,
    });
  }
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Mock data file not found. Check public/data/${file}.`);
    }
    throw new Error("Failed to load mock data");
  }

  return response.json();
};

/**
 * Loads the dashboard data of one period.
 * @param {Period} period
 * @returns {Promise<DashboardData>}
 */
export async function getDashboard(period) {
  const data = await loadMock("finbox.mock.json");
  const entry = data?.periods?.[period];

  if (!entry) {
    throw new Error("Unknown period");
  }

  return entry;
}

/**
 * Loads monthly totals and yearly spending by category.
 * @returns {Promise<ReportsData>}
 */
export const getReports = () => loadMock("reports.mock.json");

/**
 * Loads the accounts that come with the demo data.
 * @returns {Promise<AccountsData>}
 */
export const getAccounts = () => loadMock("accounts.mock.json");
