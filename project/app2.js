'use strict';

let data = {};
let headers = [];
let italyMap = {};
let mapSizes = {
    width: 500,
    height: 550
}

d3.json('data/app2.json', (error, jsonData) => {
    data = jsonData;
    headers = data.regions;

    d3.json('data/italy.json', (error, jsonItaly) => {
        italyMap = jsonItaly;
        init();
    });
});


function init() {
    createMap();

}

function createMap() {
    const map = d3.select('#app2-map')
        .append('svg')
        .style("width", mapSizes.width)
        .style("height", mapSizes.height);

    updateMap('starts', 2013);
}

function updateMap(dimension, year) {
    const currentData = data[dimension].find(d => d.year === year).data;
    const topoMap = topojson.feature(italyMap, italyMap.objects.reg2011).features;

    const map = d3.select('#app2-map').select('svg');

    const color = d3.scaleQuantize()
        .domain([0, d3.max(currentData)])
        .range(["#ffffbf", "#d9ef8b", "#91cf60", "#1a9850"]);
        console.log(d3.max(currentData))

    const projection = d3.geoMercator()
        .scale(2000)
        .translate([-167, 1880]);
    const path = d3.geoPath()
        .projection(projection);

    const regions = map.selectAll(".region")
        .data(topoMap);

    regions.enter()
        .insert("path")
        .attr("class", "region")
        .attr("d", path)
        .style("fill", d => color(currentData[d.properties.COD_REG]));
}