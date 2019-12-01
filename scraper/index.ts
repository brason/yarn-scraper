import puppeteer from 'puppeteer';
import fs from 'fs';
import garnkosScraper from './scrapers/garnkosScraper';
import garniusScraper from './scrapers/garniusScraper';
import hoyScraper from './scrapers/hoyScraper';
import levenshtein from 'fast-levenshtein';
import { Yarn } from './types';
import { groupBy } from 'ramda';

// const Ravelry = require('ravelry');
//
// const rav = Ravelry.basic({
//   ravAccessKey: 'read-dec5be7996fb1304b396efdf2781dfc9',
//   ravPersonalKey: 'uSDs5Fn1XHG7VlS/KbYUN/va7iZJdtlsasfAEd1w',
// });

// for (const link of yarnLinks) {
//   await page.goto(link);
//
//   const name = await page.evaluate(() => {
//     return document.querySelector(".product-name > .h1")?.textContent
//   });

//   const res = await rav.yarns.search({
//     query: `"^${name}$"`
//   });
//
//   if (res.yarns.length > 0) {
//     const {yarn} = await rav.yarns.show(res.yarns[0].id);
//
//     if (!(yarn.yarn_weight.name in yarns)) {
//       yarns[yarn.yarn_weight.name] = [];
//     }
//
//     yarns[yarn.yarn_weight.name].push({link, data: yarn});
//   }
// }

// function addYarns(yarns: Yarn[]) {
//
// }

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  );

  const groupByBrand = groupBy((yarn: Yarn) => yarn.name);
  const yarns = JSON.parse(fs.readFileSync('./yarns.json', 'utf8'));

  const test = groupByBrand(yarns);

  console.log(test);

  // const yarns = [];
  //
  // yarns.push(...(await garnkosScraper(page)));
  // yarns.push(...(await garniusScraper(page)));
  // yarns.push(...(await hoyScraper(page)));
  //
  // fs.writeFileSync('./yarns.json', JSON.stringify(yarns));

  await browser.close();
})();
