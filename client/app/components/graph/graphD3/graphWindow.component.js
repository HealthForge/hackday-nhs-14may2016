import template from './graphD3.html';
import './graphD3.styl';
import d3 from 'd3';

let graphWindowComponent = function($compile, LabResultsService) {
	return {
		scope: {
		},
		restrict: 'E',
		template,
		link: function(scope, element, attrs) {
			var el = element[0].childNodes[0];
			LabResultsService.getSeries(attrs.data).then(function(seriesData) {
				var margin = {top: 30, right: 10, bottom: 60, left: 40},
					width = 960 - margin.left - margin.right,
					height = 160 - margin.top - margin.bottom,
					height2 = 170;


				var x = d3.time.scale().range([0, width]),
					x2 = d3.time.scale().range([0, width]),
					y = d3.scale.linear().range([height, 0]),
					y2 = d3.scale.linear().range([height2, 0]);

				var xAxis = d3.svg.axis().scale(x).orient("bottom");
				var x2Axis = d3.svg.axis().scale(x2).orient("bottom");

				var seriesLine = d3.svg.line()
					.x(function(d) { return x2(d.parsed); })
					.y(function(d) { return y2(d.value); });

				var brush = d3.svg.brush()
					.x(x)
					.on("brush", brushed);

				var svg = d3.select(el)
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom);

				var context = svg.append("g")
					.attr("class", "context")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var parseDate = d3.time.format("%Y-%m-%dT%H:%M").parse;
				seriesData.forEach(function(d) {
					d.parsed = parseDate(d.date);
					d.value = +d.value;
				});

				// Scale the range of the data
				x.domain(d3.extent(seriesData, function(d) { return d.parsed; }));
				y.domain(d3.extent(seriesData, function(d) { return d.value; }));
				x2.domain(x.domain());
				y2.domain(y.domain());

				var area = d3.svg.area()
					.interpolate("monotone")
					.x(function(d) { return x(d.parsed); })
					.y0(height)
					.y1(function(d) { return y(d.value); });

				svg.append("g")
					.attr("class", "x axis x2")
					.attr("transform", "translate(40,130)")
					.call(x2Axis);

				context.append("path")
					.datum(seriesData)
					.attr("class", "area")
					.attr("d", area);

				context.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

				context.append("g")
					.attr("class", "x brush")
					.call(brush)
					.selectAll("rect")
					.attr("y", -6)
					.attr("height", height + 7);

				function brushed() {
					x2.domain(brush.empty() ? x.domain() : brush.extent());
					d3.selectAll(".line").each(function(datum) {
						y2.domain(d3.extent(datum, function(d) { return d.value; }));
						d3.select(this).attr("d", seriesLine(datum))
					});
					svg.select(".x2").call(x2Axis);
				}

			});
		}
	};
};

graphWindowComponent.$inject = ['$compile', 'LabResultsService'];

export default graphWindowComponent;