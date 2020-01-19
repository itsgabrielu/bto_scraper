const puppeteer = require('puppeteer');

const appendToObj = (obj1,obj2) => {
  const obj2Key = Object.keys(obj2)[0]
  if (obj1.hasOwnProperty(obj2Key)) {
    obj1[obj2Key] = {...obj1[obj2Key],...obj2[obj2Key]}
  } else {
    obj1[obj2Key] = obj2[obj2Key]
  }
}

puppeteer.launch({headless: true})
.then(async browser => {
  const page = await browser.newPage();
  const toggleAvailability = async (availability) => {
    const option = availability ? '1' : '2'
    await page.waitForSelector('#ViewOption')
    await page.select('#ViewOption',option)
    await page.click('#searchButtonId')
  }
  const toggleProject = async (value) => {
    await page.waitForSelector('#projName')
    await page.select('#projName',value)
    await page.click('#searchButtonId')
  }
  let townName = ''
  let projNames = []
  const reliablyClick = async (selector, index = null) => {
    await page.evaluate((selector,index) => {
      if (typeof(index) === 'number') {
        console.log('clicking on a a block with index', index)
        document.querySelectorAll(selector)[index].firstElementChild.click();
      } else {
        document.querySelector(selector).click();
      }
    },selector,index)
  }
  let currentURL = 'https://services2.hdb.gov.sg/webapp/BP13AWFlatAvail/BP13SEstateSummary?sel=BTO';
  page.goto(currentURL);
  let unavailableUnits = {}
  let availableUnits = {}

  const collectUnits = async (is_available) => {
    await toggleAvailability(is_available)
    const key = is_available ? 'Available' : 'Taken'
    await page.waitForSelector('#blockDetails > div:nth-child(1) > table > tbody > tr > td')
    
    for (let p = 0; (projNames.length === 0 && p < 1 ) || p < projNames.length; p ++) {
      if (projNames.length > 0) {
        await toggleProject(projNames[p].value)
      }
      await page.waitForSelector('#blockDetails > div:nth-child(1) > table > tbody > tr > td')
      const blockCells = await page.evaluate(() => {
        return document.querySelectorAll('#blockDetails > div:nth-child(1) > table > tbody > tr > td').length
      })
      console.log('Number of blocks available in this search filter', blockCells)
      for (let i = 0; i < blockCells; i ++) {
        await page.waitForSelector(`#blockDetails > div:nth-child(1) > table > tbody > tr > td:nth-child(${i + 1}) > div`)
        reliablyClick('#blockDetails > div:nth-child(1) > table > tbody > tr > td', i)
        await page.waitForSelector(`#blockDetails > div:nth-child(6) > table > tbody > tr:nth-child(1) > td > font`)
        const shortlistedUnits = await page.evaluate((key,projNames,index,townName) => {
          const blockNo = document.querySelector('#blockDetails > div:nth-child(2) > div.large-3.columns').textContent.trim()
          const rows = key === 'Available' ? 
          [...document.querySelectorAll('#blockDetails > div:nth-child(6) > table > tbody > tr > td > font > a > font:nth-child(1)')] 
          : [...document.querySelectorAll('#blockDetails > div:nth-child(6) > table > tbody > tr > td')]
          let output = []
          rows.forEach(row => output.push(row.textContent.trim().match(/\d*\-\d*/)[0]))
          if (projNames.length===0) {
            return { [townName] : { [blockNo]: { [key]: output } } } 
          }
          return { [projNames[index].name] : { [blockNo]: { [key]: output } } }
        },key,projNames,p,townName)
        if (is_available) {
          appendToObj(availableUnits,shortlistedUnits)
        } else {
          appendToObj(unavailableUnits,shortlistedUnits)
        }
      }
    }
  }
  try {
    // implement steps to navigate to page listing site since it triggers script querying on click
    await page.waitForSelector("tr[id*='Punggol'][id*='Room']")
    reliablyClick("tr[id*='Punggol'][id*='Room'] > td > a")
    await page.waitForSelector('#ViewOption')
    townName = await page.evaluate(() => document.querySelector('#Town').value)
    projNames = await page.evaluate(() => {
      const projNameSelect = document.querySelector('#projName')
      if (!projNameSelect) return []
      return Array.from(projNameSelect.children).slice(1).map(proj =>  {
        return { value: proj.value, name: proj.textContent }
      })
    })

    console.log('This town is in', townName)
    console.log('Proj name is', projNames)

    await collectUnits(false)
    await collectUnits(true)
    console.log(JSON.stringify(availableUnits))
    console.log(JSON.stringify(unavailableUnits))
  } catch (e) {
    console.log(e)
  }
  browser.close()
})
.catch(e => console.log(e));

