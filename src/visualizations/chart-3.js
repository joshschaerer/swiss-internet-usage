import { responsivefy } from "./helper.js";

export const chartThree = () => {
  chart();
};

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#chart-3")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

export const chart = () => {
  d3.selectAll("#chart-3 > svg > g > *").remove();

  //Read the data
  d3.csv(
    "./src/data/105.csv",

    // When reading the csv, I must format variables:
    function (d) {
      return {
        value: d.num,
        internetSecurity: d["Informatiksicherheit"],
        gender: d["Geschlecht"],
        ageGroup: d["Altersklasse"],
        education: d["Bildungsstand"],
        absolute: d["Absolut / relativ"],
        date: d3.timeParse("%Y")(d["Jahr"]),
        result: d["Resultat"],
      };
    }
  ).then(
    // Now I can use this dataset:
    function (data) {
      // Filter data
      const filteredData = data.filter(
        (d) =>
          d.value !== '"....."' &&
          d.internetSecurity ===
            "Verwendung von Sicherheitssoftware zum Schutz Ihres Computers" &&
          d.gender === "Geschlecht - Total" &&
          d.ageGroup === "Altersklasse - Total" &&
          d.education === "Bildungsstand - Total" &&
          d.absolute === "Anzahl Personen" &&
          d.result === "Wert"
      );

      // Add X axis --> it is a date format
      const x = d3
        .scaleTime()
        .domain(
          d3.extent(filteredData, function (d) {
            return d.date;
          })
        )
        .range([0, width]);
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(filteredData, function (d) {
            return +d.value;
          }),
        ])
        .range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
      // Its opacity is set to 0: we don't see it by default.
      const tooltip = d3
        .select("#chart-3")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

      // A function that change this tooltip when the user hover a point.
      // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
      const mouseover = function (event, d) {
        tooltip
          .html(d3.timeFormat("%Y")(d.date) + ": " + d.value)
          .style("opacity", 1)
          .style("left", event.pageX - 60 + "px")
          .style("top", event.pageY - 60 + "px");
        d3.select(this).style("stroke", "black");
      };

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
      const mouseleave = function (d) {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).style("stroke", "none");
      };

      // Add the line
      svg
        .append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", "hsl(214, 89%, 52%)")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d.date);
            })
            .y(function (d) {
              return y(d.value);
            })
        );

      // Add the circles
      svg
        .selectAll("circle")
        .data(filteredData)
        .join("circle")
        .attr("fill", "hsl(214, 89%, 52%)")
        .attr("stroke", "none")
        .attr("cx", (d) => x(d.date))
        .attr("cy", (d) => y(d.value))
        .attr("r", 3)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave);
    }
  );
};
