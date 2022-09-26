import React from "react";
import { withRouter } from "react-router-dom";
import { Container } from "react-bootstrap";

import { Vega } from "react-vega";

import { data } from "./components/intervention-data";
import "./index.css";
import "react-tabulator/lib/styles.css";
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import "react-tabulator/lib/styles.css";

function DashboardRoute(props) {
  const heatMapSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: data,
    },
    transform: [
      {
        aggregate: [{ op: "count", as: "num_cars" }],
        groupby: ["Intervention Name", "Intervention Setting"],
      },
    ],
    encoding: {
      y: { field: "Intervention Name", type: "ordinal" },
      x: { field: "Intervention Setting", type: "ordinal" },
    },
    layer: [
      {
        mark: "rect",
        encoding: {
          color: {
            field: "num_cars",
            type: "quantitative",
            title: "Count of Records",
            legend: { direction: "horizontal", gradientLength: 120 },
          },
        },
      },
      {
        mark: "text",
        encoding: {
          text: { field: "num_cars", type: "quantitative" },
          color: {
            condition: { test: "datum['num_cars'] < 40", value: "black" },
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
