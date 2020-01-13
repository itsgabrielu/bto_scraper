const puppeteer = require('puppeteer');

puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  const toggleAvailability = async (availability) => {
    const option = availability ? '1' : '2'
    await page.select('#ViewOption',option)
    await page.click('#searchButtonId')
  }
  const reliablyClick = async (selector, index = null) => {
    await page.evaluate((selector,index) => {
      if (typeof(index) === 'number') {
        document.querySelectorAll(selector)[index].firstElementChild.click();
      } else {
        document.querySelector(selector).click();
      }
    },selector,index)
  }
  let currentURL = 'https://services2.hdb.gov.sg/webapp/BP13AWFlatAvail/BP13SEstateSummary?sel=BTO';
  page.goto(currentURL);
  let unavailableUnits = {}

  const collectUnits = async (is_available) => {
    const key = is_available ? 'Available' : 'Taken'
    const blockCells = await page.evaluate(() => {
      return document.querySelectorAll('#blockDetails > div:nth-child(1) > table > tbody > tr > td').length
    })
    for (let i = 0; i < blockCells; i ++) {
      await page.waitForSelector('#blockDetails > div:nth-child(1) > table > tbody > tr > td')
      console.log("block appeared")
      reliablyClick('#blockDetails > div:nth-child(1) > table > tbody > tr > td', i)
      console.log("clicked")
      await page.waitForSelector(`#blockDetails > div:nth-child(6) > table > tbody > tr:nth-child(1) > td > font`)
      console.log("waiting for units")
      const shortlistedUnits = await page.evaluate((key) => {
        const blockNo = document.querySelector('#blockDetails > div:nth-child(2) > div.large-3.columns').textContent.trim()
        const rows = [...document.querySelectorAll('#blockDetails > div:nth-child(6) > table > tbody > tr')]
        let output = []
        rows.forEach(row => Array.from(row.children).forEach(cell => output.push(cell.textContent.trim())))
        return {
          [blockNo]: {
            [key]: output
          }
        }
      },key)
      unavailableUnits = {...unavailableUnits,...shortlistedUnits}
      console.log(unavailableUnits)
    }
  }
  try {
    // implement steps to navigate to page listing site since it triggers script querying on click
    await page.waitForSelector("tr[id*='Punggol'][id*='Room']")
    reliablyClick("tr[id*='Punggol'][id*='Room'] > td > a")
    await page.waitForSelector('#ViewOption')

    toggleAvailability(false)
    collectUnits(false)
    // toggleAvailability(true)
    // collectUnits(true)
  } catch (e) {
    console.log(e)
    if (e instanceof puppeteer.errors.TimeoutError) {
      // Do something if this is a timeout.
    }
  }
});

