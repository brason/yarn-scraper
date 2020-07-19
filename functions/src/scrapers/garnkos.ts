import * as puppeteer from "puppeteer";
import { Yarn, Brand } from "../types";

function parsePrice(text: string): number {
  return parseInt(/kr\s(\d+,\d+)/g.exec(text)?.[1] as string);
}

export const brand = [
  Brand.DALE_GARN,
  Brand.DROPS,
  Brand.DU_STORE_ALPAKKA,
  Brand.HOUSE_OF_YARN,
  Brand.ISAGER_STRIK,
  Brand.RAUMA_GARN,
  Brand.SANDNES_GARN,
];

export const brandMap: { [key: string]: Brand } = {
  "dale garn": Brand.DALE_GARN,
  drops: Brand.DROPS,
  "du store alpakka": Brand.DU_STORE_ALPAKKA,
  "house of yarn": Brand.HOUSE_OF_YARN,
  isager: Brand.ISAGER_STRIK,
  "rauma garn": Brand.RAUMA_GARN,
  "sandnes garn": Brand.SANDNES_GARN,
};

export default async function (page: puppeteer.Page): Promise<Yarn[]> {
  const yarns = [];

  for (const p of [1, 2, 3]) {
    await page.goto(`https://www.garnkos.no/garn.html?p=${p}`);
    const _yarns = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll(".product-info"));
      return elements
        .filter((el) => !el?.textContent?.includes("Utgått"))
        .map((el) => {
          const name = el
            .querySelector(".product-name > a")
            ?.getAttribute("title") as string;

          const brandName = el
            .querySelector(".product-brand")
            ?.textContent?.trim()
            ?.toLowerCase() as string;

          return {
            name,
            brand: brandMap[brandName] ?? null,
            price: parsePrice(
              [".special-price > .price", ".regular-price > .price"]
                .map((s) => el.querySelector(s))
                .find(Boolean)
                ?.textContent?.trim() as string
            ),
            url: el.querySelector("a")?.getAttribute("href") as string,
          };
        });
    }, brandMap);

    yarns.push(..._yarns);
  }
  return yarns;
}
