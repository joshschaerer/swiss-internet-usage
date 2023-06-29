import { createDropDown, responsivefy } from "./helper.js";

export const chartTwo = () => {
  var internetPurchasesAgeDropDown = document.getElementById(
    "internet-purchases-age-dropdown"
  );
  var internetPurchasesAgeArray = [
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

  createDropDown(
    internetPurchasesAgeDropDown,
    "internet-purchases-age-dropdown",
    internetPurchasesAgeArray,
    () =>
      chart(
        internetPurchasesAgeDropDown.value,
        internetPurchasesGenderDropDown.value,
        absoluteDropDown.value
      )
  );

  var internetPurchasesGenderDropDown = document.getElementById(
    "internet-purchases-gender-dropdown"
  );
  var internetPurchasesGenderArray = [
    {
      de: "Geschlecht - Total",
      en: "Gender - Total",
    },
    {
      de: "Mann",
      en: "Man",
    },
    {
      de: "Frau",
      en: "Woman",
    },
  ];

  createDropDown(
    internetPurchasesGenderDropDown,
    "internet-purchases-gender-dropdown",
    internetPurchasesGenderArray,
    () =>
      chart(
        internetPurchasesAgeDropDown.value,
        internetPurchasesGenderDropDown.value,
        absoluteDropDown.value
      )
  );

  var absoluteDropDown = document.getElementById(
    "internet-purchases-absolute-dropdown"
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
    "internet-purchases-absolute-dropdown",
    absoluteArray,
    () =>
      chart(
        internetPurchasesAgeDropDown.value,
        internetPurchasesGenderDropDown.value,
        absoluteDropDown.value
      )
  );

  chart(
    internetPurchasesAgeDropDown.value,
    internetPurchasesGenderDropDown.value,
    absoluteDropDown.value
  );
};

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#chart-2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

export const chart = (age, gender, absolute) => {
  d3.selectAll("#chart-2 > svg > g > *").remove();

  //Read the data
  d3.csv(
    "./src/data/104.csv",

    // When reading the csv, I must format variables:
    function (d) {
      return {
        value: d["num"],
        year: d3.timeParse("%Y")(d["Jahr"]),
        ecommerce: d["E-commerce und E-banking"],
        gender: d["Geschlecht"],
        ageGroup: d["Altersklasse"],
        education: d["Bildungsstand"],
        absolute: d["Absolut / relativ"],
        result: d["Resultat"],
      };
    }
  ).then(
    // Now I can use this dataset:
    function (data) {
      const filteredData = data.filter(
        (d) =>
          d.value !== '"....."' &&
          d.gender === gender &&
          d.ageGroup === age &&
          d.education === "Bildungsstand - Total" &&
          d.absolute === absolute &&
          d.result === "Wert" &&
          (d.ecommerce === "Einkäufe im Internet in den letzten drei Monaten" ||
            d.ecommerce ===
              " Einkäufe im Internet in den letzten zwölf Monaten" ||
            d.ecommerce ===
              " Mindestens einmal im Leben einen Einkauf im Internet getätigt")
      );
      const sumstat = Array.from(
        d3.group(filteredData, (d) => d.ecommerce),
        ([key, value]) => ({ key, value })
      );

      // Add X axis --> it is a date format
      const x = d3
        .scaleTime()
        .domain(
          d3.extent(filteredData, function (d) {
            return d.year;
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

      const tooltip = d3
        .select("#chart-2")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

      const mouseover = function (event, d) {
        tooltip
          .html(d3.timeFormat("%Y")(d.year) + ": " + d.value)
          .style("opacity", 1)
          .style("left", event.pageX - 60 + "px")
          .style("top", event.pageY - 60 + "px");
        d3.select(this).style("stroke", "black");
      };

      const mouseleave = function (d) {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).style("stroke", "none");
      };

      const priceline = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.value));

      // color palette
      const color = d3
        .scaleOrdinal()
        .domain(Array.from(filteredData.keys()))
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
            .attr("cx", x(n.year))
            .attr("cy", y(n.value))
            .attr("r", 3)
            .on("mouseover", (e, d) => mouseover(e, n))
            .on("mouseleave", mouseleave);
        });
      });

      // add axes
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("stroke", "hsl(0,0,0)")
        .call(d3.axisBottom(x));
      svg.append("g").attr("stroke", "hsl(0,0,0)").call(d3.axisLeft(y));
    }
  );
};
