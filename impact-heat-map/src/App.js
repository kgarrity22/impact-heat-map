import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'
// import axios from 'axios';
// import { Auth } from 'aws-amplify';
import * as d3 from 'd3'

import CsvDownloader from 'react-csv-downloader';

import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

import { FaArrowCircleLeft, FaArrowCircleDown } from 'react-icons/fa'

import PrismHeatMap from './components/heat-map'




function App() {

  let Airtable = require('airtable');
  let base = new Airtable({apiKey: 'key8POUQgTG9Ubm4J'}).base('appw9qP0xvfA2Kjkk');

  function countOccurrences(dictionary, key){
    if (key in dictionary){
      dictionary[key]+=1;
    } else {
      dictionary[key] = 1
    }
  }


  const [loadingHeatMapData, setLoadingHeatMapData] = useState(true)
  const [heatMapData, setHeatMapData] = useState([])
  const [heatMapKeys, setHeatMapKeys] = useState([])

  function getHeatMapChartData() {
  //console.log("getPopulationsChartsData")
    let heat_result = {}
    let heat_data = []
    let alldata = {}
    let keys = new Set()
    return new Promise((resolve, reject) => {
      base('Intervention Table').select({

        // filterByFormula: airtableFilters,
        view: "Comprehensive View"
      }).eachPage(function page(records, fetchNextPage) {

        records.forEach(function(record) {
          // get the data
        //  console.log("Combined Outcome Categories: ", record.get("Combined Outcome Categories"))
          //console.log("Intervention Setting: ", record.get("Intervention Setting"))
          // both of these fields are lists
          let setting = record.get("Intervention Setting")
          if (typeof(setting)==='undefined'){
            console.log(setting)
          }
          let clean_setting = ""
          if (setting.length > 1){
            for (let i of setting){
              if (i === setting[0]){
                clean_setting = i
              } else {
                clean_setting = clean_setting + " + " + i
              }
            }
          } else {
            clean_setting = setting[0]
          }
          let outcomes = record.get("Combined Outcome Categories")
          if (typeof(outcomes)==='undefined'){
            console.log(outcomes)
          }

          //console.log(setting, outcomes)

          if (! (Object.keys(alldata)).includes(clean_setting)) {
            // if it's not already in there
            let val = {}
            for (let j of outcomes){
              //console.log("j: ", j)
              keys.add(j)
              val[j] = 1
            }
            //console.log("val: ", val)
            alldata[clean_setting] = val
          } else {
            // look up the value dict
            //console.log("heere: ", alldata[clean_setting])
            let val = alldata[clean_setting]
            for (let j of outcomes){
              //console.log("J: ", j, val)
              countOccurrences(val, j)
            }
            //console.log("updated val: ", val)
            alldata[clean_setting] = val
          }
          //console.log("alldata: ", alldata)


        });

        fetchNextPage();

      }, function done(err) {
        if (err) {
          console.error(err);
          return reject({});
        }
      //  console.log("DATA: ", alldata)
        // now fix the data so that its in the right format
        //********
        // for each item in the dictionary
        for (let key of Object.keys(alldata)){
          let single = alldata[key]
          single["setting"] = key
          heat_data.push(single)
        }
        //console.log("HEAT DATA: ", heat_data)
        heat_result["data"] = heat_data
        heat_result["keys"] = [...keys]
        resolve(heat_result)

      })
    })
  }// end of get PopulationsData


  const fetchHeatMapData = async () => {
    //console.log("fetchPopulationData")
    const result = await getHeatMapChartData()
    setHeatMapData(result.data)
    setHeatMapKeys(result.keys)
    console.log("RESULT: ", result)
    setLoadingHeatMapData(false)

  }

  useEffect(() => {

    setLoadingHeatMapData(true);
    fetchHeatMapData();

  })

  return (
  <div>
    <Row>
      <Col>

      </Col>
    </Row>
    <Row>
      <Col lg={{span: 6}}>
        <PrismHeatMap
            data={heatMapData}
            keys={heatMapKeys}
            indexby={"setting"}
        />
      </Col>
    </Row>
  </div>


  );
}


export default App;
