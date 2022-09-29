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
  const yVals = data;
  // const emptyColData =
  // Coping: Positive Strategies (PLWD)

  const heatMapSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
      values: finalData,
    },
    config: {
      axis: {
        grid: true,
        // gridWidth: { field: "Count" },
        gridWidth: {
          condition: {
            test: {
              field: "Measure Domains (from Care Partner Outcome Measures)",
              equal: "Other",
            },
            // [
            //   {
            //     field: "Measure Domains (from Care Partner Outcome Measures)",
            //     equal: "Stressor: Disability of PLWD: Functional",
            //   },

            // ],
            value: 3,
          },
          value: 1,
        },
        tickBand: "extent",
      },
    },
    padding: { top: 100, bottom: 100, left: 0 },
    transform: [
      {
        impute: "Count",
        groupby: ["Intervention Setting"],
        key: "Measure Domains (from Care Partner Outcome Measures)",
        value: 0,
      },
      {
        calculate: "join(split(datum['Intervention Setting'], '&'), ' ')",
        as: "Intervention Setting Tooltip",
      },
    ],
    height: 400,
    width: "container",
    encoding: {
      y: {
        field: "Intervention Setting",
        type: "nominal",
        sort: "-x",
        axis: {
          titlePadding: 20,
          labelOffset: -16,
          // for wrapping strings
          labelExpr: "split(datum.label, '&')",
        },
      },
      x: {
        field: "Measure Domains (from Care Partner Outcome Measures)",
        title: "Measure Domains",
        type: "ordinal",
        scale: {
          domain: [
            "Appraisal: Objective Burden",
            "Appraisal: Subjective Burden",
            "Appraisal: Satisfaction",
            "Care Partner Internal Resources",
            "Care Partner Health: Physical",
            "Care Partner Health: Psychological",
            "Context: Care Partner Beliefs on Providing Care (familism)",
            "Context: Care Partner Resources (perceived social support)",
            "Coping: Positive Strategies",
            "Coping: Negative Strategies",
            "Stressor: Disability of PLWD: Behavioral",
            "Stressor: Disability of PLWD: Functional",
            "Relationship Quality",
            "Quality of Life/Well-being",
            "Other",
            "PLWD Health: Physical",
            "PLWD Health: Psychological",
            "Context: PLWD Resources (perceived social support)",
            "Coping: Positive Strategies (PLWD)",
            "Coping: Negative Strategies (PLWD)",
            "Institutionalization/Formal Care Utilization",
          ],
        },
        axis: {
          orient: "top",
          labelAngle: -45,
          labelLimit: 1000,
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
        },
      },
      tooltip: [
        { field: "Count" },
        {
          field: "Measure Domains (from Care Partner Outcome Measures)",
          title: "Measure Domains",
        },
        {
          field: "Intervention Setting Tooltip",
          title: "Intervention Setting",
        },
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
        mark: { type: "text", fontStyle: "bold" },
        encoding: {
          text: { field: "Count", type: "quantitative" },
          color: {
            condition: { test: "datum['Count'] < 7", value: "black" },
            value: "white",
          },
        },
      },

      //
      // {
      //   mark: {
      //     type: "line",
      //     strokeWidth: 6,
      //     stroke: "black",
      //   },
      //   encoding: {
      //     x: {
      //       datum: "Stressor: Disability of PLWD: Functional",
      //       type: "ordinal",
      //       // axis: { tickBand: "center" },
      //     },
      //   },
      // },
    ],
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
