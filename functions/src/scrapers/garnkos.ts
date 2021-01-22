import * as puppeteer from "puppeteer";
import { Yarn, Brand } from "../types";

export const brands = [
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
  const yarnsRaw = [];

  for (const p of [1, 2, 3]) {
    await page.goto(`https://www.garnkos.no/garn.html?p=${p}`);

    const _yarns = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll(".product-info"));
      return elements
        .filter((el) => !el?.textContent?.includes("Utgått"))
        .map((el) => {
          const name = el
            .querySelector(".product-name > a")
            ?.getAttribute("title")
            ?.trim() as string;

          const brandName = el
            .querySelector(".product-brand")
            ?.textContent?.trim() as string;

          const specialPrice = el
            .querySelector(".special-price > .price")
            ?.textContent?.trim();
          const regularPrice = el
            .querySelector(".regular-price > .price")
            ?.textContent?.trim();

          const price = specialPrice ?? regularPrice;

          const url = el.querySelector("a")?.getAttribute("href") as string;

          return [name, brandName, price as string, url];
        });
    });

    yarnsRaw.push(..._yarns);
  }

  const yarns = [];

  for (const [name, brandName, price, url] of yarnsRaw) {
    if (!name.match(/\d+/)) {
      const brand = brandMap[brandName.toLowerCase()];

      if (brand) {
        yarns.push({
          name,
          brand,
          price: parseInt(/kr\s(\d+)/g.exec(price)?.[1] as string),
          url,
        });
      }
    }
  }

  return yarns;
}
