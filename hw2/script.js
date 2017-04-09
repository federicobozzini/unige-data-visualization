/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it

function staircase() {
    const staircaseChart = document.getElementById("firstBarChart");
    const rects = [...staircaseChart.children[0].children];
    rects.forEach((r, i) => {
        r.setAttribute('width', '1');
        r.setAttribute('height', (i+1) * 6);
        r.setAttribute('x', i);
        r.setAttribute('y', 0);
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

    // Set up the scales
    var aScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 150]);
    var bScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 150]);
    var iScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, 110]);
    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars
    d3.select(".barChart").selectAll("svg").attr("viewBox", "0 0 200 120");
    d3.select("#firstBarChart").selectAll("rect").attr('width', (d, i) => aScale(data[i].a));

    // TODO: Select and update the 'b' bar chart bars
    d3.select("#secondBarChart").selectAll("rect").attr('width', (d, i) => aScale(data[i].b));

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    // TODO: Select and update the 'b' line chart path (create your own generator)

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    // TODO: Select and update the 'b' area chart path (create your own generator)

    // TODO: Select and update the scatterplot points

    // ****** TODO: PART IV ******
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
}

init();