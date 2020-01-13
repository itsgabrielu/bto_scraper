const puppeteer = require('puppeteer');

puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  const toggleAvailability = async (availability) => {
    const option = availability ? '1' : '2'
    await page.select('#ViewOption',option)
    await page.click('#searchButtonId')
  }
  const reliablyClick = async (selector) => {
    await page.evaluate((selector) => {
      document.querySelector(selector).click();
    },selector)
  }
  let currentURL = 'https://services2.hdb.gov.sg/webapp/BP13AWFlatAvail/BP13SEstateSummary?sel=BTO';
  page.goto(currentURL);
  
  try {
    // implement steps to navigate to page listing site since it triggers script querying on click
    await page.waitForSelector("tr[id*='Punggol'][id*='Room']")
    reliablyClick("tr[id*='Punggol'][id*='Room'] > td > a")
    await page.waitForSelector('#ViewOption')
    toggleAvailability(false)
    await page.waitForSelector('#blockDetails > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(1) > div')
    reliablyClick('#blockDetails > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(1) > div')
    await page.waitForSelector('#blockDetails > div:nth-child(6) > table > tbody > tr:nth-child(1) > td > font')
    let unavailableUnits = []
    const dataRows = await page.evaluate((output)=> {
      let rows = [...document.querySelectorAll('#blockDetails > div:nth-child(6) > table > tbody > tr')]
      rows.forEach(row => Array.from(row.children).forEach(cell => output.push(cell.textContent.trim())))
      return output
    },[])
    await browser.close();
    console.log('dataRows',dataRows)
  } catch (e) {
    console.log(e)
    if (e instanceof puppeteer.errors.TimeoutError) {
      // Do something if this is a timeout.
    }
  }
});

