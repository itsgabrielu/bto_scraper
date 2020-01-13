const puppeteer = require('puppeteer');

puppeteer.launch({headless:false}).then(async browser => {
  const page = await browser.newPage();
  let currentURL = 'https://services2.hdb.gov.sg/webapp/BP13AWFlatAvail/BP13SEstateSummary?sel=BTO';
  await page.setJavaScriptEnabled(true)
  page.goto(currentURL);
  try {
    await page.waitForSelector("tr[id*='Punggol'][id*='Room']")
    await page.click("tr[id*='Punggol'][id*='Room'] > td > a")
    await page.waitForSelector('#ViewOption')
    await page.select('#ViewOption','2')
    await page.click('#searchButtonId')
    await page.waitForSelector('#blockDetails > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(1)')
    await page.click('#blockDetails > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(1) > div')

    // await page.waitForXPath('//*[@id="blockDetails"]/div[1]/table/tbody/tr[1]/td[1]/div');
  } catch (e) {
    console.log(e)
    if (e instanceof puppeteer.errors.TimeoutError) {
      // Do something if this is a timeout.
    }
  }
  // await browser.close();
});

