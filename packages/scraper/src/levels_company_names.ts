import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const BASE_URL = "https://www.levels.fyi/companies";
const SEARCH_INPUT_PLACEHOLDER = "Deloitte"; // Placeholder to locate the input field
const SEARCH_COMBINATIONS = generateTwoLetterCombinations();

function generateTwoLetterCombinations(): string[] {
  const combinations: string[] = [];
  for (let i = 97; i <= 122; i++) {
    for (let j = 97; j <= 122; j++) {
      combinations.push(String.fromCharCode(i) + String.fromCharCode(j));
    }
  }
  return combinations;
}

async function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function getCompanyNames(): Promise<string[]> {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await delay(1000);

  const companyNames = new Set<string>();

  for (const searchText of SEARCH_COMBINATIONS) {
    await delay(1000 * Math.random() + 250);
    console.log(`Searching for: ${searchText}`);

    // Re-select the input field before each search to avoid detached element issues
    const searchInput = await page.$(
      `input[placeholder='${SEARCH_INPUT_PLACEHOLDER}']`,
    );
    if (!searchInput) {
      console.error("Search input not found! Skipping...");
      continue;
    }

    await searchInput.click({ clickCount: 3 }); // Select and clear input
    await searchInput.type(searchText);
    await delay(1000); // Allow time for results to load

    const newCompanies = await page.evaluate(() => {
      const allCompaniesHeader = Array.from(
        document.querySelectorAll("h6"),
      ).find((h) => h.textContent?.trim() === "All Companies");
      if (!allCompaniesHeader) return [];

      const parentDiv = allCompaniesHeader.closest("div");
      if (!parentDiv) return [];

      const companyDivs = Array.from(
        parentDiv.parentElement?.children || [],
      ).filter((div) => div !== parentDiv);

      return companyDivs
        .map((div) => {
          const companyAnchor = div.querySelector("a h6");
          return companyAnchor?.textContent?.trim() || "";
        })
        .filter((name) => name);
    });

    newCompanies.forEach((name) => companyNames.add(name));
  }

  await browser.close();
  return Array.from(companyNames);
}

async function saveCompanyNames(): Promise<void> {
  const companies = await getCompanyNames();
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const dirPath = path.join("scraped");
  const filePath = path.join(dirPath, `companyNames_${dateStr}.json`);

  // Ensure the directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(companies, null, 2), "utf-8");
  console.log(`Company names saved to ${filePath}`);
}

saveCompanyNames();
