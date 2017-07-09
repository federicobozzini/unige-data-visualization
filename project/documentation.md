# Data visualization project by Federico Bozzini and Federico Semprini

We decided to build two apps, the first one focusing on some relevant job market rates, their evolution through time and differences between genders; the second one focusing on the regional differences in hirings, voucher usage, terminations and other relevant economic measures of the job market.

## Analysis of the data

### App 1 - gender balance

To build the app 1 (gender balance) we used the data about the absolute number of people occupied, not occupied and exclued by the Workforce divided by gender from year 1959 to 2015, provided to us by ISTAT. Starting from this data we decided to analyse the job market by calculating some of the most important indexes of the job market: Activity Rate, Employment Rate and Unemployment Rate. Especially we also focused on the possibility of analysing this data both in asbolute and relative terms between the genders.

We also decided to integrate this visualization with some external data about events that may have somehow made an impact on the job market. We decided to use datasets about general events, Italian legislatures and the job reforms.

### App 2 - regional indicators

To build the app 2 (regional indicators) we used the data about the hirings, terminations and voucher usage divided by region and year, from 2013 to 2015. This dataset was provided to us by INPS. Starting from this data we decided to analyse the job market by representing the data for the Italian regions, both compared among themselves and by highliting the regional trend across the years.

We also decided to integrate this visualization with the data about the regional population across the years.

## Concepts

### App 1 - gender balance

For the app 1 we decided to represent the data with an area chart or a line chart, displaying the data relevant to the two genders across the years. We decided to visualize one rate at a time, always using the x axis to display the years and the y axis to represent the rate (as a percentage) across the years. When areas are used there can be a visualization of the absolute rates, by stacking the male and female rates up to the total rate, or of the relative rates, by stacking the male and female proprtion to the total rate (sum always equal to 1). When lines are used the two partial rates are visualized separately and an additional line representing the total rate is added.

On the chart the user should be able to visualize the external events as a timeline (vertical lines dividing the chart in smaller sections among the years from one event to the next one).

It should be possible to rescale the data to let the user better understand the rate trends at a glance. It should be also possible to focus the visualization on males or females (by putting them on the bottom of the stacking).

A basic mockup of the app:
![app 1 mockup](img/app1mockup.png)

### App 2 - regional indicators

For the app 2 we decided to represent the data with two charts. The first one should be a choropleth map that displays the regional selected indicators. The second one should be a bar chart displaying the indicator trends across the years for a region or for the whole country.

It should be possible for the users to visualize the data both in absolute terms and weighted on the population of each region.

We also decided to add as an indicator the ratio between the hirings and terminations. This may offer an interesting overview of the health status of a local job market.

A basic mockup of the app:
![app 2 mockup](img/app2mockup.png)

## Data pre-processing

All the code used for the pre-processing of the data is included in the file *extractData.js*. The language used is *javascript*, on the *node.js* platform. To extract the data from the Excel files we used the [xlsx library](https://www.npmjs.com/package/xlsx).

### App 1 - gender balance

To read the data for the app 1 we opened the file *01_ISTAT, Forze di lavoro per anno, 1959-2015.xls* and transformed it into a json structure that was then filtered and mapped to produce a json with the data about the males and females occupied, not occupied and excluded by the workforce for each year from 1959 to 2015. 

### App 2 - regional indicators

## Functionalities

## Specific implementation techniques
