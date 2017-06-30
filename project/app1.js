const app = {
    data: null,
    init: function () {
        d3.json("data/app1.json", function (error, jobMarketData) {
            if (error) {
                console.log(error);
                throw error;
            }

            const radioButtons = document.querySelectorAll('#app1controls input[type=radio]');

            radioButtons.forEach(b => b.addEventListener('click', () => app.drawCharts()));

            app.data = jobMarketData;
            app.drawCharts();
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
        const options = {};
        Object.keys(radioGroups).forEach(g => {
            const selectedButton = radioGroups[g].find(b => b.checked);
            options[selectedButton['name']] = selectedButton['value'];
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
        function getRelativeMaleActivityRate(r) {
            const maleActivityRate = getMaleActivityRate(r);
            const activityRate = getActivityRate(r);
            return maleActivityRate / activityRate;
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
            return r.maleOccupied / workforce;
        }
        function getFemaleUnemploymentRate(r) {
            const workforce = getWorkforce(r)
            return r.femaleOccupied / workforce;
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
        const f = options.maindata;
        const n = jobMarketData.length;
        const minYear = d3.min(jobMarketData.map(r => r.year));
        const maxYear = d3.max(jobMarketData.map(r => r.year));
        const xpad = 100;
        const ypad = 70;

        if (d3.select('#app1mainchart').select('svg').empty()) {
            const mainChart = d3.select('#app1mainchart').append('svg');
            mainChart
                .append('g')
                .attr('class', 'chart')
                .attr("transform", `translate(${xpad},0)`);
            mainChart.append('g')
                .attr('class', 'xAxis');
            mainChart.append('g')
                .attr('class', 'yAxis');
        }

        const svgBounds = d3.select("#app1mainchart").select('svg').node().getBoundingClientRect();
        const heigth = svgBounds.height;
        const width = svgBounds.width;
        const H = heigth - ypad;
        const W = width - xpad;
        const labelLength = 42;
        const transitionDuration = 600;

        const xScale = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([0, W]);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([H, 0]);

        const xAxis = d3.axisBottom(xScale)
            .ticks(n);

        const yAxis = d3.axisLeft(yScale);

        d3.select(".xAxis")
            .attr("transform", `translate(${xpad},${H})`)
            .call(xAxis)
            .selectAll('text')
            .attr("transform", "rotate(270)")
            .attr('dx', -labelLength)
            .attr('dy', - W / n / 4)
            .style("text-anchor", "start");

        d3.select('.yAxis')
            .attr("transform", `translate(${xpad},0)`)
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeQuad)
            .call(yAxis);

        var maleAreaGenerator = d3.area()
            .x(d => xScale(d.year))
            .y0(yScale(0))
            .y1(d => yScale(options.vistype == 'absolute' ? d[f].male : (d[f].male + d[f].female)));


        var femaleAreaGenerator = d3.area()
            .x(d => xScale(d.year))
            .y0(d => yScale(options.vistype == 'absolute' ? d[f].male : (d[f].male + d[f].female)))
            .y1(d => yScale(options.vistype == 'absolute' ? d[f].male + d[f].female : 1));

        d3.select("#app1mainchart")
            .select('.chart')
            .selectAll('path')
            .remove();

        d3.select("#app1mainchart")
            .select('.chart')
            .append("path")
            .classed('male', true)
            .attr('d', maleAreaGenerator(jobMarketData));

        d3.select("#app1mainchart")
            .select('.chart')
            .append("path")
            .classed('female', true)
            .attr('d', femaleAreaGenerator(jobMarketData));

    }
};

window.addEventListener('load', () => app.init());