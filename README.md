# Major studio one
### project collaboration w/ Urban Ecology Lab
##### Parsons Data Visualization (MS)

## data sources
###### original dataset:

- .1. [urban ecology lab - map PLUTO](https://drive.google.com/drive/u/1/folders/0B6r_XA2F-ffxc2twSlBCOUQzNTQ)

example:

- .2. [open data NYC - restaurant inspection data](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/xx67-kt59)

example:

| CAMIS    | DBA            | BORO      | BUILDING | STREET            | ZIPCODE | PHONE      | CUISINE DESCRIPTION | INSPECTION DATE | ACTION                                          | VIOLATION CODE | VIOLATION DESCRIPTION                                                                                                                  | CRITICAL FLAG | SCORE | GRADE | GRADE DATE | RECORD DATE | INSPECTION TYPE                          |
|----------|----------------|-----------|----------|-------------------|---------|------------|---------------------|-----------------|-------------------------------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------|---------------|-------|-------|------------|-------------|------------------------------------------|
| 50036304 | NANOOSH        | MANHATTAN | 469      | 7TH AVE           | 10018   | 2123900563 | Mediterranean       | 7/10/15         | Violations were cited in the following area(s). | 09C            | Food contact surface not properly maintained.                                                                                          | Not Critical  | 7     | A     | 7/10/15    | 2/27/17     | Pre-permit (Operational) / Re-inspection |   

- .3. [foursquare API](https://developer.foursquare.com/)

example: [API endpoint: venue](https://api.foursquare.com/v2/venues/search?near=manhattan,%20ny&intent=browse&query=VEZZO&oauth_token=S5O343HN05HFVNXC4ZWYJ0VEUF01VCEPBLPAFR4C050DS1BD&v=20170307) |
 [API endpoint: id/search](https://api.foursquare.com/v2/venues/40a55d80f964a52020f31ee3?sort=recent&limit=500&oauth_token=S5O343HN05HFVNXC4ZWYJ0VEUF01VCEPBLPAFR4C050DS1BD&v=20170309)

 - .4. dataset I can not found but need:		

		median household income NYC (scale: per lot/block)


###### dataset after joining/parsing:
example:

| name           | address         | boro      | lat         | lng          | postcode | categories | stats | rating | text__type | text__text_extract | violation__recentScore | violation__recentTime    | violation__historyScore | violation__historyVCode | violation__closed_before | id |
|----------------|-----------------|-----------|-------------|--------------|----------|------------|-------|--------|------------|--------------------|------------------------|--------------------------|-------------------------|-------------------------|--------------------------|----|
| Paris Baguette | 136-17 39th Ave | MANHATTAN | 40.76063451 | -73.82956266 | 11354    | Bakery     | 7172  | 7.9    | liked      | comfortable        | 10                     | 2017-02-03T05:00:00.000Z | 10                      | 06C                     | null                     | 0  |
|                |                 |           |             |              |          |            |       |        |            | long               |                        |                          | 10                      | 06E                     |                          |    |
|                |                 |           |             |              |          |            |       |        |            | other              |                        |                          | 7                       | 06C                     |                          |    |
|                |                 |           |             |              |          |            |       |        |            |                    |                        |                          | 9                       | 04K                     |                          |    |
|                |                 |           |             |              |          |            |       |        |            |                    |                        |                          | 9                       | 08A                     |                          |    |



## topic
- combine Restaurant Inspection data and foursquare review/rating data, find interesting pattern between **restaurant's sanitation level (inspection data)** and what **New Yorker's real reflection (foursquare API)** about those restaurant. ```f.e: top 10 filthiest restaurants new yorker's love the most```
- find the relationship between **household income** and **restaurant sanitation problem**.
 ```f.e: base on geolocation(each street block/district), mapping income and restaurant sanitation score in the map```

###### key words:
**Sentiment analysis**: foursquare customer review text analysis. extract all _Adjectives_ / _Adverbs_ base on _positive_ / _negative_ context.

**Manhattan**: focuing all the restaurant in Mahattan(~ 5500 restaurants).

**Filthy-but-lovin'it INDEX**: Quantify the relationship between restaurant inspection score and foursquare rating (1-10).

## Design Sketches
###### plan A:
