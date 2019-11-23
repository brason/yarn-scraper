import { Page } from 'puppeteer';
import { Yarn } from '../types';

export default async function garnkosScraper(page: Page): Promise<Yarn[]> {
  const yarns = [];
  for (const p of [1, 2, 3]) {
    await page.goto(`https://www.garnkos.no/garn.html?p=${p}`);
    const _yarns = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('.product-info'),
      ) as Element[];
      return elements
        .filter((el) => !el?.textContent?.includes('Utgått'))
        .map((el) => {
          function getPrice(text: string): number {
            return parseInt(/kr\s(\d+,\d+)/g.exec(text)?.[1] as string);
          }

          return {
            name: el
              .querySelector('.product-name > a')
              ?.getAttribute('title') as string,
            brand: el
              .querySelector('.product-brand')
              ?.textContent?.trim() as string,
            price: getPrice(
              ['.special-price > .price', '.regular-price > .price']
                .map((s) => el.querySelector(s))
                .find(Boolean)
                ?.textContent?.trim() as string,
            ),
            link: el.querySelector('a')?.getAttribute('href') as string,
          };
        });
    });

    yarns.push(..._yarns);
  }
  return yarns;
}
