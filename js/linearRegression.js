define(["jquery", "d3", "underscore"], function($, d3, _) {

    var jsRepl = require('util/jsRepl');
    var mlUtil = require('util/mlUtil');
    var MdArray = require('util/MdArray');
    var linRegPage = {};
    linRegPage.doPage = function()
    {
	console.log("In linRegPage.js");
	var csvDataFile = "../js/Galton.csv";

	d3.csv(csvDataFile, function(data) {
	    setupInitialTables(data);
	    setupScatterPlots();
	    setupArrays();
	    setupRegression("Male", "Father");
	});
    };
    $(document).on("load", linRegPage.doPage());

    function setupScatterPlots() {
	var scatterMenuId = "#mfMenu";
	var scatterGraphId = "#mfSvg";
	linRegPage.maleDataShuffled = mlUtil.shuffleData(linRegPage.maleData);
	linRegPage.femaleDataShuffled = mlUtil.shuffleData(linRegPage.femaleData);
	var maleDataSets = mlUtil.divideData(linRegPage.maleDataShuffled, [60, 20, 20]);
	linRegPage.maleTrain = maleDataSets[0];
	linRegPage.maleCv = maleDataSets[1];
	linRegPage.maleTest = maleDataSets[2];
	var femaleDataSets = mlUtil.divideData(linRegPage.femaleDataShuffled, [60, 20, 20]);
	linRegPage.femaleTrain = femaleDataSets[0];
	linRegPage.femaleCv = femaleDataSets[1];
	linRegPage.femaleTest = femaleDataSets[2];	
	var maleScatter = {
	    dataName : "Male Child Height Data",
	    dataNameShort : "Child Height M",
	    dataSet : [
		{ label: "Male Training Data", d: linRegPage.maleTrain,
		     shortLabel: "M Training"},
		{ label: "Male Cross Validation Data", d:linRegPage.maleCv,
		  shortLabel: "M Cross Validation"},
		{ label: "Male Test Data", d:linRegPage.maleTest,
		  shortLabel: "M Test"}
	    ]
	};
	var femaleScatter = {
	    dataName : "Female Child Height Data",
	    dataNameShort : "Child Height F",
	    dataSet : [
		{ label: "Female Training Data", d: linRegPage.femaleTrain,
		  shortLabel: "F Training"},
		{ label: "Female Cross Validation Data", d:linRegPage.femaleCv,
		  shortLabel: "F Cross Validation"},
		{ label: "Female Test Data", d:linRegPage.femaleTest,
		  shortLabel: "F Test"}
	    ]
	};
	xLabel = "Father's Height in inches.";
	yLabel = "Child Height in inches.";
	var scatterPlots = mlUtil.createScatterPlots
	(
	    scatterMenuId,
	    scatterGraphId,
	    maleScatter,
	    femaleScatter,
	    xLabel,
	    yLabel
	);
    }

    function setupRegression(childSex, parent) {
	var xData = [];
	var yData = [];
	
	if (childSex === "Male") {
	    yData = linRegPage.heightMale;
	    xData = linRegPage.fatherDataMale.concat(linRegPage.motherDataMale);
	}
	else {
	    yData = linRegPage.heightFemale;
	    xData = linRegPage.fatherDataFemale.concat(linRegPage.motherDataFemale);
	}

	var xRows = xData.length/2;
	var yRows = yData.length;
	assert(xRows === yRows,
	       "Cannot perform linear regression with different length X and Y vectors.");
	       
	// Create X as an MdArray containing a row for each of the female and male parent
	// data.
	var X = new MdArray({data: xData, shape: [2, xRows]});

	// Transpose the array to change it to having a column for the male parent heights
	// and another for the female parent heights.
	X = X.T();

	// Create Y as an xLength Md Array containing the yData.
	var Y = new MdArray({data: yData, shape: [yRows, 1]});

	// We should now have X and Y representing the data we've been given. It
	// remains to append a column of 1's to X.
	X = X.addOnes();

	// Create a theta array of all ones.
	var theta = MdArray.ones({shape : [X.dims[1], 1]});

	// Get predictions
	var predictions = getPrediction(X, theta);

	regLinGrad(X, Y, theta);
    }

    /**
     * For each row in X, return the prediction resulting from dotting it with
     * theta.
     *
     * @param X      An MdArray containing the same number of columns as theta has
     *               rows, and containing 1 row for each example we're getting a
     *               prediction for.
     * @param theta  A theta array with the same number of rows as X has columns.
     *
     * @returns The value of X.theta.
     */
    function getPrediction(X, theta) {
	return X.dot(theta);
    };

    /**
     * Linear regression cost function.
     *
     * @param theta    The current value for theta.
     * @param X        The array of features for each example.
     * @param Y        The observed values for our target variable.
     *
     * @returns  The cost for the given theta.
     */
    function costFn(theta, X, Y) {
	// The number of examples is the number of rows in our X or Y vectors.
	var numExamples = X.dims[0];

	var hypothesis = getPrediction(X, theta);
	var diff_vector = hypothesis.sub(Y);
	var cost_val = (2 / numExamples) * (diff_vector.square()).sum();
	return cost_val;
    }

    /**
     * 
     */
    function regLinGrad(X, Y, theta) {
	var m = X.dims[0];

	// Create a grad MdArray as a vector of zeros of the same size as theta.
	var grad = MdArray.zeros({shape: theta.dims});

	// Get the current hypothesis
	var currentHyp = getPrediction(X, theta);

	// Get an MdArray of the differences between currentHyp and Y.
	var diff = currentHyp.sub(Y);

	//mainSum = ((h_theta - Y) * X[:, 1:]).sum(axis=0)
	var arrayProduct = diff.mul(X);
    }

    function setupArrays() {
	// Create our X and Y data arrays for each of the data sets, and for each
	// of father and mother.
	linRegPage.fatherDataMale = _.map(linRegPage.maleTrain, function(x) {
	    return x.Father;
	});
	linRegPage.motherDataMale = _.map(linRegPage.maleTrain, function(x) {
	    return x.Mother;
	});
	linRegPage.heightMale = _.map(linRegPage.maleTrain, function(x) {
	    return x.Height;
	});

	linRegPage.fatherDataFemale = _.map(linRegPage.femaleTrain, function(x) {
	    return x.Father;
	});
	linRegPage.motherDataFemale = _.map(linRegPage.femaleTrain, function(x) {
	    return x.Mother;
	});
	linRegPage.heightFemale = _.map(linRegPage.femaleTrain, function(x) {
	    return x.Height;
	});
    }

    function setupInitialTables(data) {
	linRegPage.origData = _.map(data, function(val) {
	    val.Father = Number(val.Father);
	    val.Mother = Number(val.Mother);
	    val.Height = Number(val.Height);
	    return val;
	});
	var tEl = $("#galtonTable");
	var mTEl = $("#maleTable");
	var fTEl = $("#femaleTable");
	linRegPage.galtonTable = tEl;
	linRegPage.maletable = mTEl;
	linRegPage.femaletable = fTEl;

	// Sort the data in the original data by family
	var sortBy = "Family";
	linRegPage.sorted = _.sortBy(linRegPage.origData, function(el) {
	    if (isNaN(el[sortBy]))
	    {
		return el[sortBy];
	    }
	    else
	    {
		return Number(el[sortBy]);
	    }
	});
	// transpose data in d - ie. turn columns into rows.	
	linRegPage.tableObject = transpose(linRegPage.sorted);
	createTable(tEl, linRegPage.sorted, linRegPage.tableObject);

	// Create second table with only male data.
	var maleData = _.filter(linRegPage.origData, function(rowObj) {
	    return rowObj.Gender === "M";
	});

	// Drop some columns.
	maleData = _.map(maleData, function(val) {
	    return _.pick(val, "Father", "Mother", "Height");
	});
	linRegPage.maleData = maleData;

	var maleTransposed = transpose(maleData);
	createTable(mTEl, maleData, maleTransposed);
	linRegPage.maleTransposed = maleTransposed;

	// Create third table with only female data.
	var femaleData = _.filter(linRegPage.origData, function(rowObj) {
	    return rowObj.Gender === "F";
	});
	femaleData = _.map(femaleData, function(val) {
	    return _.pick(val, "Father", "Mother", "Height");
	});
	linRegPage.femaleData = femaleData;
	var femaleTransposed = transpose(femaleData);
	linRegPage.femaleTransposed = femaleTransposed;
	createTable(fTEl, femaleData, femaleTransposed);

	runRepl1();
    }

    function createTable(tEl, sorted, tableObject) {
	
	// Empty the table
	tEl.empty();
	
	tEl.append("<table><thead><tr></tr></thead></table>");
	var elId = $(tEl).attr("id");
	var th = d3.select("#" + elId + " tr")
		.selectAll("th")
		.data(d3.keys(tableObject))
		.enter()
		.append("th")
		.append("a")
		.attr("href", "#")
		.text(function(d) { return d;});

	$("#" + elId + " th a").on("click", function(event) {
	    resort(event, sorted, tableObject);
	});

	$("#" + elId + " table").append("<tbody></tbody>");
	var tr = d3.select("#" + elId + " tbody")
		.selectAll("tr")
		.data(sorted)
		.enter()
		.append("tr");

	var td = tr.selectAll("td")
		.data(function(d) {
		    return _.values(d);
		})
		.enter()
		.append("td")
		.text(function(d) { return d;});
    }

    /**
     * Return the transpose of d.
     *
     * @param d   An array of objects.
     *
     * @return An object with the fields from the objects in d mapped to
     *         arrays of their values.
     */
    function transpose(d)
    {
	var table = {};
	_.each(d[0], function(el, k) {
	    table[k] = [];
	});
	_.each(d, function(data) {
	    _.each(data, function(el, k) {
		table[k].push(el);
	    });
	});
	return table;
    }

    /**
     * Event handler that recreates the table sorted by the value of the
     * element clicked on that invoked the event handler.
     *
     * @param event   The dom event.
     */
	var resort = function(event, data, tableObject) {
	event.preventDefault();
	var fieldName = event.target.textContent;
	var sorted = _.sortBy(data, function(el) {
	    if (isNaN(el[fieldName]))
	    {
		return el[fieldName];
	    }
	    else
	    {
		return Number(el[fieldName]);
	    }
	});	
	createTable($(event.target).closest("div"), sorted, tableObject);
    };

    function runRepl1() {
	var repl = jsRepl.getRepl($("#repl1"));
	repl.setDebug(true);
	repl.writeString("Male Height Data is:");
	repl.sendObject(linRegPage.maleData);
	// Close the web worker after some time.
	setTimeout(function() {repl.terminate();}, 1000);
    }

    /**
     * Raise an error if possible, when there is a violation of the expectations
     * of the ml-ndarray module.
     */
    function assert(condition, message) {
	'use strict';
	if (!condition) {
            message = message || "Assertion failed";
            if (typeof Error !== "undefined") {
		throw new Error(message);
            }
            throw message;
	}
    }
    return linRegPage;
    
});

