(function () {
    'use strict';

    const data = {};
    let regions = [];
    let italyMap = {};
    let years = [];
    const charts = [
        'hirings',
        'dismissed',
        'hirings/dismissed',
        'voucher'
    ];
    const italyIndex = 20;
    const currentSelections = {
        year: 2013,
        chart: 'hirings',
        regionIndex: italyIndex
    };
    const mapSizes = {
        width: 500,
        height: 550
    };

    const barChartSizes = {
        width: 500,
        height: 400
    };

    const formatter = new Intl.NumberFormat('en-US');

    d3.json('data/app2.json', (error, jsonData) => {
        data.hirings = jsonData.hirings;
        data.voucher = jsonData.voucher;
        data.population = jsonData.population;
        data.dismissed = jsonData.dismissed;
        regions = jsonData.regions;
        years = jsonData.years;


        data['hirings/dismissed'] = jsonData.hirings.map(h =>
            ({
                year: h.year,
                data: jsonData.dismissed
                    .find(d => d.year === h.year)
                    .data.map((d, i) => h.data[i] / d)
            })
        );


        d3.json('data/italy.json', (error, jsonItaly) => {
            italyMap = jsonItaly;
            init();
        });
    });


    function init() {
        initTitle();
        initCmds();
        initMap();
        initBarChart();
        update();
    }

    function initTitle() {
        d3.select('#app2-title')
            .append('h3')
            .text(currentSelections.chart);
    }

    function initMap() {
        d3.select('#app2-map')
            .append('svg')
            .style('width', mapSizes.width)
            .style('height', mapSizes.height);
    }

    function initBarChart() {
        d3.select('#app2-info')
            .append('h3')
            .text('info');

        const svg = d3.select('#app2-info')
            .append('svg')
            .style('width', barChartSizes.width)
            .style('height', barChartSizes.height);


        svg.append('g').attr('id', 'xAxis');
        svg.append('g').attr('id', 'yAxis');
        svg.append('g').attr('id', 'bars');
    }

    function initCmds() {
        const cmds = d3.select('#app2-cmds');

        const yearSelect = cmds.append('div')
            .text('Year: ')
            .append('select')
            .attr('id', 'year-cmd');

        yearSelect.on('change', update)

        yearSelect.selectAll('option')
            .data(years)
            .enter()
            .append('option')
            .attr('value', y => y)
            .text(y => y);

        const chartSelect = cmds.append('div')
            .text('Data: ')
            .append('select')
            .attr('id', 'chart-cmd');

        chartSelect.on('change', update)

        chartSelect.selectAll('option')
            .data(charts)
            .enter()
            .append('option')
            .attr('value', y => y)
            .text(y => y);

        const label = cmds.append('div')
            .append('label');
        label.append('input')
            .attr('type', 'checkbox')
            .property('checked', true)
            .attr('id', 'normalize-cmd')
            .on('change', update);
        label.append('span').text('Normalize with population');
    }


    function update(params) {
        const year = d3.select('#year-cmd').node().value,
            chart = d3.select('#chart-cmd').node().value,
            normalized = d3.select('#normalize-cmd').property('checked');

        currentSelections.chart = chart;
        currentSelections.year = year;
        currentSelections.normalized = normalized;
        currentSelections.regionIndex = italyIndex;

        if (currentSelections.chart === charts[2]) {
            currentSelections.normalized = false;
            d3.select('#normalize-cmd').property('disabled', true);
        }
        else
            d3.select('#normalize-cmd').property('disabled', false);

        d3.select('#app2-title').select('h3').text(currentSelections.chart);


        updateMap();
        updateBarChart();
    }

    function updateMap() {

        function getData(d) {
            return currentData[d.properties.COD_REG - 1];
        }

        const currentData = getCurrentData(currentSelections.chart, currentSelections.year);
        const topoMap = topojson.feature(italyMap, italyMap.objects.reg2011).features;

        const map = d3.select('#app2-map').select('svg');

        const color = d3.scaleLinear()
            .domain([
                d3.min(removeTotals(currentData).map(cd => cd.value)),
                d3.max(removeTotals(currentData).map(cd => cd.value))
            ])
            .interpolate(d3.interpolateLab)
            .range([d3.rgb('#ffffbf'), d3.rgb('#009900')]);

        const projection = d3.geoMercator()
            .scale(2000)
            .translate([-167, 1880]);
        const path = d3.geoPath()
            .projection(projection);

        const reg = map.selectAll('.region')
            .data(topoMap);

        const tip = d3.tip()
            .attr('class', 'tip')
            .html(d => getRegion(d).name + '<br>' + formatter.format(getData(d).label));
        map.call(tip);

        reg.enter()
            .append('path')
            .attr('class', 'region')
            .attr('d', path)
            .merge(reg)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition().duration(400)
            .style('fill', d => color(getData(d).value));

        map.selectAll('.region')
            .on('click', reg => {
                d3.event.stopPropagation();
                currentSelections.regionIndex = reg.properties.COD_REG - 1;
                updateBarChart();
            });

        map.on('click', reg => {
            currentSelections.regionIndex = italyIndex;
            updateBarChart();
        });
    }

    function getCurrentData(chart, year) {
        const y = getNum(year);
        const dataSelected = data[chart].find(d => d.year === y).data;

        if (currentSelections.normalized) {
            const population = data.population.find(p => p.year === y).data;
            return dataSelected.map((d, i) => ({
                label: d,
                value: d / population[i]
            }));
        }

        return dataSelected.map(d => ({ label: d, value: d }));
    }

    function updateBarChart() {
        const barChartData = data[currentSelections.chart]
            .map(d => ({
                year: d.year,
                datum: d.data[currentSelections.regionIndex]
            }));


        const barChartTitle = d3.select('#app2-info')
            .select('h3')
            .text(regions[currentSelections.regionIndex].name);

        const barChartSvg = d3.select('#app2-info').select('svg');
        const svg = {
            xAxis: barChartSvg.select('#xAxis'),
            yAxis: barChartSvg.select('#yAxis'),
            bars: barChartSvg.select('#bars')
        }
        const tip = d3.tip()
            .attr('class', 'tip')
            .html(d => formatter.format(d.datum));
        barChartSvg.call(tip);

        const svgBounds = barChartSvg.node().getBoundingClientRect();
        const padding = { top: 20, right: 20, bottom: 100, left: 70 };
        const barSpacing = 50;

        const chartSize = {
            width: svgBounds.width - padding.left - padding.right,
            height: svgBounds.height - padding.top - padding.bottom
        }
        const scales = createScales(chartSize, barChartData);
        createAxis(svg, scales, chartSize, padding);

        const rects = svg.bars.selectAll('rect').data(barChartData);

        rects.enter()
            .append('rect')
            .merge(rects)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .attr('class', 'bar')
            .attr('transform', 'translate(' + padding.left + ',' + padding.top + ' )')
            .attr('x', d => scales.x(d.year) + (barSpacing / 2))
            .attr('y', d => scales.y(d.datum))
            .attr('width', scales.x.bandwidth() - barSpacing)
            .attr('height', d => chartSize.height - scales.y(d.datum))
            .style('fill', d => scales.color(d.datum))

        rects.exit()
            .transition()
            .remove();

    }

    function createScales(size, data) {
        const x = d3.scaleBand().rangeRound([0, size.width]),
            y = d3.scaleLinear().rangeRound([size.height, 0]),
            color = d3.scaleLinear();

        x.domain(data.map(d => d.year));
        y.domain([d3.min(data, d => d.datum) * 0.5, d3.max(data, d => d.datum)]);
        color.domain([0, d3.max(data, d => d.datum)])
            .interpolate(d3.interpolateLab)
            .range([d3.rgb('#ffffbf'), d3.rgb('#009900')])

        return { x, y, color }
    }


    function createAxis(svg, scales, size, padding) {
        svg.xAxis
            .transition()
            .attr('transform', 'translate(' + padding.left + ',' + (padding.top + size.height) + ' )')
            .call(d3.axisBottom(scales.x))
            .selectAll('text')
            .attr('y', 0)
            .attr('x', -9)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(270)')
            .style('text-anchor', 'end');

        svg.yAxis
            .transition()
            .attr('transform', 'translate(' + padding.left + ',' + padding.top + ' )')
            .call(d3.axisLeft(scales.y));
    }


    function getRegion(d) {
        return regions.find(r => r.cod === d.properties.COD_REG);
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