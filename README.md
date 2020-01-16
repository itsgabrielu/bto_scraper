# bto_scraper
This app scrapes the flat unit information from the Singapore government's Housing Development Board (HDB)'s available Build-To-Order(BTO) public flat listings.

For many people, a house is one of the top big-ticket items they will make in their lifetime.
One pain point of prospective HDB buyers is to collect the available listings, among which to pick out the optimum unit for when their ballotted turn arrives. Of course, this is provided they manage to get a slot.

At the time of writing, buyers have to access this [link](https://services2.hdb.gov.sg/webapp/BP13AWFlatAvail/BP13SEstateSummary?sel=BTO) >> Select the respective town of choice (e.g. Punggol) and flat-type >> view list of unfiltered units for a *single* block.

The goal of this webscraper is to aggregate this information. Perhaps in future we can repurpose the data to a more efficient display. There are already similar apps out there which deliver the information via website or telegram bots. The other reason I did is to explore how webscraping works. 

You can see some sample json data I collected in the sample_json folder. Do note it may be outdated when you read this, but you should get the point.

