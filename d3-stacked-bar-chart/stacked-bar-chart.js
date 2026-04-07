const students = d3.csv("student_data_cleaned.csv");

const width = 800;
const height = 600;

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

const xScale = d3
	.scaleBand()
	.domain(students.map((d) => d.Major))
	.range([margin.left, width - margin.right])
	.padding(0.5);

const yScale = d3
	.scaleLinear()
	.domain([
		0,
		d3.max(
			students,
			(d) => d.Study_Hours_Per_Day + d.Sleep_Hours + d.Social_Hours_Week,
		),
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
