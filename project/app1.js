const app = {
    data: null,
    init: function () {
        d3.json("data/app1.json", function (error, jobMarketData) {
            if (error) {
                console.log(error);
                throw error;
            }

            app.drawCharts(jobMarketData);
        });
    },
    drawCharts: function (jobMarketData) {
        function getMaleWorkforce(r) {
            return population = r.maleOccupied + r.maleNotOccupied;
        }
        function getMalePopulation(r) {
            const maleWorkforce = getMaleWorkforce(r);
            return population = maleWorkforce + r.maleNotWorkforce;
        }
        function getFemaleWorkforce(r) {
            return population = r.femaleOccupied + r.femaleNotOccupied;
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
        function getActivityRate(r) {
            const maleWorkforce = getMaleWorkforce(r);
            const femaleWorkforce = getFemaleWorkforce(r);
            const workforce = maleWorkforce + femaleWorkforce;
            const population = getPopulation(r);
            return workforce / population;
        }
        const n = jobMarketData.length;
        const minYear = d3.min(jobMarketData.map(r => r.year));
        const maxYear = d3.max(jobMarketData.map(r => r.year));
        const xpad = 100;
        const ypad = 70;

        if (d3.select('#app1mainchart > svg').empty()) {
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
            .y1(d => yScale(getMaleActivityRate(d)));

        var femaleAreaGenerator = d3.area()
            .x(d => xScale(d.year))
            .y0(d => yScale(getMaleActivityRate(d)))
            .y1(d => yScale(getActivityRate(d)));

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

app.init();