(function () {
    'use strict';

    const data = {};
    let regions = [];
    let populations = [];
    let italyMap = {};
    let years = [];
    let colorScale;
    const charts = [
        'hirings',
        'terminations',
        'hirings/terminations',
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

    async function init() {
        await loadData();
        initTitle();
        initCmds();
        initMap();
        initBarChart();
        update();
    }

    async function loadData() {
        const jsonData = await readJson('data/app2.json');
        const regionsCodes = await readJson('data/regions-codes.json');
        const regionsPopulation = await readJson('data/regions-population.json');
        const jsonItaly = await readJson('data/italy.json');

        data.hirings = jsonData.hirings;
        data.voucher = jsonData.voucher;
        data.terminations = jsonData.terminations;
        years = jsonData.years;

        regions = regionsCodes;
        populations = regionsPopulation;
        italyMap = jsonItaly;

        data['hirings/terminations'] = jsonData.hirings.map(h =>
            ({
                year: h.year,
                data: jsonData.terminations
                    .find(d => d.year === h.year)
                    .data.map((d, i) => h.data[i] / d)
            })
        );
    }

    function initTitle() {
        d3.select('#app2-title')
            .append('h3')
            .text(currentSelections.chart);
    }

    function initMap() {
        const svg = d3.select('#app2-map')
            .append('svg')
            .attr('width', mapSizes.width)
            .attr('height', mapSizes.height);

        svg.append('g')
            .attr('id', 'map-graph');

        svg.append('g')
            .attr('id', 'map-legend');
    }

    function initBarChart() {
        d3.select('#app2-info')
            .append('h3')
            .text('info');

        const svg = d3.select('#app2-info')
            .append('svg')
            .attr('width', barChartSizes.width)
            .attr('height', barChartSizes.height);


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


        updateColorScale();
        updateLegend();
        updateMap();
        updateBarChart();
    }

    function updateColorScale() {
        const data = getCurrentData(true);

        colorScale = d3.scaleLinear()
            .domain([d3.min(data), d3.max(data)])
            .interpolate(d3.interpolateLab)
            .range([d3.rgb('#ffffbf'), d3.rgb('#009900')]);
    }

    function updateLegend() {
        const legendSvg = d3.select('#map-legend');
        const currentData = getCurrentData(true);
        const min = d3.min(currentData);
        const max = d3.max(currentData);
        const legendCount = 5;
        const legendColorSize = { width: 20, height: 20 };
        const legendPosition = { x: 450, y: 10 };
        const legendTextPadding = 4;

        const range = d3.range(min, max, (max - min) / legendCount);

        legendSvg.selectAll('*').remove();

        const legends = legendSvg.selectAll('g')
            .data(range)
            .enter()
            .append('g');

        legends.append('text')
            .attr('text-anchor', 'end')
            .attr('x', legendPosition.x)
            .attr('y', (d, i) => (i + 1) * legendColorSize.height + legendPosition.y - legendTextPadding)
            .text(d => d.toPrecision(7));

        legends.append('rect')
            .attr('x', legendPosition.x)
            .attr('y', (d, i) => i * legendColorSize.height + legendPosition.y)
            .attr('width', legendColorSize.width)
            .attr('height', legendColorSize.height)
            .style('fill', d => colorScale(d));
    }

    function updateMap() {
        const currentData = getCurrentData();
        const topoMap = topojson.feature(italyMap, italyMap.objects.reg2011).features;

        const map = d3.select('#map-graph');

        const projection = d3.geoMercator()
            .scale(2000)
            .translate([-167, 1880]);
        const path = d3.geoPath()
            .projection(projection);

        const reg = map.selectAll('.region')
            .data(topoMap);

        const tip = d3.tip()
            .attr('class', 'tip')
            .html(d => getRegion(d).name + '<br>' + formatter.format(getData(d)));
        map.call(tip);

        reg.enter()
            .append('path')
            .attr('class', 'region')
            .attr('d', path)
            .merge(reg)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition().duration(400)
            .style('fill', d => colorScale(getData(d)));

        map.selectAll('.region')
            .on('click', reg => {
                d3.event.stopPropagation();
                currentSelections.regionIndex = reg.properties.COD_REG - 1;
                updateBarChart();
            });

        d3.select('#app2-map')
            .select('svg')
            .on('click', reg => {
                currentSelections.regionIndex = italyIndex;
                updateBarChart();
            });

        function getData(d) {
            return currentData[d.properties.COD_REG - 1];
        }
    }

    function getCurrentData(removeTotals) {
        const y = getNum(currentSelections.year);
        let dataSelected = data[currentSelections.chart].find(d => d.year === y).data;

        if (removeTotals)
            dataSelected = dataSelected.slice(0, dataSelected.length - 1);

        if (currentSelections.normalized) {
            const population = populations.find(p => p.year === y).data;
            return dataSelected.map((d, i) => d / population[i]);
        }

        return dataSelected;
    }

    function updateBarChart() {
        const ri = currentSelections.regionIndex;
        const barChartData = data[currentSelections.chart]
            .map(yd => {
                const year = yd.year;
                let datum = yd.data[ri];
                if (currentSelections.normalized) {
                    const pop = populations.find(p => p.year === year).data[ri];
                    datum = datum / pop;
                }
                return { year, datum };
            });

        const barChartTitle = d3.select('#app2-info')
            .select('h3')
            .text(regions[ri].name);

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
            .style('fill', d => scales.color(d.datum));

        rects.exit()
            .transition()
            .remove();

        function createScales(size, data) {
            const x = d3.scaleBand().rangeRound([0, size.width]),
                y = d3.scaleLinear().rangeRound([size.height, 0]),
                color = d3.scaleLinear();

            x.domain(data.map(d => d.year));
            y.domain([d3.min(data, d => d.datum) * 0.5, d3.max(data, d => d.datum)]);
            color.domain([0, d3.max(data, d => d.datum)])
                .interpolate(d3.interpolateLab)
                .range([d3.rgb('#aaaaaa'), d3.rgb('#444444')]);

            return { x, y, color };
        }
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

    function readJson(url) {
        return new Promise((resolve, reject) => {
            d3.json(url, (error, data) => {
                if (error)
                    return reject(error);
                resolve(data);
            });
        });
    }


    d3.select(window).on('load', init);

})();