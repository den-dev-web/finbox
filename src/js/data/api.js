const DATA_URL = `${import.meta.env.BASE_URL}data/finbox.mock.json`;

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

/**
 * Loads the dashboard data of one period from the mock JSON file.
 * @param {Period} period
 * @returns {Promise<DashboardData>}
 */
export async function getDashboard(period) {
  await sleep();

  if (shouldFail()) {
    throw new Error("Mock request failed");
  }

  let response;
  try {
    response = await fetch(DATA_URL);
  } catch (error) {
    throw new Error(
      "Failed to fetch mock data. Check public/data/finbox.mock.json.",
      {
        cause: error,
      },
    );
  }
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Mock data file not found. Check public/data/finbox.mock.json.",
      );
    }
    throw new Error("Failed to load mock data");
  }

  const data = await response.json();
  const entry = data?.periods?.[period];

  if (!entry) {
    throw new Error("Unknown period");
  }

  return entry;
}
