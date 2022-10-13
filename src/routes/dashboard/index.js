import React, { useState } from "react";
import { withRouter } from "react-router-dom";
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
  // do the data before hand --> convert it to an array here
  const newData = data.map((d) => ({
    ...d,
    Measure: [
      ...new Set(
        d["Measure Domains (from Care Partner Outcome Measures)"]
          .split(",")
          .concat(
            d[
              "Measure Domains (from Person Living with Dementia Outcome Measures)"
            ].split(",")
          )
      ),
    ],
  }));
  console.log("NEW DATA: ", newData); // this is the concatenated data --> without duplicates

  // now we want to find every x - y pair

  // all non-unique x vals
  const allXVals = newData.map((d) => d.Measure).flat();
  // all non-unique y vals
  const allYVals = newData.map((d) => d["Intervention Setting"]);

  const obj = {};
  // have the arrays with each record
  // for each y go through the data set
  console.log("OBJECT CHECK: ", obj);

  // if the record is equal to that y
  // find the item in the counter for each x

  // all unique keys
  const allKeys = [
    ...new Set(
      allXVals
        .map((x) => {
          return allYVals.map((y) => x + "!" + y);
        })
        .flat()
    ),
  ];
  allKeys.forEach((key) => (obj[key] = 0));
  for (let datum of newData) {
    for (let m of datum.Measure) {
      const key = m + "!" + datum["Intervention Setting"];
      obj[key] += 1;
    }
  }
  console.log("OBJECT: ", obj);

  const splitStringsData = newData
    .map((datum) => {
      const xVals = datum.Measure;

      const splitData = xVals.map((val) => ({
        ...datum,
        "Measure Domains": val,
      }));
      return splitData;
    })
    .flat();

  const usedKeys = [];
  const counter = {};

  allKeys.forEach((key) => {
    counter[key] = 0;
  });

  splitStringsData.forEach((item) => {
    const key = item["Measure Domains"] + "!" + item["Intervention Setting"];
    counter[key] += 1;
    usedKeys.push(item["Measure Domains"] + "!" + item["Intervention Setting"]);
  });

  console.log("COUNTER: ", counter);

  const settings = {
    0: "Single Setting",
    1: "Dual Setting",
    2: "Triple Setting",
    3: "Quad Setting",
  };

  const measures = {
    "Appraisal: Objective Burden": "Care Partner Outcomes",
    "Appraisal: Subjective Burden": "Care Partner Outcomes",
    "Appraisal: Satisfaction": "Care Partner Outcomes",
    "Care Partner Internal Resources": "Care Partner Outcomes",
    "Care Partner Health: Physical": "Care Partner Outcomes",
    "Care Partner Health: Psychological": "Care Partner Outcomes",
    "Context: Care Partner Beliefs on % Providing Care (familism)":
      "Care Partner Outcomes",
    "Context: Care Partner Resources % (perceived social support)":
      "Care Partner Outcomes",
    "Coping: Positive Strategies": "Care Partner Outcomes",
    "Coping: Negative Strategies": "Care Partner Outcomes",
    "Stressor: Disability of PLWD: Behavioral": "Care Partner Outcomes",
    "Stressor: Disability of PLWD: Functional": "Care Partner Outcomes",
    "Relationship Quality": "Both",
    "Quality of Life/Well-being": "Both",
    Other: "Both",
    "PLWD Health: Physical": "PLWD Outcome",
    "PLWD Health: Psychological": "PLWD Outcome",
    "Context: PLWD Resources % (perceived social support)": "PLWD Outcome",
    "Coping: Positive Strategies (PLWD)": "PLWD Outcome",
    "Coping: Negative Strategies (PLWD)": "PLWD Outcome",
    "Institutionalization/Formal Care Utilization": "PLWD Outcome",
  };

  const extra = allKeys
    .map((key) => {
      if (!usedKeys.includes(key)) {
        usedKeys.push(key);
        const [x, y] = key.split("!");
        return {
          Count: 0,
          "Measure Domains": x,
          "Intervention Setting": y,
          settingGroup: settings[(y.match(/&/g) || []).length],
          measureGroup: measures[x],
        };
      }
    })
    .filter((i) => i);

  const finalData = [
    ...splitStringsData.map((d) => ({
      ...d,
      Count: counter[d["Measure Domains"] + "!" + d["Intervention Setting"]],
      settingGroup:
        settings[(d["Intervention Setting"].match(/&/g) || []).length],
      measureGroup: measures[d["Measure Domains"]],
    })),
    ...extra,
  ];

  const heatMapSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: finalData,
    },
    width: 950,
    height: 600,
    config: {
      axis: {
        grid: true,
        tickBand: "extent",
        labelFontSize: 12,
        titleFontSize: 16,
      },
    },
    padding: { top: 100, bottom: 100, left: 0, right: 20 },
    transform: [
      {
        calculate: "join(split(datum['Intervention Setting'], '&'), ' ')",
        as: "Intervention Setting Tooltip",
      },
      {
        calculate: "join(split(datum['Measure Domains'], '%'), ' ')",
        as: "Measure Domain Tooltip",
      },
    ],
    encoding: {
      y: {
        field: "Intervention Setting",
        type: "nominal",
        sort: [
          "Community Space",
          "Home",
          "Hospital/Medical Center",
          "Telephone/Web-based",

          "Community Space,&Home",
          "Community Space,&Telephone/Web-based",
          "Home,&Telephone/Web-based",
          "Hospital/Medical Center,&Home",
          "Telephone/Web-based,&Hospital/Medical Center",

          "Community Space,&Home,&Hospital/Medical Center",
          "Community Space,&Home,&Telephone/Web-based",
          "Community Space,&Hospital/Medical Center,&Telephone/Web-based",
          "Home,&Hospital/Medical Center,&Telephone/Web-based",

          "Community Space,&Home,&Hospital/Medical Center,&Telephone/Web-based",
        ],
        axis: {
          titlePadding: 100,
          labelOffset: -16, // make this conditional
          // for wrapping strings
          labelExpr: "split(datum.label, '&')",
          tickSize: {
            condition: {
              test: {
                field: "value",
                oneOf: [
                  "Telephone/Web-based",
                  "Telephone/Web-based,&Hospital/Medical Center",
                ],
              },
              value: 140,
            },
            value: 10,
          },
          labelAlign: "right",
          labelPadding: {
            condition: {
              test: {
                field: "value",
                oneOf: [
                  "Telephone/Web-based",
                  "Telephone/Web-based,&Hospital/Medical Center",
                ],
              },
              value: -130,
            },
            value: 0,
          },
        },
      },
      x: {
        field: "Measure Domains",
        title: "Measure Domains",
        type: "ordinal",
        scale: {
          domain: Object.keys(measures),
        },
        axis: {
          orient: "top",
          labelLimit: 1000,
          titlePadding: 70,
          labelExpr:
            "datum.label.length > 40 ? split(datum.label, '% ') : datum.label",
          labelPadding: {
            condition: {
              test: {
                field: "value",
                oneOf: ["Other", "Stressor: Disability of PLWD: Functional"],
              },
              value: -235,
            },
            value: 0,
          },
          gridWidth: {
            condition: {
              test: {
                field: "value",
                oneOf: ["Other", "Stressor: Disability of PLWD: Functional"],
              },
              value: 3,
            },
            value: 1,
          },
          gridColor: {
            condition: {
              test: {
                field: "value",
                oneOf: ["Other", "Stressor: Disability of PLWD: Functional"],
              },
              value: "gray",
            },
            value: "lightgray",
          },
          tickSize: {
            condition: {
              test: {
                field: "value",
                oneOf: ["Other", "Stressor: Disability of PLWD: Functional"],
              },
              value: 240,
            },
            value: 5,
          },
          zindex: 3,
        },
      },
      tooltip: [
        { field: "Count" },
        {
          field: "Measure Domain Tooltip",
          title: "Measure Domains",
        },
        {
          field: "Intervention Setting Tooltip",
          title: "Intervention Setting",
        },
        {
          field: "settingGroup",
          title: "Setting Group",
        },
        {
          field: "measureGroup",
          title: "Measure Group",
        },
      ],
      column: { field: "measureGroup" },
    },
    // text layer
    layer: [
      {
        mark: "rect",
        encoding: {
          color: {
            condition: { test: "datum.Count <= 0", value: "#F6F6F6" },
            scale: {
              domainMin: 1,
            },
            field: "Count",
            type: "quantitative",
            title: "Count of Records",
          },
        },
      },
      {
        mark: { type: "text", fontStyle: "bold", fontSize: 16 },
        encoding: {
          text: { field: "Count", type: "quantitative" },
          color: {
            condition: { test: "datum['Count'] < 7", value: "black" },
            value: "white",
          },
        },
      },
      {
        mark: { type: "text", fontSize: 12 },
        encoding: {
          text: { value: "Single Setting" },
          x: { value: -170 },
          y: { value: 100 },
          angle: { value: -90 },
        },
      },
      {
        mark: { type: "text", fontSize: 12 },
        encoding: {
          text: { value: "Dual Setting" },
          x: { value: -170 },
          y: { value: 370 },
          angle: { value: -90 },
        },
      },

      {
        mark: { type: "text", fontSize: 12 },
        encoding: {
          text: { value: "Quad Setting" },
          x: { value: -170 },
          y: { value: 565 },
          angle: { value: -90 },
        },
      },

      {
        mark: { type: "text", fontSize: 12 },
        encoding: {
          text: { value: "Care Partner Outcomes" },
          x: { value: 300 },
          y: { value: -210 },
        },
      },

      {
        mark: { type: "text", fontSize: 12 },
        encoding: {
          text: { value: "Both" },
          x: { value: 610 },
          y: { value: -210 },
        },
      },
      {
        mark: { type: "text", fontSize: 12 },
        encoding: {
          text: { value: "PLWD Outcome" },
          x: {
            value: 820,
          },
          y: { value: -210 },
        },
      },
    ],
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const [tableData, setTableData] = useState([]);
  const [title, setTitle] = useState("");

  const handleClick = (_unused, item) => {
    if (item.datum) {
      const x = item.datum["Measure Domains"];
      const y = item.datum["Intervention Setting"];

      const td = newData.filter(
        (d) => d["Measure"].includes(x) && d["Intervention Setting"] === y
      );

      setTableData(td);
      setTitle(`Viewing ${td.length} records`);
      setOpen(true);
    }
  };

  const compiledSpec = addClickSignal(heatMapSpec);

  return (
    <div>
      <Vega
        actions={true}
        signalListeners={{ datumClick: handleClick }}
        spec={compiledSpec}
        style={{ width: "100%" }}
      />
      <Dialog onClose={handleClose} open={open} maxWidth={1000} minHeight={600}>
        <div
          style={{
            margin: 20,
          }}
        >
          <h5>{title}</h5>
          <MainTable tabledata={tableData} height="auto" />
        </div>
      </Dialog>
    </div>
  );
}

export default withRouter(DashboardRoute);
