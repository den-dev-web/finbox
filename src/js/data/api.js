const DATA_URL = new URL("../../../data/finbox.mock.json", import.meta.url);

const sleep = (minMs = 300, maxMs = 800) =>
  new Promise((resolve) => {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    setTimeout(resolve, delay);
  });

const maybeFail = (chance = 0.08) => Math.random() < chance;

export async function getDashboard(period) {
  await sleep();

  if (maybeFail()) {
    throw new Error("Mock request failed");
  }

  let response;
  try {
    response = await fetch(DATA_URL);
  } catch (error) {
    throw new Error("Failed to fetch mock data. Check data/finbox.mock.json.");
  }
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Mock data file not found. Check data/finbox.mock.json.");
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
