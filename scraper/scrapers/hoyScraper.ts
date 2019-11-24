import { Page } from 'puppeteer';
import { Yarn } from '../types';

export default async function hoyScraper(page: Page): Promise<Yarn[]> {
  const yarns = [];
  for (const p of [1, 2, 3]) {
    await page.goto(`https://www.hoy.no/garn?p=${p}`);
    const _yarns = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('.details'),
      ) as Element[];
      return elements.map((el) => {
        const linkEl = el.querySelector('.link');
        return {
          name: linkEl?.getAttribute('title') as string,
          brand: null,
          price: parseFloat(
            el
              .querySelector('[data-price-type="finalPrice"]')
              ?.getAttribute('data-price-amount') as string,
          ),
          link: linkEl?.getAttribute('href') as string,
        };
      });
    });
    yarns.push(..._yarns);
  }
  return yarns;
}
