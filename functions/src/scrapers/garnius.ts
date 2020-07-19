import * as puppeteer from "puppeteer";
import { Yarn, Brand } from "../types";

async function autoScroll(page: puppeteer.Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export const brands = [
  Brand.DROPS,
  Brand.VIKING_GARN,
  Brand.DU_STORE_ALPAKKA,
  Brand.DALE_GARN,
  Brand.MAYFLOWER,
  Brand.NOVITA,
  Brand.GJESTAL_GARN,
];

export const brandMap: { [key: string]: Brand } = {
  drops: Brand.DROPS,
  "viking garn": Brand.VIKING_GARN,
  "du store alpakka": Brand.DU_STORE_ALPAKKA,
  "dale garn": Brand.DALE_GARN,
  mayflower: Brand.MAYFLOWER,
  novita: Brand.NOVITA,
  gjestal: Brand.GJESTAL_GARN,
};

export default async function (page: puppeteer.Page): Promise<Yarn[]> {
  await page.goto("https://www.garnius.no/garn/");

  await autoScroll(page);

  const yarns = await page.evaluate((brandMap) => {
    const elements = Array.from(document.querySelectorAll(".item"));

    return elements.map((el) => {
      const name = el.querySelector(".product-name")?.textContent as string;

      const brandName = el
        .querySelector(".product-brand")
        ?.textContent?.trim()
        ?.toLowerCase() as string;

      return {
        name,
        brand: brandMap[brandName] ?? null,
        price: parseInt(
          [".special-price > .price", ".regular-price > .price"]
            .map((s) => el.querySelector(s))
            .find(Boolean)
            ?.textContent?.trim() as string
        ),
        url: el.querySelector("a")?.getAttribute("href") as string,
      };
    });
  }, brandMap);

  return yarns;
}
