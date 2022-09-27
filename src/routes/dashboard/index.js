import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Vega } from "react-vega";
import Dialog from "@mui/material/Dialog";
import { vegaLite } from "vega-embed";

import { data } from "./components/intervention-data";
import MainTable from "./components/table";

export const addClickSignal = (spec) => {
  const vgSpec = vegaLite.compile(spec).spec;

  if (!vgSpec.signals) {
    vgSpec.signals = [];
  }

  vgSpec.signals.push({
    name: "datumClick",
    on: [
      { events: "*:mouseup", encode: "release" },
      { events: "click", update: "datum" },
    ],
  });

  return vgSpec;
};

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

  const heatMapSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: finalData,
    },
    padding: { top: 100, bottom: 100 },
    transform: [
      {
        impute: "Count",
        groupby: ["Intervention Setting"],
        key: "Measure Domains (from Care Partner Outcome Measures)",
        value: 0,
      },
    ],
    height: 400,
    width: 600,
    encoding: {
      y: {
        field: "Intervention Setting",
        type: "nominal",

        axis: { labelLimit: 1000, titlePadding: 140 },
      },
      x: {
        field: "Measure Domains (from Care Partner Outcome Measures)",
        title: "Measure Domains",
        type: "nominal",
        axis: { orient: "top", labelAngle: -45, labelLimit: 1000 },
      },
      tooltip: [
        { field: "Count" },
        {
          field: "Measure Domains (from Care Partner Outcome Measures)",
          title: "Measure Domains",
        },
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

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const [tableData, setTableData] = useState([]);
  const [title, setTitle] = useState("");

  const handleClick = (_unused, item) => {
    if (item.datum) {
      const x =
        item.datum["Measure Domains (from Care Partner Outcome Measures)"];
      const y = item.datum["Intervention Setting"];

      const td = data.filter(
        (d) =>
          d["Measure Domains (from Care Partner Outcome Measures)"].includes(
            x
          ) && d["Intervention Setting"].includes(y)
      );

      setTableData(td);
      setTitle(`Viewing ${td.length} records`);
      setOpen(true);
    }
  };

  const compiledSpec = addClickSignal(heatMapSpec);

  return (
    <div>
      <Container>
        <Vega
          actions={true}
          signalListeners={{ datumClick: handleClick }}
          spec={compiledSpec}
        />
        <Dialog
          onClose={handleClose}
          open={open}
          sx={{
            margin: 20,
            minHeight: 400,
            minWidth: 1000,
          }}
        >
          <div
            style={{
              margin: 20,
              minWidth: 1000,
            }}
          >
            <h1>{title}</h1>
            <MainTable tabledata={tableData} height="auto" />
          </div>
        </Dialog>
      </Container>
    </div>
  );
}

export default withRouter(DashboardRoute);
