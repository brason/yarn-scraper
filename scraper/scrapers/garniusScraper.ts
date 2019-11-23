import { Page } from 'puppeteer';
import { Yarn } from '../types';

export default async function garniusScraper(page: Page): Promise<Yarn[]> {
  await page.goto('https://www.garnius.no/garn/filter/cat/type');
  await page.waitFor(5000);
  return await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll('.item'),
    ) as Element[];
    return elements.map((el) => {
      function parsePrice(text: string): number {
        return parseInt(/(\d+)\skr/g.exec(text)?.[1] as string);
      }

      return {
        name: el.querySelector('.product-name')?.textContent as string,
        brand: el.querySelector('.product-brand')?.textContent as string,
        price: parsePrice(
          ['.special-price > .price', '.regular-price > .price']
            .map((s) => el.querySelector(s))
            .find(Boolean)
            ?.textContent?.trim() as string,
        ),
        link: el.querySelector('a')?.getAttribute('href') as string,
        length: elements.length,
      };
    });
  });
}
