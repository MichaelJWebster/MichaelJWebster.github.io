define(["jquery", "d3", "underscore"], function($, d3, _) {

    var jsRepl = require('util/jsRepl');
    var linRegPage = {};
    linRegPage.doPage = function()
    {
	console.log("In linRegPage.js");
	var csvDataFile = "../js/Galton.csv";

	d3.csv(csvDataFile, function(data) {
	    setupInitialTables(data);
	});
    };
    $(document).on("load", linRegPage.doPage());

    function setupInitialTables(data) {
	linRegPage.origData = data;	
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
	repl.writeString("Javascript Repl:\n");
	repl.sendObject(linRegPage.maleData[0]);
    }
    return linRegPage;  
});

