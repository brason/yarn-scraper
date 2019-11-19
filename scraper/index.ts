import puppeteer from "puppeteer";
import fs from "fs";
const Ravelry = require("ravelry");

const rav = Ravelry.basic({
  ravAccessKey: "read-dec5be7996fb1304b396efdf2781dfc9",
  ravPersonalKey: "uSDs5Fn1XHG7VlS/KbYUN/va7iZJdtlsasfAEd1w"
});

interface Yarn {
  name: string;
  description: string;
  imageURL: string;
  link: string;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  const yarns: { [weight: string]: Yarn[] } = {
    Thread: [],
    Cobweb: [],
    Lace: [],
    "Light Fingering": [],
    Fingering: [],
    Sport: [],
    DK: [],
    Worsted: [],
    Aran: [],
    Bulky: [],
    "Super Bulky": [],
    Jumbo: []
  };

  for (const p of [1, 2, 3]) {
    console.log(`Fetching page: ${p}`);
    await page.goto(`https://www.garnkos.no/garn.html?p=${p}`);
    const yarnLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".product-name > a"))
        .filter(el => !el.getAttribute("title")?.includes("Utgått"))
        .map(el => el.getAttribute("href")) as string[];
    });

    for (const link of yarnLinks) {
      await page.goto(link);

      const [name, description] = await page.evaluate(() => {
        return [".product-name > .h1", ".short-description > .std"].map(
          s => document.querySelector(s)?.textContent
        );
      });

      const imageURL = await page.evaluate(() => {
        return document.querySelector("#image-main")?.getAttribute("src");
      });

      const {
        yarns: [yarn]
      } = await rav.yarns.search({
        query: name
      });

      if (yarn && name && description && imageURL) {
        yarns[yarn.yarn_weight.name].push({
          name,
          description,
          imageURL,
          link
        });
      }
    }
  }

  fs.writeFileSync("yarns.json", JSON.stringify(yarns));

  await browser.close();
})();
