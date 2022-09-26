import React from "react";
import { withRouter } from "react-router-dom";
import { Container } from "react-bootstrap";

import { Vega } from "react-vega";

import { data } from "./components/intervention-data";

function DashboardRoute() {
  const splitStringsData = data
    .map((datum) => {
      const xVals =
        datum["Measure Domains (from Care Partner Outcome Measures)"].split(
          ","
        );
      const splitData = xVals.map((val) => ({
        ...datum,
        "Measure Domains (from Care Partner Outcome Measures)": val,
      }));
      return splitData;
    })
    .flat();

  const counted = splitStringsData.reduce((acc, item) => {
    const key =
      item["Measure Domains (from Care Partner Outcome Measures)"] +
      item["Intervention Setting"];
    if (!acc.hasOwnProperty(key)) {
      acc[key] = 0;
    }
    acc[key] += 1;
    return acc;
  }, {});
  const finalData = splitStringsData.map((d) => ({
    ...d,
    Count:
      counted[
        d["Measure Domains (from Care Partner Outcome Measures)"] +
          d["Intervention Setting"]
      ],
  }));

  console.log("Counted: ", counted);
  const heatMapSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: finalData,
    },
    transform: [
      {
        impute: "Count",
        groupby: ["Intervention Setting"],
        key: "Measure Domains (from Care Partner Outcome Measures)",
        value: 0,
      },
    ],
    encoding: {
      y: {
        field: "Intervention Setting",
        type: "nominal",
        titleOffset: 500,
        labelOffset: 300,

        axis: { labelLimit: 1000 },
      },
      x: {
        field: "Measure Domains (from Care Partner Outcome Measures)",
        type: "nominal",
        axis: { orient: "top", labelAngle: -45, labelLimit: 1000 },
      },
      tooltip: [
        { field: "Count" },
        { field: "Measure Domains (from Care Partner Outcome Measures)" },
        { field: "Intervention Setting" },
      ],
    },
    layer: [
      {
        mark: "rect",
        encoding: {
          color: {
            condition: { test: "datum.Count <= 0", value: "lightgray" },
            scale: { domainMin: 1 },
            field: "Count",
            type: "quantitative",
            title: "Count of Records",
          },
        },
      },
      {
        mark: "text",
        encoding: {
          text: { field: "Count", type: "quantitative" },
          color: {
            condition: { test: "datum['Count'] < 7", value: "black" },
            value: "white",
          },
        },
      },
    ],
    config: {
      axis: { grid: true, tickBand: "extent" },
    },
  };

  return (
    <div>
      <Container>
        <Vega actions={true} spec={heatMapSpec} />
      </Container>
    </div>
  );
}

export default withRouter(DashboardRoute);
