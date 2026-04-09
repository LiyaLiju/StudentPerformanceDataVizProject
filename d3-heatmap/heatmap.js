// Data for the heatmap
const dataMajor = {
  cols: ["Business", "Computer Science", "Economics", "Engineering", "Mathematics", "Psychology"],
  rows: ["Study hours/day", "Sleep hours/night", "Social hours/day", "Attendance rate"],
  values: [
    [ 0.25,  0.27,  0.22,  0.27,  0.20,  0.19],
    [-0.04,  0.02,  0.01, -0.02, -0.00,  0.06],
    [-0.01,  0.01,  0.03, -0.05, -0.01, -0.01],
    [ 0.28,  0.32,  0.31,  0.27,  0.34,  0.31]
  ]
};

const dataAge = {
  cols: ["18", "19", "20", "21", "22", "23", "24"],
  rows: ["Study hours/day", "Sleep hours/night", "Social hours/day", "Attendance rate"],
  values: [
    [ 0.20,  0.29,  0.20,  0.27,  0.25,  0.20,  0.21],
    [-0.03,  0.05,  0.01,  0.03, -0.02,  0.03, -0.06],
    [ 0.01, -0.03,  0.02,  0.01,  0.08, -0.02, -0.11],
    [ 0.33,  0.32,  0.33,  0.27,  0.28,  0.33,  0.26]
  ]
};

// colors for the heatmap
const colorScale = d3.scaleDiverging()
    .interpolator(d3.interpolateRgbBasis(["#ca2c23", "#eeee2d", "#0aa84f"]))
    .domain([-0.15, 0.10, 0.35]);

// for switching between groups 
function render(groupKey) {
    const data = groupKey === "major" ? dataMajor : dataAge;

    d3.select("#heatmap-container").selectAll("*").remove();

    // layout 
    const margin = { top: 10, right: 20, bottom: 70, left: 160 };
    const cellH = 56;
    const minCellW = 90;
    const totalW = Math.max(data.cols.length * minCellW + margin.left + margin.right, 500);
    const cellW = (totalW - margin.left - margin.right) / data.cols.length;
    const totalH = data.rows.length * cellH + margin.top + margin.bottom;

    const svg = d3.select("#heatmap-container")
        .append("svg")
        .attr("width", "100%")
        .attr("viewBox", `0 0 ${totalW} ${totalH}`)
        .style("overflow", "visible");

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerW = totalW - margin.left - margin.right;
    const innerH = data.rows.length * cellH;

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerH / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("fill", "#555")
        .style("font-weight", "700")
        .text("Habit");

    const xScale = d3.scaleBand()
        .domain(data.cols)
        .range([0, innerW]);

    const yScale = d3.scaleBand()
        .domain(data.rows)
        .range([0, innerH]);

    // axes
    const xAxis = g.append("g")
        .attr("transform", `translate(0, ${innerH})`)
        .call(d3.axisBottom(xScale).tickSize(0));
    xAxis.select(".domain").remove();

    const yAxis = g.append("g")
        .call(d3.axisLeft(yScale).tickSize(0));
    yAxis.select(".domain").remove();

    g.selectAll(".tick text")
        .style("font-size", "12px");

    // tooltip
    tooltip = d3.select("#tooltip")
        .style("background", "#fff")
        .style("border", "1px solid #ddd")
        .style("padding", "6px 10px")
        .style("font-size", "12px")
        .style("color", "#333");

    // cells
    data.rows.forEach((row, ri) => {
    data.cols.forEach((col, ci) => {
      const val = data.values[ri][ci];
      const cx = xScale(col);
      const cy = yScale(row);
      const bw = xScale.bandwidth();
      const bh = yScale.bandwidth();

      // Cell rectangle
      g.append("rect")
        .attr("x", cx)
        .attr("y", cy)
        .attr("width", bw)
        .attr("height", bh)
        .attr("rx", 2)
        .attr("fill", colorScale(val))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mousemove", function(event) {
          const label = val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
          const strength = Math.abs(val) >= 0.5 ? "strong"
                         : Math.abs(val) >= 0.25 ? "moderate" : "weak";
          const dir = val > 0 ? "positive" : val < 0 ? "negative" : "none";

          tooltip
            .style("display", "block")
            .style("left", (event.pageX + 14) + "px")
            .style("top",  (event.pageY - 40) + "px")
            .html(`
              <strong>${row}</strong><br>
              <span style="color:#666">${col}</span><br>
              r = <strong>${label}</strong>
              &nbsp;<span style="color:#888">${strength} ${dir}</span>
            `);
        })
        .on("mouseleave", () => tooltip.style("display", "none"));

      // Value label inside cell
      g.append("text")
        .attr("x", cx + bw / 2)
        .attr("y", cy + bh / 2 + 4.5)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "700")
        .style("pointer-events", "none")
        .style("fill", Math.abs(val) > 0.18 ? "#eee" : "#3b3a3a")
        .text(val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    });
  });
}

// legend for the heatmap
function buildLegend() {
  const steps = 40;
  const w = 200, h = 12;

  const svg = d3.select("#legend")
    .append("svg")
    .attr("width", w + 60)
    .attr("height", h + 24);

  const defs = svg.append("defs");
  const grad = defs.append("linearGradient")
    .attr("id", "legendGrad")
    .attr("x1", "0%").attr("x2", "100%");

  for (let i = 0; i <= steps; i++) {
    grad.append("stop")
      .attr("offset", (i / steps * 100) + "%")
      .attr("stop-color", colorScale(-1 + i / steps * 2));
  }

  svg.append("rect")
    .attr("x", 30).attr("y", 0)
    .attr("width", w).attr("height", h)
    .attr("rx", 4)
    .style("fill", "url(#legendGrad)");

  svg.append("text").attr("x", 26).attr("y", 10)
    .attr("text-anchor", "end").style("font-size", "11px").style("fill", "#666").text("−1");
  svg.append("text").attr("x", 30 + w + 4).attr("y", 10)
    .style("font-size", "11px").style("fill", "#666").text("+1");
  svg.append("text").attr("x", 30 + w / 2).attr("y", h + 18)
    .attr("text-anchor", "middle").style("font-size", "11px").style("fill", "#2b2828")
    .text("correlation with Final CGPA");
}

// toggle between major and age group
function switchGroup(group) {
  render(group);
}

buildLegend();
render("major");