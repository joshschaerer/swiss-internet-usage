import { createDropDown, responsivefy } from "./helper.js";

export const chartFour = () => {
  var internetUsageDropDown = document.getElementById(
    "internet-usage-dropdown"
  );
  var internetUsageArray = [
    {
      de: "Internetnutzung in den letzten drei Monaten",
      en: "Internet usage in the last three months",
    },
    {
      de: " Tägliche oder fast tägliche Internetnutzung",
      en: "Daily or almost daily internet usage",
    },
    {
      de: " Internetnutzung fünf Stunden oder mehr pro Woche",
      en: "Internet use five hours or more per week",
    },
  ];

  createDropDown(
    internetUsageDropDown,
    "internet-usage-dropdown",
    internetUsageArray,
    () =>
      chart(
        internetUsageDropDown.value,
        ageDropDown.value,
        educationDropDown.value,
        absoluteDropDown.value
      )
  );

  var ageDropDown = document.getElementById("internet-usage-age-dropdown");
  var ageArray = [
    {
      de: "Altersklasse - Total",
      en: "Age group - Total",
    },
    {
      de: "15 bis 29 Jahre",
      en: "15 to 29 years",
    },
    {
      de: "30 bis 59 Jahre",
      en: "30 to 59 years",
    },
    {
      de: "60 Jahre und älter",
      en: "60 years and older",
    },
  ];

  createDropDown(ageDropDown, "internet-usage-age-dropdown", ageArray, () =>
    chart(
      internetUsageDropDown.value,
      ageDropDown.value,
      educationDropDown.value,
      absoluteDropDown.value
    )
  );

  var educationDropDown = document.getElementById(
    "internet-usage-education-dropdown"
  );
  var educationArray = [
    {
      de: "Bildungsstand - Total",
      en: "Education level - Total",
    },
    {
      de: "Ohne nachobligatorische Ausbildung (25 Jahre und älter)",
      en: "Without post-compulsory education (25 years and older)",
    },
    {
      de: "Sekundarstufe II (25 Jahre und älter)",
      en: "Upper secondary education (25 years and older)",
    },
    {
      de: "Tertiärstufe (25 Jahre und älter)",
      en: "Tertiary level (25 years and older)",
    },
    {
      de: "Unter 25 Jahren",
      en: "Under 25 years old",
    },
  ];

  createDropDown(
    educationDropDown,
    "internet-usage-education-dropdown",
    educationArray,
    () =>
      chart(
        internetUsageDropDown.value,
        ageDropDown.value,
        educationDropDown.value,
        absoluteDropDown.value
      )
  );

  var absoluteDropDown = document.getElementById(
    "internet-usage-absolute-dropdown"
  );
  var absoluteArray = [
    {
      de: "Anzahl Personen",
      en: "Number of people",
    },
    {
      de: "Anteil (in % der Gesamtbevölkerung)",
      en: "Share (in % of total population)",
    },
  ];

  createDropDown(
    absoluteDropDown,
    "internet-usage-absolute-dropdown",
    absoluteArray,
    () =>
      chart(
        internetUsageDropDown.value,
        ageDropDown.value,
        educationDropDown.value,
        absoluteDropDown.value
      )
  );

  chart(
    internetUsageDropDown.value,
    ageDropDown.value,
    educationDropDown.value,
    absoluteDropDown.value
  );
};

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#chart-4")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

export const chart = (internetUsage, age, education, absolute) => {
  d3.selectAll("#chart-4 > svg > g > *").remove();

  //Read the data
  d3.csv(
    "./src/data/106.csv",

    // When reading the csv, I must format variables:
    function (d) {
      return {
        value: d.num,
        internetUsage: d["Internetnutzungsmodalitäten und Kompetenzen"],
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
          d.internetUsage === internetUsage &&
          d.ageGroup === age &&
          d.education === education &&
          d.absolute === absolute &&
          d.result === "Wert"
      );
      const sumstat = Array.from(
        d3.group(filteredData, (d) => d.gender),
        ([key, value]) => ({ key, value })
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
        .style("stroke", "hsl(0,0,0)")
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
        .select("#chart-4")
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

      const priceline = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.value));

      // color palette
      const color = d3
        .scaleOrdinal()
        .domain(Array.from(sumstat.keys()))
        .range([
          "hsl(42, 92%, 56%)",
          "hsl(214, 89%, 52%)",
          "hsl(350, 88%, 60%)",
        ]);
      // add lines and circles
      sumstat.forEach((d, i) => {
        svg
          .append("path")
          .style("fill", "none")
          .style("stroke", () => (d.color = color(d.key)))
          .attr("d", priceline(d.value));
        d.value.forEach((n) => {
          svg
            .append("circle")
            .style("fill", () => (d.color = color(d.key)))
            .style("stroke", "none")
            .attr("cx", x(n.date))
            .attr("cy", y(n.value))
            .attr("r", 3)
            .on("mouseover", (e, d) => mouseover(e, n))
            .on("mouseleave", mouseleave);
        });
      });
    }
  );
};
