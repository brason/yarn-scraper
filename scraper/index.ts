import puppeteer from 'puppeteer';
import fs from 'fs';
import garnkosScraper from './scrapers/garnkosScraper';
import garniusScraper from './scrapers/garniusScraper';
import hoyScraper from './scrapers/hoyScraper';
import levenshtein from 'fast-levenshtein';
import { Yarn, YarnData } from './types';
import { groupBy } from 'ramda';
import firebase, { firestore } from 'firebase';
import stringSimilarity from 'string-similarity';
import fetch from 'node-fetch';

firebase.initializeApp({
  apiKey: 'AIzaSyDur0kYc3v9FD4yVb5kKlnDH9IgRSGbNXQ',
  authDomain: 'yarn-for-more.firebaseapp.com',
  databaseURL: 'https://yarn-for-more.firebaseio.com',
  projectId: 'yarn-for-more',
  storageBucket: 'yarn-for-more.appspot.com',
  messagingSenderId: '1043913940689',
  appId: '1:1043913940689:web:745abe7f6b43fbd7946ff0',
});

const yarnCompanyNames = JSON.parse(`{
  "Rauma Garn": "Rauma",
  "Sandnes Garn": "Sandnes Garn",
  "Du Store Alpakka": "Du Store Alpakka",
  "Isager": "Isager Strik",
  "Regia": "Regia",
  "Järbo": "Järbo Garn",
  "House of Yarn": "Järbo Garn",
  "Dale Garn": "Dale Garn",
  "Drops": "Garnstudio",
  "Viking Garn": "Viking of Norway",
  "Mayflower": "Mayflower",
  "Novita": "Novita",
  "Gjestal": "Gjestal",
  "Gjestal Garn": "Gjestal",
  "Knit At Home": "Knit at Home"
}`);

function getBrands() {
  // const brands = Array.from(new Set(yarns.map((yarn) => yarn.brand)));
  //
  // for (const brand of brands) {
  //   const res = await ravelryApi('/yarn_companies/search.json', {
  //     query: brand,
  //   });
  //
  //   console.log(brand, res.yarn_companies);
  // }
}

function trimName(name: string) {
  return name.replace(/(?:\dtråds\/)?\d+gr/gi, '').trim();
}

function findYarnId(yarnResults: YarnData[], brand: string) {
  if (yarnResults.length === 0 || !yarnCompanyNames[brand]) {
    return null;
  }

  return yarnResults.find(
    (yarn) => yarn.yarn_company_name === yarnCompanyNames[brand],
  )?.id;
}

async function ravelryApi(
  endpoint: string,
  params?: { [key: string]: string },
) {
  const ravAccessKey = 'read-dec5be7996fb1304b396efdf2781dfc9';
  const ravPersonalKey = 'uSDs5Fn1XHG7VlS/KbYUN/va7iZJdtlsasfAEd1w';

  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`https://api.ravelry.com${endpoint}${qs}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        [ravAccessKey, ravPersonalKey].join(':'),
      ).toString('base64')}`,
    },
  });

  return res.json();
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  );

  const yarns = [];

  yarns.push(...(await garnkosScraper(page)));
  yarns.push(...(await garniusScraper(page)));
  yarns.push(...(await hoyScraper(page)));

  fs.writeFileSync('./yarns.json', JSON.stringify(yarns));

  // const yarns = JSON.parse(fs.readFileSync('./yarns.json', 'utf8')) as Yarn[];

  const yarnCollection = await firestore()
    .collection('yarns')
    .get();

  const existingYarnIds = yarnCollection.docs.map((doc) => Number(doc.id));

  for (const yarn of yarns) {
    try {
      const query = `"${trimName(yarn.name)}"`;
      const searchRes = (await ravelryApi('/yarns/search.json', {
        query,
      })) as { yarns: YarnData[] };

      const matchingYarnId = findYarnId(searchRes.yarns, yarn.brand);

      if (matchingYarnId) {
        if (!existingYarnIds.includes(matchingYarnId)) {
          const { yarn: yarnData }: { yarn: YarnData } = await ravelryApi(
            `/yarns/${matchingYarnId}.json`,
          );

          console.log(yarnData);

          await firestore()
            .doc(`yarns/${yarnData.id}`)
            .set({
              data: JSON.parse(JSON.stringify(yarnData)),
              link: yarn.link,
              price: yarn.price,
            });
        }
      } else {
        console.log(query);
      }
    } catch (err) {
      console.log(yarn.name, yarn.brand, err);
    }
  }

  await browser.close();
})();
