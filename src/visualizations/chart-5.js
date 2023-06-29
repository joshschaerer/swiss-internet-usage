import { createDropDown, removeDropDown, responsivefy } from "./helper.js";

export const chartFive = () => {
  removeDropDown(dateDropDown, "internet-activity-date-dropdown");
  var dateDropDown = document.getElementById("internet-activity-date-dropdown");
  var dateArray = [
    {
      de: "2021",
      en: "2021",
    },
    {
      de: "2019",
      en: "2019",
    },
    {
      de: "2017",
      en: "2017",
    },
    {
      de: "2014",
      en: "2014",
    },
  ];
  createDropDown(
    dateDropDown,
    "internet-activity-date-dropdown",
    dateArray,
    () => chart(dateDropDown.value, internetActivityArray)
  );

  var internetActivityArray = [
    {
      de: "E-Mails senden und empfangen",
      en: "Send and receive emails",
    },
    {
      de: "Instant Messaging verwenden; z.B. WhatsApp, Messenger, usw. (ab 2019)",
      en: "Use instant messaging; e.g. WhatsApp, Messenger, etc.",
    },
    {
      de: "Nach Informationen zu Waren oder Dienstleistungen suchen",
      en: "Search for information about goods or services",
    },
    {
      de: "Nachrichten oder Zeitungen bzw. Nachrichtenmagazine lesen",
      en: "Read news",
    },
    {
      de: "Telefonieren oder Videokonferenzen abhalten",
      en: "Make phone calls or hold video conferences",
    },
    {
      de: "Gesundheitsrelevante Informationen suchen",
      en: "Search for health-related information",
    },
    {
      de: "Seiten wie Wikipedia benutzen, um etwas zu lernen (ab 2017)",
      en: "Using sites like Wikipedia to learn something",
    },
    {
      de: "Internet nutzen mit der Absicht, etwas zu lernen (2014)",
      en: "Using sites like Wikipedia to learn something",
    },
    {
      de: "Filme oder Videos anschauen oder herunterladen",
      en: "Watch or download movies or videos",
    },
    {
      de: "Others",
      en: "Others",
    },
  ];

  chart(dateDropDown.value, internetActivityArray);
};

// set the dimensions and margins of the graph
const margin = { top: 30, right: 30, bottom: 30, left: 30 },
  width = 500 - margin.left - margin.right,
  height = 430 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#chart-5")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .call(responsivefy)
  .append("g")
  .attr(
    "transform",
    `translate(${width / 2 + margin.left},${height / 2 + margin.top})`
  );

export const chart = (date, array) => {
  d3.selectAll("#chart-5 > svg > g > *").remove();

  //Read the data
  d3.csv(
    "./src/data/102.csv",

    // When reading the csv, I must format variables:
    function (d) {
      if (
        d["num"] !== '"....."' &&
        d["Geschlecht"] === "Geschlecht - Total" &&
        d["Bildungsstand"] === "Bildungsstand - Total" &&
        d["Altersklasse"] === "Altersklasse - Total" &&
        d["Absolut / relativ"] === "Anzahl Personen" &&
        d["Jahr"] === date &&
        d["Resultat"] === "Wert"
      ) {
        return {
          value: d.num,
          internetActivity: d["Online-Aktivität"],
          gender: d["Geschlecht"],
          ageGroup: d["Altersklasse"],
          education: d["Bildungsstand"],
          absolute: d["Absolut / relativ"],
          date: d3.timeParse("%Y")(d["Jahr"]),
          result: d["Resultat"],
        };
      }
    }
  ).then((data) => {
    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(width, height) / 2 - 10;
    const values = [];
    const total = d3.sum(data, (d) => d.value);
    data.sort((a, b) => b.value - a.value);
    values.push(data[0]);
    values.push(data[1]);
    values.push(data[2]);
    values.push(data[3]);
    values.push(data[4]);
    values.push(data[5]);
    values.push({
      internetActivity: "Others",
      value:
        total -
        values[0].value -
        values[1].value -
        values[2].value -
        values[3].value -
        values[4].value -
        values[5].value,
    });

    // Compute the position of each group on the pie:
    const pie = d3
      .pie()
      .sort((a, b) => a[0].value - b[0].value)
      .value((d) => d[1].value);
    const data_ready = pie(Object.entries(values));

    const mid = svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(0,10)`)
      .attr("font-size", "40px")
      .attr(
        "fill",
        getComputedStyle(document.body).getPropertyValue("--text-color")
      );

    const top = svg
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("transform", `translate(0,-${radius})`)
      .attr(
        "fill",
        getComputedStyle(document.body).getPropertyValue("--text-color")
      );
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll("whatever")
      .data(data_ready)
      .join("path")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(radius * 0.5) // This is the size of the donut hole
          .outerRadius(radius * 0.8)
      )
      .style(
        "fill",
        getComputedStyle(document.body).getPropertyValue("--container-color")
      )
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", 0.5);
    svg
      .selectAll("path")
      .on("mouseover", function (e, d) {
        mid.text(`${d3.format(".1%")(d.data[1].value / total)}`);
        top.text(
          array
            .map((a) => {
              if (a.de === d.data[1].internetActivity) return a.en;
            })
            .toString()
            .split(",")
            .join("")
        );
        d3.select(this).style(
          "fill",
          getComputedStyle(document.body).getPropertyValue("--first-color")
        );
      })
      .on("mouseout", function (e, d) {
        d3.select(this).style(
          "fill",
          getComputedStyle(document.body).getPropertyValue("--container-color")
        );
      });
  });
};
