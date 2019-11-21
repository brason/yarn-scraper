import puppeteer from "puppeteer";
import fs from "fs";
const Ravelry = require("ravelry");

const rav = Ravelry.basic({
  ravAccessKey: "read-dec5be7996fb1304b396efdf2781dfc9",
  ravPersonalKey: "uSDs5Fn1XHG7VlS/KbYUN/va7iZJdtlsasfAEd1w"
});

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  const yarns: { [weight: string]: any[] } = {};

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

      const name = await page.evaluate(() => {
        return document.querySelector(".product-name > .h1")?.textContent
      });

      const res = await rav.yarns.search({
        query: `"${name}"`
      });

      if (res.yarns.length > 0) {
        const {yarn} = await rav.yarns.show(res.yarns[0].id);

        if (!(yarn.yarn_weight.name in yarns)) {
          yarns[yarn.yarn_weight.name] = [];
        }

        yarns[yarn.yarn_weight.name].push({link, data: yarn});
      }
    }
  }

  fs.writeFileSync("yarns.json", JSON.stringify(yarns));

  await browser.close();
})();
