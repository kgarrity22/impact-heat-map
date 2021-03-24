import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'
import axios from 'axios';
import { Auth } from 'aws-amplify';
import * as d3 from 'd3'

import CsvDownloader from 'react-csv-downloader';

import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

import { FaArrowCircleLeft, FaArrowCircleDown } from 'react-icons/fa'

import PrismHeatMap from './components/heat-map'


function App() {

  let Airtable = require('airtable');
  let base = new Airtable({apiKey: 'key8POUQgTG9Ubm4J'}).base('appw9qP0xvfA2Kjkk');


  const [loadingHeatMapData, setLoadingHeatMapData] = useState(true)
  const [heatMapData, setHeatMapData] = useState([])

  function getHeatMapChartData() {
  //console.log("getPopulationsChartsData")
  let heat_result = {}
    return new Promise((resolve, reject) => {
      base('Studies').select({

        // filterByFormula: airtableFilters,
        view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {

        records.forEach(function(record) {


        });

        fetchNextPage();

      }, function done(err) {
        if (err) {
          console.error(err);
          return reject({});
        }


        heat_result["data"] = heat_data
        resolve(heat_result)

      })
    })
  }// end of get PopulationsData


  const fetchHeatMapData = async () => {
    //console.log("fetchPopulationData")
    const result = await getHeatMapChartData()
    setHeatMapData(result.data)
    setLoadingHeatMapData(false)

  }

  useEffect(() => {

    setLoadingHeatMapData(true);
    fetchHeatMapData();

  })

  return (
    <Row>
      <Col>
        <SectionTitle title="HeatMap" color="red" />
      </Col>
    </Row>
    <Row>
      <Col lg={{span: 6}}>
        <PrismPieChart
            colors="rainbow"
            title="What types of studies are included in the analysis?"
            chartData={trialPurposePieChartData}
            loading={loadingTrialsData}
        />
      </Col>
    </Row>


  );
}


export default App;
