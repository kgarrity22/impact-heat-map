import React from "react";
import { ReactTabulator } from "react-tabulator";

import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)

let options = {
  // height: 600,
  placeholder: "No Data",
  downloadDataFormatter: (data) => data,
  downloadReady: (fileContents, blob) => blob,
  resizable: false,
  virtualDomBuffer: 1000,
  tooltips: true,
  layout: "fitDataFill",
};

let columns = [
  {
    title: "Intervention Name",
    field: "Intervention Name",
    hozAlign: "left",
    width: 300,
  },
  {
    title: "References",
    field: "References",
    hozAlign: "left",
    width: 150,
  },
  {
    title: "Year",
    field: "Year (from References)",
    hozAlign: "left",
    width: 150,
  },
  {
    title: "Intervention Setting",
    field: "Intervention Setting",
    hozAlign: "Provider:Client Ratio",
    width: 200,
  },
  {
    title: "# of Sessions",
    field: "# of Sessions",
    hozAlign: "left",
    width: 150,
  },
  {
    title: "Duration (in weeks)",
    field: "Duration (in weeks)",
    hozAlign: "left",
    width: 200,
  },
  {
    title: "Session Length (in hours)",
    field: "Session Length (in hours)",
    hozAlign: "left",
    width: 230,
  },
  {
    title: "Care Partner Outcome Measures",
    field: "Care Partner Outcome Measures",
    hozAlign: "left",
    width: 300,
  },
  {
    title: "Measure Domains",
    field: "Measure Domains (from Care Partner Outcome Measures)",
    hozAlign: "left",
    width: 200,
  },
  {
    title: "Person Living with Dementia Outcome Measures",
    field: "Person Living with Dementia Outcome Measures",
    hozAlign: "left",
    width: 390,
  },
];

class MainTable extends React.Component {
  ref = null;

  downloadData = () => {
    this.ref.table.download("csv", "data.csv");
  };

  render() {
    return (
      <div
        style={{
          padding: 20,
        }}
      >
        <button
          className="btn btn-primary download-btn"
          onClick={this.downloadData}
          style={{ marginBottom: "10px" }}
        >
          Download
        </button>
        <ReactTabulator
          ref={(ref) => (this.ref = ref)}
          columns={columns}
          data={this.props.tabledata}
          updateData={this.props.updateData}
          options={options}
          height={this.props.height}
        />
      </div>
    );
  }
}

export default MainTable;
