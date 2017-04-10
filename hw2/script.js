/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it

function staircase() {
    const staircaseChart = document.getElementById("barChartA");
    const rects = [...staircaseChart.children];
    rects.forEach((r, i) => {
        r.setAttribute('width', '10');
        r.setAttribute('height', (i+1) * 9);
        r.setAttribute('x', 10 * i);
        r.setAttribute('y', 140 - (i+1) * 9);
    });
}

function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    const barHeight = 16;
    const barChartHeight = 16*data.length;
    // scale made absolute because of personal taste.
    const maxAVal = 15;
    const maxBVal = 15;

    // Set up the scales
    var aScale = d3.scaleLinear()
        .domain([0, 15])
        .range([0, 150]);
    var bScale = d3.scaleLinear()
        .domain([0, 15])
        .range([0, 150]);
    var iScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, barChartHeight]);
    // ****** TODO: PART III (you will also edit in PART V) ******

    // Remove the barChart viewbox and the g, they are no more necessary.
    d3.select(".barChart")
        .selectAll("svg")
        .attr("viewBox", null)
        .select('g')
        .remove();

    // TODO: Select and update the 'a' bar chart bars

    const barChartARects = d3.select("#barChartA")
        .selectAll("rect")
        .data(data);

    barChartARects
        .enter()
        .append('rect')
        .attr('width', d => aScale(d.a))
        .attr('height', d => barChartHeight/data.length)
        .attr('y', (d, i) => barChartHeight - iScale(i+1))
        .attr('x', (d, i) => 0);

    barChartARects
        .attr('width', d => aScale(d.a))
        .attr('height', d => barChartHeight/data.length)
        .attr('y', (d, i) => barChartHeight - iScale(i+1))
        .attr('x', (d, i) => 0);

    barChartARects.exit().remove();

    // TODO: Select and update the 'b' bar chart bars
    const barChartBRects = d3.select("#barChartB")
        .selectAll("rect")
        .data(data);

    barChartBRects
        .enter()
        .append('rect')
        .attr('width', d => bScale(d.b))
        .attr('height', d => barChartHeight/data.length)
        .attr('y', (d, i) => barChartHeight - iScale(i+1))
        .attr('x', (d, i) => 0);

    barChartBRects
        .attr('width', d => bScale(d.b))
        .attr('height', d => barChartHeight/data.length)
        .attr('y', (d, i) => barChartHeight - iScale(i+1))
        .attr('x', (d, i) => 0);

    barChartBRects.exit().remove();

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    // Remove the lineChart viewbox, it's no more necessary.
    d3.select(".lines")
        .selectAll("svg")
        .attr("viewBox", null)
        .selectAll("g")
        .attr("transform", "translate(0, 180), scale(1, -1)");

    d3.select("#lineChartA")
        .select("path")
	    .attr('d', aLineGenerator(data));

    // TODO: Select and update the 'b' line chart path (create your own generator)

    var bLineGenerator = d3.line()
        .x((d, i) => iScale(i))
        .y(d => aScale(d.b));

    d3.select("#lineChartB")
        .select("path")
	    .attr('d', bLineGenerator(data));


    d3.select(".areas")
        .selectAll("svg")
        .attr("viewBox", null)
        .selectAll("g")
        .attr("transform", "translate(0, 180), scale(1, -1)");

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    d3.select("#areaChartA")
        .select("path")
	    .attr('d', aAreaGenerator(data));

    // TODO: Select and update the 'b' area chart path (create your own generator)

    var bAreaGenerator = d3.area()
        .x((d, i) => iScale(i))
        .y0(0)
        .y1(d => aScale(d.b));

    d3.select("#areaChartB")
        .select("path")
	    .attr('d', bAreaGenerator(data));

    const satterPlotHeight = 200;
    d3.select(".scatterplot")
        .selectAll("svg")
        .attr("viewBox", null)
        .selectAll("g")
        .remove();
    
    // TODO: Select and update the scatterplot points

    const scatterplotPoints = d3.select("#scatterplotChart")
        .selectAll("circle")
        .data(data);

	scatterplotPoints
        .enter()
        .append('circle')
        .attr('cx', d => aScale(d.a))
	    .attr('cy', d => satterPlotHeight - aScale(d.b))
        .attr('r', 5);

	scatterplotPoints
        .attr('cx', d => aScale(d.a))
	    .attr('cy', d => satterPlotHeight - aScale(d.b))
        .attr('r', 5);

    scatterplotPoints.exit().remove();

    // ****** TODO: PART IV ******

    //Events

    //logging
    d3.select("#scatterplotChart")
        .selectAll("circle")
        .on('click', (d) => console.log(`a = ${d.a}, b = ${d.b}`));

    //tooltip

    d3.select("#scatterplotChart")
        .selectAll("circle")
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip);

    function showTooltip(d) {
        const tooltip = d3.select("body").append("div")	
            .attr("id", "tooltip")				
            .style("opacity", 1);
        tooltip.transition()		
            .duration(100)		
            .style("opacity", 1);		
        tooltip.html(`a = ${d.a}, b = ${d.b}`)	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
    }

    function hideTooltip(d) {
        const tooltip = d3.select("#tooltip");
        tooltip.remove();
    }

}

function changeData() {
    // // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        randomSubset();
    }
    else{
        d3.csv('data/' + dataFile + '.csv', update);
    }
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        d3.csv('data/' + dataFile + '.csv', function (error, data) {
            var subset = [];
            data.forEach(function (d) {
                if (Math.random() > 0.5) {
                    subset.push(d);
                }
            });
            update(error, subset);
        });
    }
    else{
        changeData();
    }
}

function init() {
    const staircaseBtn = document.getElementById("staircase");
    const datasetSlt = document.getElementById("dataset");
    const randomCbx = document.getElementById("random");

    staircaseBtn.addEventListener("click", staircase);
    datasetSlt.addEventListener("change", changeData);
    randomCbx.addEventListener("change", randomSubset);

    changeData();
}


window.addEventListener('load', init);
