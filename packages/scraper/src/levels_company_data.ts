import fs from "fs";
import path from "path";
import puppeteer, { Page } from "puppeteer";

const BASE_URL = "https://www.levels.fyi/companies/";
const SCRAPED_DIR = "scraped";
const NAVIGATION_TIMEOUT = 10_000;
const MAX_RETRIES = 3;
const BATCH_SIZE = 5; // Process 5 companies in parallel
const SAVE_EVERY = 5;

function loadPreviousResults(): Record<
  string,
  { description: string | null; website: string | null }
> {
  const files = fs
    .readdirSync(SCRAPED_DIR)
    .filter(
      (file) => file.startsWith("companyDetails_") && file.endsWith(".json"),
    );
  if (files.length === 0) return {};

  files.sort((a, b) => b.localeCompare(a)); // Sort descending to get the latest file
  const latestFile = path.join(SCRAPED_DIR, files[0]);
  console.log(`Resuming from previous results: ${latestFile}`);
  return JSON.parse(fs.readFileSync(latestFile, "utf-8"));
}

async function getCompanyDetails(
  page: Page,
  company: string,
): Promise<{ description: string | null; website: string | null }> {
  const url = `${BASE_URL}${company}`;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: NAVIGATION_TIMEOUT,
      });

      const details = await page.evaluate(() => {
        const headers: HTMLHeadingElement[] = Array.from(
          document.querySelectorAll("h5"),
        );
        const aboutHeader = headers.find(
          (h) => h.textContent?.trim() === "About",
        );
        let description: string | null = null;

        if (aboutHeader) {
          let nextElement: Element | null = aboutHeader.nextElementSibling;
          let iterations = 0;
          while (
            nextElement &&
            nextElement.tagName.toLowerCase() !== "p" &&
            iterations < 5
          ) {
            nextElement = nextElement.nextElementSibling;
            iterations++;
          }
          description =
            nextElement && nextElement.tagName.toLowerCase() === "p"
              ? (nextElement.textContent?.trim() ?? null)
              : null;
        }

        let website: string | null = null;
        const websiteSpan = Array.from(document.querySelectorAll("span")).find(
          (span) => span.textContent?.trim() === "Website",
        );
        if (websiteSpan) {
          const parentDiv = websiteSpan.closest("div");
          if (parentDiv) {
            const websiteH6 = parentDiv.querySelector("h6");
            if (websiteH6) {
              const websiteAnchor = websiteH6.querySelector("a");
              website = websiteAnchor?.textContent?.trim() ?? null;
            }
          }
        }

        return { description, website };
      });

      return details;
    } catch (error) {
      console.error(
        `Error fetching ${company} (Attempt ${attempts + 1}/${MAX_RETRIES}):`,
        error,
      );
      attempts++;
    }
  }

  return { description: null, website: null }; // Return null values after max retries
}

async function loadLatestCompanyNames(): Promise<string[]> {
  const files = fs
    .readdirSync(SCRAPED_DIR)
    .filter(
      (file) => file.startsWith("companyNames_") && file.endsWith(".json"),
    );
  if (files.length === 0) {
    console.error("No scraped company names found.");
    return [];
  }

  files.sort((a, b) => b.localeCompare(a)); // Sort descending to get the latest file
  const latestFile = path.join(SCRAPED_DIR, files[0]);
  console.log(`Using company names from: ${latestFile}`);
  return JSON.parse(fs.readFileSync(latestFile, "utf-8"));
}

async function scrapeCompanyDetails(startCompany?: string): Promise<void> {
  const companies = await loadLatestCompanyNames();
  if (companies.length === 0) return;

  // Load previous results to resume from where we left off
  const results = loadPreviousResults();

  // Determine starting index
  const startIndex = startCompany ? companies.indexOf(startCompany) : 0;
  if (startIndex === -1) {
    console.error(`Start company '${startCompany}' not found in list.`);
    return;
  }

  console.log(
    `Fetching details for ${companies.length - startIndex} companies in batches of ${BATCH_SIZE}...`,
  );
  const browser = await puppeteer.launch({ headless: true });

  let j = 0;
  for (let i = startIndex; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch: ${batch.join(", ")}`);

    const batchResults = await Promise.all(
      batch.map(async (company) => {
        if (results[company]) {
          console.log(`Skipping ${company}, already scraped.`);
          return { company, details: results[company] };
        }
        const page = await browser.newPage();
        console.log(`Fetching details for ${company}...`);
        const details = await getCompanyDetails(page, company);
        await page.close();
        return { company, details };
      }),
    );

    batchResults.forEach(({ company, details }) => {
      results[company] = details;
    });

    j++;

    if (j % SAVE_EVERY === 0) {
      console.log(`Saving progress at ${i + BATCH_SIZE} companies...`);
      saveResults(results);
    }
  }

  await browser.close();
  saveResults(results);
}

function saveResults(
  results: Record<
    string,
    { description: string | null; website: string | null }
  >,
) {
  const dateStr = new Date().toISOString().split("T")[0];
  const outputDir = path.join(SCRAPED_DIR);
  const filePath = path.join(outputDir, `companyDetails_${dateStr}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`Company details saved to ${filePath}`);
}

scrapeCompanyDetails("Okta");
