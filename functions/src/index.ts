import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as puppeteer from "puppeteer";
import * as fs from "fs";
import fetch from "node-fetch";
import garnius from "./scrapers/garnius";
import garnkos from "./scrapers/garnkos";
import hoy from "./scrapers/hoy";
import { findBestMatch } from "string-similarity";
import { Store, Yarn } from "./types";

admin.initializeApp();

const db = admin.firestore();

async function ravelryApi(
  endpoint: string,
  params?: { [key: string]: string }
) {
  const ravAccessKey = "read-dec5be7996fb1304b396efdf2781dfc9";
  const ravPersonalKey = "uSDs5Fn1XHG7VlS/KbYUN/va7iZJdtlsasfAEd1w";

  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`https://api.ravelry.com${endpoint}${qs}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        [ravAccessKey, ravPersonalKey].join(":")
      ).toString("base64")}`,
    },
  });

  return res.json();
}

function chunkArray(myArray: any[], chunk_size: number) {
  let index = 0;
  const arrayLength = myArray.length;
  const tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    const myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

export const updateYarns = functions.pubsub
  .schedule("every day 00:00")
  .timeZone("Europe/Oslo")
  .onRun(async () => {
    const browser = await puppeteer.launch();
    const page = (await browser.pages())[0];

    const brands = JSON.parse(fs.readFileSync("./brands.json", "utf8"));

    await page.goto("https://www.ravelry.com/");

    await page.evaluate(() => {
      (document.querySelector("#user_login") as HTMLInputElement).value =
        "brageni";
      (document.querySelector("#user_password") as HTMLInputElement).value =
        "u#H%Y!P5/iPb34M";
      document.querySelector("button")?.click();
    });

    await page.waitForSelector("#navigation_avatar");

    const yarnIds = [];

    for (const brand of brands) {
      let currentPage = 1;

      while (true) {
        const url = `https://www.ravelry.com/yarns/search#yarn-company-link=${brand.permalink}&sort=name&view=thumblist&page=${currentPage}`;
        await page.goto(url);

        const res = await page.waitForResponse((response) => {
          const req = response.request();
          return (
            req.url() === "https://www.ravelry.com/yarns/search" &&
            req.method() === "POST"
          );
        });

        const ids = (await res.text())
          .match(/clicked\(\d+\)/g)
          ?.map((match) => match.slice(8, -1));

        if (ids) {
          yarnIds.push(...(ids as string[]));
          currentPage += 1;
        } else {
          break;
        }
      }
    }

    const yarns = [];

    for (const chunk of chunkArray(yarnIds, 20)) {
      const ids = chunk.join("+");
      const response = await ravelryApi(`/yarns.json?ids=${ids}`);
      yarns.push(...Object.values(response.yarns));
    }

    await Promise.all(
      yarns.map((yarn: any) => {
        return db.doc(`yarns/${yarn.id}`).set(JSON.parse(JSON.stringify(yarn)));
      })
    );
  });

async function updatePrices(crawledYarns: Yarn[], store: Store) {
  const brands = [...new Set(crawledYarns.map((yarn) => yarn.brand))];

  const allYarns = (
    await Promise.all(
      brands.map((brand) =>
        db.collection("yarns").where("yarn_company.id", "==", brand).get()
      )
    )
  )
    .map((collection) => collection.docs.map((doc) => doc.data()))
    .reduce((a, b) => a.concat(b), []);

  const promises = [];

  for (const yarn of crawledYarns) {
    const brandYarns = allYarns
      .filter((_yarn) => _yarn.yarn_company.id === yarn.brand)
      .map((yarn) => yarn.name) as string[];

    if (brandYarns.length > 0) {
      const bestMatch = findBestMatch(yarn.name, brandYarns).bestMatch.target;

      const yarnId = allYarns.find((yarn) => yarn.name === bestMatch)?.id;

      promises.push(
        db.doc(`yarns/${yarnId}/prices/${store}`).set({
          price: yarn.price,
          url: yarn.url,
          storeId: store,
        })
      );
    }
  }

  await Promise.all(promises);
}

export const garniusScraper = functions.pubsub
  .schedule("every day 00:00")
  .timeZone("Europe/Oslo")
  .onRun(async () => {
    const browser = await puppeteer.launch();
    const page = (await browser.pages())[0];

    const crawledYarns = (await garnius(page)).filter(
      (yarn) => yarn.brand !== null
    );

    await updatePrices(crawledYarns, Store.GARNIUS);

    await browser.close();
  });

export const garnkosScraper = functions.pubsub
  .schedule("every day 00:00")
  .timeZone("Europe/Oslo")
  .onRun(async () => {
    const browser = await puppeteer.launch();
    const page = (await browser.pages())[0];

    const crawledYarns = (await garnkos(page)).filter(
      (yarn) => yarn.brand !== null
    );

    await updatePrices(crawledYarns, Store.GARNKOS);

    await browser.close();
  });

export const hoyScraper = functions.pubsub
  .schedule("every day 00:00")
  .timeZone("Europe/Oslo")
  .onRun(async () => {
    const browser = await puppeteer.launch();
    const page = (await browser.pages())[0];

    const crawledYarns = (await hoy(page)).filter(
      (yarn) => yarn.brand !== null
    );

    await updatePrices(crawledYarns, Store.HOUSE_OF_YARN);

    await browser.close();
  });
