(function () {
    'use strict';

    let data = {};
    let regions = [];
    let italyMap = {};
    let years = [];
    let selections = [
        'starts',
        'voucher'
    ];
    let currentDimensions = {
        year: 2013,
        selection: 'starts'
    };
    let mapSizes = {
        width: 500,
        height: 550
    }

    d3.json('data/app2.json', (error, jsonData) => {
        data.starts = jsonData.starts;
        data.voucher = jsonData.voucher;
        regions = jsonData.regions;
        years = data.voucher.map(s => s.year);

        d3.json('data/italy.json', (error, jsonItaly) => {
            italyMap = jsonItaly;
            init();
        });
    });


    function init() {
        initCmds();
        createMap();

    }

    function createMap() {
        const map = d3.select('#app2-map')
            .append('svg')
            .style("width", mapSizes.width)
            .style("height", mapSizes.height);

        updateMap('starts', 2013);
    }

    function updateMap(selection, year) {
        const currentData = data[selection].find(d => d.year === getNum(year)).data;
        const topoMap = topojson.feature(italyMap, italyMap.objects.reg2011).features;

        const map = d3.select('#app2-map').select('svg');

        const color = d3.scaleQuantize()
            .domain([d3.min(removeTotals(currentData)), d3.max(removeTotals(currentData))])
            .range(["#ffffbf", "#d9ef8b", "#91cf60", "#1a9850"]);

        const projection = d3.geoMercator()
            .scale(2000)
            .translate([-167, 1880]);
        const path = d3.geoPath()
            .projection(projection);

        const reg = map.selectAll(".region")
            .data(topoMap);

        var tip = d3.tip()
            .attr('class', 'tip')
            .offset([-8, 0])
            .html(d => getRegion(d.properties.COD_REG).name + '<br>' + getData(d));
        map.call(tip);

        reg.enter()
            .append("path")
            .attr("class", "region")
            .attr("d", path)
            .merge(reg)
            .style("fill", d => color(getData(d)))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        function getData(d) {
            return currentData[d.properties.COD_REG - 1];
        }
    }

    function initCmds() {
        const cmds = d3.select('#app2-cmds');

        const yearSelect = cmds.append('select')
            .attr('id', 'year-select');

        yearSelect.on('change', () => {
            update({ year: d3.select('#year-select').node().value })
        })

        yearSelect.selectAll('option')
            .data(years)
            .enter()
            .append('option')
            .attr('value', y => y)
            .text(y => y);

        const selectionSelect = cmds.append('select')
            .attr('id', 'selection-select');

        selectionSelect.on('change', () => {
            update({ selection: d3.select('#selection-select').node().value })
        })

        selectionSelect.selectAll('option')
            .data(selections)
            .enter()
            .append('option')
            .attr('value', y => y)
            .text(y => y);
    }

    function update(params) {
        if (params.selection)
            currentDimensions.selection = params.selection;
        if (params.year)
            currentDimensions.year = params.year;

        updateMap(currentDimensions.selection, currentDimensions.year);
    }

    function getRegion(cod) {
        return regions.find(r => r.cod === cod);
    }

    function removeTotals(d) {
        return d.slice(0, d.length - 2);
    }

    function getNum(str) {
        if (typeof str !== 'string') {
            if (typeof str === 'number')
                return str;
            return 0;
        }

        return +str.replace(/\D+/g, '');
    }

})();