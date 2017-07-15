const app = {
    data: null,
    externalData: null,
    init: async function () {
        function readJson(url) {
            return new Promise((resolve, reject) => {
                d3.json(url, (error, data) => {
                    if (error)
                        return reject(error);
                    resolve(data);
                });
            });
        }

        const jobMarketData = await readJson("data/app1.json");
        const events = await readJson("data/events.json");
        const reforms = await readJson("data/reforms.json");
        const legislatures = await readJson("data/legislatures.json");

        const controlsSelctor = '#app1controls input[type=radio], #app1controls input[type=checkbox]';
        const controls = document.querySelectorAll(controlsSelctor);

        controls.forEach(b => b.addEventListener('click', () => {
            app.checkAllowedControls();
            app.drawCharts();
        }));

        app.data = jobMarketData;
        app.externalData = {
            events: events,
            reforms: reforms,
            legislatures: legislatures,
            none: []
        };
        app.checkAllowedControls();
        app.drawCharts();

    },
    checkAllowedControls: function () {
        const notAllowedTable = {
            relative: ['rescale'],
            lines: ['gender']
        };
        const options = app.getOptions();
        const controlsSelctor = '#app1controls input[type=radio], #app1controls input[type=checkbox]';
        const controls = [...document.querySelectorAll(controlsSelctor)];
        controls.forEach(c => {
            c.disabled = false;
            c.parentNode.classList.remove('disabled');
        });
        const notAllowedValues = notAllowedTable[options.vistype];
        if (notAllowedValues)
            controls.filter(c => notAllowedValues.includes(c.name)).forEach(c => {
                c.disabled = true;
                c.parentNode.classList.add('disabled');
            });
    },
    getOptions: function () {
        function groupBy(xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };

        const radioButtons = [...document.querySelectorAll('#app1controls input[type=radio]')];
        const radioGroups = groupBy(radioButtons, 'name');
        const checkboxes = [...document.querySelectorAll('#app1controls input[type=checkbox]')];
        const options = {};
        Object.keys(radioGroups).forEach(g => {
            const selectedButton = radioGroups[g].find(b => b.checked);
            options[selectedButton.name] = selectedButton.value;
            const dataset = selectedButton.dataset;
        });
        checkboxes.forEach(c => {
            options[c.name] = c.checked;
        });
        return options;
    },
    drawCharts: function () {
        function getMaleWorkforce(r) {
            return r.maleOccupied + r.maleNotOccupied;
        }
        function getFemaleWorkforce(r) {
            return r.femaleOccupied + r.femaleNotOccupied;
        }
        function getWorkforce(r) {
            return getMaleWorkforce(r) + getFemaleWorkforce(r);
        }
        function getMalePopulation(r) {
            const maleWorkforce = getMaleWorkforce(r);
            return population = maleWorkforce + r.maleNotWorkforce;
        }
        function getFemalePopulation(r) {
            const femaleWorkforce = getFemaleWorkforce(r);
            return population = femaleWorkforce + r.femaleNotWorkforce;
        }
        function getPopulation(r) {
            const malePopulation = getMalePopulation(r);
            const femalePopulation = getFemalePopulation(r);
            return malePopulation + femalePopulation;
        }
        function getMaleActivityRate(r) {
            const maleWorkforce = getMaleWorkforce(r)
            const population = getPopulation(r)
            return maleWorkforce / population;
        }
        function getFemaleActivityRate(r) {
            const femaleWorkforce = getFemaleWorkforce(r);
            const population = getPopulation(r)
            return femaleWorkforce / population;
        }
        function getMaleEmploymentRate(r) {
            const population = getPopulation(r)
            return r.maleOccupied / population;
        }
        function getFemaleEmploymentRate(r) {
            const population = getPopulation(r)
            return r.femaleOccupied / population;
        }
        function getMaleUnemploymentRate(r) {
            const workforce = getWorkforce(r)
            return r.maleNotOccupied / workforce;
        }
        function getFemaleUnemploymentRate(r) {
            const workforce = getWorkforce(r)
            return r.femaleNotOccupied / workforce;
        }

        const rawData = app.data;
        const jobMarketData = rawData.map(r => ({
            year: r.year,
            activityRate: {
                male: getMaleActivityRate(r),
                female: getFemaleActivityRate(r)
            },
            employmentRate: {
                male: getMaleEmploymentRate(r),
                female: getFemaleEmploymentRate(r)
            },
            unemploymentRate: {
                male: getMaleUnemploymentRate(r),
                female: getFemaleUnemploymentRate(r)
            }
        }));

        const options = app.getOptions();
        const timelineData = app.externalData[options.timelineData];
        const f = options.maindata;
        const isAbsolute = options.vistype == 'absolute';
        const isLines = options.vistype == 'lines';
        const rescale = options.rescale;
        const maleFocused = options.gender == 'male';
        const gendersTmp = ['male', 'female'];
        const colors = { male: 'skyblue', female: 'pink', all: 'lightgrey' };
        const genders = maleFocused ? gendersTmp : gendersTmp.reverse();
        const [gender, otherGender] = genders;
        const n = jobMarketData.length;
        const minYear = d3.min(jobMarketData.map(r => r.year));
        const maxYear = d3.max(jobMarketData.map(r => r.year));
        const xpad = 100;
        const yBottomPad = 100;
        const yTopPad = 10;

        const svgBounds = d3.select("#app1chart").node().getBoundingClientRect();
        const svgHeight = svgBounds.height;
        const svgWidth = svgBounds.width;
        const H = svgHeight - yTopPad - yBottomPad;
        const W = svgWidth - xpad;
        const legendHeight = 50;
        const legendWidth = W;
        const labelLength = 42;
        const transitionDuration = 600;
        const legendElementWidth = 80;

        const areaDataset = jobMarketData.map(r => ({
            year: r.year,
            [gender]: isAbsolute ? r[f][gender] : r[f][gender] / (r[f][gender] + r[f][otherGender]),
            [otherGender]: isAbsolute ? r[f][otherGender] : r[f][otherGender] / (r[f][gender] + r[f][otherGender])
        }));

        const lineDataset = [
            jobMarketData.map(r => ({ year: r.year, val: r[f][gender] })),
            jobMarketData.map(r => ({ year: r.year, val: r[f][otherGender] })),
            jobMarketData.map(r => ({ year: r.year, val: r[f][gender] + r[f][otherGender] }))
        ];
        lineDataset[0].key = gender;
        lineDataset[1].key = otherGender;
        lineDataset[2].key = 'all';


        const rescalingFactor = 1.2;
        const lineDatasetValues = lineDataset.map(d => d3.max(d.map(r => r.val)));
        const areaDatasetValues = areaDataset.map(r => r[gender] + r[otherGender]);
        const maxVal = d3.max(isLines ? lineDatasetValues : areaDatasetValues);
        const yMax = rescale ? Math.min(maxVal * rescalingFactor, 1) : 1;

        if (d3.select('#app1chart').selectAll('svg').empty()) {

            d3.select('#app1chart')
                .append('svg')
                .attr('class', 'legend')
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .attr("transform", `translate(${xpad}, 0)`);

            const mainChart = d3.select('#app1chart')
                .append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight);

            const mainBox = mainChart
                .append('g')
                .attr('class', 'box')
                .attr("transform", `translate(${xpad}, ${yTopPad})`);

            mainChart.append('g')
                .attr('class', 'xAxis')
                .attr("transform", `translate(${xpad},${H + yTopPad})`);

            mainChart.append('g')
                .attr('class', 'yAxis')
                .attr("transform", `translate(${xpad}, ${yTopPad})`);

            mainBox
                .append('g')
                .attr('class', 'chart');

            mainBox
                .append('g')
                .attr('class', 'timeline');

            mainBox
                .append('rect')
                .attr('class', 'border')
                .attr('width', W)
                .attr('height', H)
        }

        const xScale = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([0, W]);

        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([H, 0]);

        const xAxis = d3.axisBottom(xScale)
            .ticks(n)
            .tickFormat(d3.format("d"));

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d3.format(".0%"));

        d3.select(".xAxis")
            .call(xAxis)
            .selectAll('text')
            .attr("transform", "rotate(300)")
            .attr('dx', -34)
            .attr('dy', 4)
            .style("text-anchor", "start");

        d3.select('.yAxis')
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeQuad)
            .call(yAxis);

        const area = d3.area()
            .x(d => xScale(d.data.year))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));

        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.val));

        const stack = d3.stack().keys(genders).offset(d3.stackOffsetNone);

        const layers = stack(areaDataset)

        const plottableData = isLines ? lineDataset : layers;

        const legendData = plottableData
            .map(d => ({ key: d.key, color: colors[d.key] }))
            .sort((a, b) => {
                if (a.key < b.key)
                    return 1;
                if (a.key > b.key)
                    return -1;
                return -0;
            });

        const chartLines = d3.select("#app1chart")
            .select('.chart')
            .selectAll('path')
            .data(plottableData);

        chartLines.exit()
            .remove();

        chartLines.enter()
            .append('path');

        d3.select("#app1chart")
            .select('.chart')
            .selectAll('path')
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeQuad)
            .attr('stroke', d => colors[d.key])
            .attr('stroke-width', 2)
            .attr('fill', d => colors[d.key])
            .attr('fill-opacity', isLines ? 0 : 1)
            .attr('stroke-opacity', 1)
            .attr('d', isLines ? line : area);

        const timelineChart = d3.select("#app1chart")
            .select('.timeline')
            .selectAll('g')
            .data(timelineData);

        timelineChart.exit()
            .remove();

        const timelineGroups = timelineChart
            .enter()
            .append('g');

        timelineGroups.append('line');
        timelineGroups.append('text');

        d3.select("#app1chart")
            .select('.timeline')
            .selectAll('g')
            .select('line')
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeQuad)
            .attr("x1", d => xScale(d.year))
            .attr("y1", 0)
            .attr("x2", d => xScale(d.year))
            .attr("y2", H);

        d3.select("#app1chart")
            .select('.timeline')
            .selectAll('g')
            .select('text')
            .attr("transform", "rotate(90)")
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeQuad)
            .attr('x', 5)
            .attr("y", d => -2 - xScale(d.year))
            .text(d => d.year + ": " + d.event);

        const legendChart = d3.select("#app1chart")
            .select('.legend')
            .selectAll('g')
            .data(legendData);

        legendChart.exit()
            .remove();


        const legendGroups = legendChart
            .enter()
            .append('g');

        legendGroups.append('text');
        legendGroups.append('rect');

        d3.select("#app1chart")
            .select('.legend')
            .selectAll('g')
            .select('text')
            .attr('x', (d, i) => i * legendElementWidth)
            .attr("y", legendHeight / 2)
            .text(d => d.key);

        d3.select("#app1chart")
            .select('.legend')
            .selectAll('g')
            .select('rect')
            .attr('x', (d, i) => i * legendElementWidth + legendElementWidth / 2)
            .attr("y", legendHeight / 2 - 15)
            .attr('width', 20)
            .attr("height", 20)
            .attr('fill', d => d.color);

    }
};

window.addEventListener('load', () => app.init());