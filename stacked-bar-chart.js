const students = d3.csv("student_data_cleaned.csv");

const tooltip = d3
	.select("#tooltip")
	.style("background", "#fff")
	.style("border", "1px solid #ddd")
	.style("padding", "6px 10px")
	.style("font-size", "12px")
	.style("color", "#333");

// define width, height, margins, and svg container
const width = 750;
const height = 550;

const margin = {
	top: 50,
	bottom: 50,
	left: 50,
	right: 50,
};

const svg = d3
	.select("#stacked-bar-chart")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("background", "#e0f1f6");

// grouping function based on dropdown selection
function renderChart(grouping) {
	svg.selectAll("*").remove();

	// bind data to chart
	students.then(function (data) {
		// convert strings to numbers in relevant columns
		data.forEach(function (d) {
			d.Study_Hours_Per_Day = +d.Study_Hours_Per_Day;
			d.Sleep_Hours_Per_Day = +d.Sleep_Hours_Per_Day;
			d.Social_Hours_Per_Day = +d.Social_Hours_Per_Day;
		});

		// group average hours by major or major type
		const avgByMajor = d3
			.rollups(
				data,
				(v) => ({
					avgStudy: d3.mean(v, (d) => d.Study_Hours_Per_Day),
					avgSleep: d3.mean(v, (d) => d.Sleep_Hours_Per_Day),
					avgSocial: d3.mean(v, (d) => d.Social_Hours_Per_Day),
				}),
				grouping === "major" ? (d) => d.Major : (d) => d.Major_Type,
			)
			.map(([major, avgs]) => ({ major, ...avgs }));

		const sortedOrder = [
			"Business",
			"Computer Science",
			"Economics",
			"Engineering",
			"Mathematics",
			"Psychology",
		];

		avgByMajor.sort(
			(a, b) => sortedOrder.indexOf(a.major) - sortedOrder.indexOf(b.major),
		);

		// x and y scales + axes
		const xScale = d3
			.scaleBand()
			.domain(avgByMajor.map((d) => d.major))
			.range([margin.left, width - margin.right])
			.padding(0.5);

		const yScale = d3
			.scaleLinear()
			.domain([
				0,
				d3.max(avgByMajor, (d) => d.avgStudy + d.avgSleep + d.avgSocial),
			])
			.range([height - margin.bottom, margin.top]);

		const xAxis = svg
			.append("g")
			.call(d3.axisBottom().scale(xScale))
			.attr("transform", `translate(0, ${height - margin.bottom})`);

		const yAxis = svg
			.append("g")
			.call(d3.axisLeft().scale(yScale))
			.attr("transform", `translate(${margin.left}, 0)`);

		// create stacks for each category
		const keys = ["avgStudy", "avgSleep", "avgSocial"];
		const stackedAvgs = d3.stack().keys(keys)(avgByMajor);

		const color = d3
			.scaleOrdinal()
			.domain(keys)
			.range(["#1f77b4", "#531fb4", "#b41f80"]);

		// add bars to svg container
		const bars = svg
			.selectAll("g.layer")
			.data(stackedAvgs)
			.enter()
			.append("g")
			.attr("class", "layer")
			.attr("fill", (d) => color(d.key))
			.selectAll("rect")
			.data((d) => d)
			.enter()
			.append("rect")
			.attr("x", (d) => xScale(d.data.major))
			.attr("y", (d) => yScale(d[1]))
			.attr("height", (d) => yScale(d[0]) - yScale(d[1]))
			.attr("width", xScale.bandwidth());

		// tooltip displays when hovering
		bars
			.on("mouseover", function (event, d) {
				tooltip
					.html(
						`<div><strong>Social hours:</strong> ${d.data.avgSocial.toFixed(2)}</div>
					<div><strong>Sleep hours:</strong> ${d.data.avgSleep.toFixed(2)}</div>
					<div><strong>Study hours:</strong> ${d.data.avgStudy.toFixed(2)}</div>`,
					)
					.style("display", "block")
					.style("left", event.pageX + 14 + "px")
					.style("top", event.pageY - 40 + "px");
				d3.select(this);
			})
			.on("mousemove", function (event) {
				tooltip
					.style("left", event.pageX + 14 + "px")
					.style("top", event.pageY - 40 + "px");
			})
			.on("mouseout", function () {
				tooltip.style("display", "none");
				d3.select(this);
			});

		// x and y axis labels
		const xLabel = svg
			.append("text")
			.attr("x", width / 2)
			.attr("y", height - margin.top + 40)
			.style("text-anchor", "middle")
			.text("Major");

		const yLabel = svg
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", 0 - height / 2)
			.attr("y", margin.left / 3)
			.style("text-anchor", "middle")
			.text("Average daily hours");

		// legend
		const legend = svg
			.append("g")
			.attr("transform", `translate(${width - 70}, ${margin.top})`);

		keys.forEach((key, i) => {
			legend
				.append("rect")
				.attr("x", 0)
				.attr("y", i * 20)
				.attr("width", 15)
				.attr("height", 15)
				.attr("fill", (d) => color(key));

			legend
				.append("text")
				.attr("x", 20)
				.attr("y", i * 20 + 12)
				.text(key.slice(3))
				.style("font-size", "12px")
				.attr("alignment-baseline", "middle");
		});
	});
}

renderChart("major");
