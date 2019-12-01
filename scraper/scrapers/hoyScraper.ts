import { Page } from 'puppeteer';
import { Yarn } from '../types';

export default async function hoyScraper(page: Page): Promise<Yarn[]> {
  const yarns = [];

  const brands: { [id: string]: string } = {
    '490': 'Dale Garn',
    '489': 'Du Store Alpakka',
    '491': 'Gjestal Garn',
    '598': 'Knit At Home',
    '11406': 'House of Yarn',
  };

  for (const brandId of Object.keys(brands)) {
    await page.goto(
      `https://www.hoy.no/garn?___store=default&brand=${brandId}`,
    );
    const _yarns = await page.evaluate((brand) => {
      const elements = Array.from(
        document.querySelectorAll('.details'),
      ) as Element[];
      return elements.map((el) => {
        const linkEl = el.querySelector('.link');
        return {
          name: linkEl?.getAttribute('title') as string,
          brand,
          price: parseFloat(
            el
              .querySelector('[data-price-type="finalPrice"]')
              ?.getAttribute('data-price-amount') as string,
          ),
          link: linkEl?.getAttribute('href') as string,
        };
      });
    }, brands[brandId]);
    yarns.push(..._yarns);
  }
  return yarns;
}
