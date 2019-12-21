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

firebase.initializeApp({
  apiKey: 'AIzaSyDur0kYc3v9FD4yVb5kKlnDH9IgRSGbNXQ',
  authDomain: 'yarn-for-more.firebaseapp.com',
  databaseURL: 'https://yarn-for-more.firebaseio.com',
  projectId: 'yarn-for-more',
  storageBucket: 'yarn-for-more.appspot.com',
  messagingSenderId: '1043913940689',
  appId: '1:1043913940689:web:745abe7f6b43fbd7946ff0',
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Ravelry = require('ravelry');

const rav = Ravelry.basic({
  ravAccessKey: 'read-dec5be7996fb1304b396efdf2781dfc9',
  ravPersonalKey: 'uSDs5Fn1XHG7VlS/KbYUN/va7iZJdtlsasfAEd1w',
});

function trimName(name: string) {
  return name.replace(/(?:\dtråds\/)?\d+gr/gi, '').trim();
}

function findYarn(yarnResults: YarnData[], brand: string) {
  if (yarnResults.length === 0) {
    return null;
  }

  const bestMatch = stringSimilarity.findBestMatch(
    brand,
    yarnResults.map((yarn) => yarn.yarn_company?.name ?? ''),
  );

  return yarnResults[bestMatch.bestMatchIndex];
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  );

  // const yarns = [];
  //
  // yarns.push(...(await garnkosScraper(page)));
  // yarns.push(...(await garniusScraper(page)));
  // yarns.push(...(await hoyScraper(page)));
  //
  // fs.writeFileSync('./yarns.json', JSON.stringify(yarns));

  const yarns = JSON.parse(fs.readFileSync('./yarns.json', 'utf8')) as Yarn[];

  const yarnCollection = await firestore()
    .collection('yarns')
    .get();

  const existingYarnIds = yarnCollection.docs.map((doc) => Number(doc.id));

  for (const yarn of yarns) {
    console.log(yarn.name);

    try {
      const searchRes = (await rav.yarns.search({
        query: trimName(yarn.name),
      })) as { yarns: YarnData[] };

      const matchingYarn = findYarn(searchRes.yarns, yarn.brand);

      if (matchingYarn) {
        const yarnId = matchingYarn.id;

        if (!existingYarnIds.includes(yarnId)) {
          const { yarn: yarnData }: { yarn: YarnData } = await rav.yarns.show(
            matchingYarn.id,
          );

          await firestore()
            .doc(`yarns/${yarnData.id}`)
            .set(yarnData);
        }

        await firestore()
          .collection(`yarns/${yarnId}/items`)
          .add({
            link: yarn.link,
            price: yarn.price,
          });
      }
    } catch (err) {
      console.log(yarn.name, yarn.brand, err);
    }
  }

  await browser.close();
})();
