import * as puppeteer from "puppeteer";
import { Yarn, Brand } from "../types";

export const brands = [
  Brand.DALE_GARN,
  Brand.DU_STORE_ALPAKKA,
  Brand.GJESTAL_GARN,
  Brand.HOUSE_OF_YARN,
  Brand.LANA_GROSSA,
];

export default async function (page: puppeteer.Page): Promise<Yarn[]> {
  const yarns = [];

  const idToBrand: { [id: string]: number } = {
    "490": Brand.DALE_GARN,
    "489": Brand.DU_STORE_ALPAKKA,
    "491": Brand.GJESTAL_GARN,
    "11406": Brand.HOUSE_OF_YARN,
    "11602": Brand.LANA_GROSSA,
  };

  for (const brandId of Object.keys(idToBrand)) {
    await page.goto(
      `https://www.hoy.no/garn?___store=default&brand=${brandId}`
    );
    const _yarns = await page.evaluate((brand) => {
      const elements = Array.from(document.querySelectorAll(".details"));
      return elements.map((el) => {
        const linkEl = el.querySelector(".link");
        const name = linkEl?.getAttribute("title") as string;
        return {
          name,
          brand,
          price: parseFloat(
            el
              .querySelector('[data-price-type="finalPrice"]')
              ?.getAttribute("data-price-amount") as string
          ),
          url: linkEl?.getAttribute("href") as string,
        };
      });
    }, idToBrand[brandId]);
    yarns.push(..._yarns);
  }

  return yarns;
}
