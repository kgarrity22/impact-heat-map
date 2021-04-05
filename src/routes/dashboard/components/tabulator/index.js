
import React from "react";
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x
import { ReactTabulator } from 'react-tabulator'

import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)



  let options = {

    // height: 600,
    placeholder: "Loading Data...",
    downloadDataFormatter: (data) => data,
    downloadReady: (fileContents, blob) => blob,
    resizable:false,
    virtualDomBuffer:1000,
    tooltips:true,

  };





  let columns = [
    { title: "Intervention Name", field: "Intervention Name", hozAlign: "left", width: 340 },
    { title: "Source", field: "Source", hozAlign: "left", width: 150 },
    { title: "Evidence of Impelementation (Yes/No)", field: "Evidence of Impelementation (Yes/No)", hozAlign: "left", width: 150 },
    { title: "Type of Evidence", field: "Type of Evidence", hozAlign: "left", width: 150 },
    { title: "RCT", field: "RCT (Yes/No)", hozAlign: "left", width: 150 },
    { title: "Significant CG Outcome", field: "Significant CG Outcome (Yes/No)", hozAlign: "left", width: 150 },
    { title: "Status", field: "Status", hozAlign: "left", width: 150 },
    { title: "Notes/Comments", field: "Notes/Comments", hozAlign: "left", width: 150 },
    { title: "Tool Names (Caregiver Outcomes)", field: "Tool Names (Caregiver Outcomes)", hozAlign: "left", width: 150 },
    { title: "Tool Names (PLWD Outcomes)", field: "Tool Names (PLWD Outcomes)", hozAlign: "left", width: 150 },
    { title: "Intervention Setting", field: "Intervention Setting", hozAlign: "left", width: 150 },
    { title: "# of Sessions", field: "# of Sessions", hozAlign: "left", width: 150 },
    { title: "Duration (in weeks)", field: "Duration (in weeks)", hozAlign: "left", width: 150 },
    { title: "Session Length (in hours)", field: "Session Length (in hours)", hozAlign: "left", width: 150 },
    { title: "Provider:Client Ratio", field: "Provider:Client Ratio", hozAlign: "left", width: 150 },
    { title: "Combined Outcome Categories", field: "Combined Outcome Categories", hozAlign: "left", width: 150 },
  ]




class MainTable extends React.Component {
  ref = null;

  downloadData = () => {
    console.log("This first one: ", this.ref.table.modules.download)
      this.ref.table.download("csv", "data.csv");

    };


  render() {


    return (
      <div>
        <button className="btn btn-primary download-btn" onClick={this.downloadData}>Download</button>
        <ReactTabulator
          ref={ref => (this.ref = ref)}
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
