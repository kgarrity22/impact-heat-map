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

import Navbar from './components/navbar'
import Searchbar from './components/searchbar'
import SearchFilters from './components/search-filters'
import SingleStat from './components/single-stat'
import SectionTitle from './components/section-title'
import PrismPieChart from './components/pie-chart'
import PrismAreaBump from './components/area-bump'
import PrismLineChart from './components/line-chart'
import PrismBarChart from './components/bar-chart'
import PrismSunburst from './components/sunburst-chart'
import PrismScatterplot from './components/scatterplot'
import PrismStaticScatterplot from './components/scatterplot-static'
import PrismChoropleth from './components/choropleth'
import MainTable from './components/tabulator'
import PrismTextBlock from './components/text-block'
import PrismModal from './components/modal'
import PrismHeatMap from './components/heat-map'


import './index.css'
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';
import 'react-tabulator/lib/styles.css';



function DashboardRoute(props) {

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
  const [totalData, setTotalData] = useState([])
  const [initialFilterLoadComplete, setInitialFilterLoadComplete] = useState(true)


const sumArray = arr => {
   const res = {};
   for(let i = 0; i < arr.length; i++){
      Object.keys(arr[i]).forEach(key => {
         res[key] = (res[key] || 0) + arr[i][key];
      });
   };
   return res;
};
//console.log(sumArray(arr))

  function getHeatMapChartData() {
  //console.log("getPopulationsChartsData")
    let heat_result = {}
    let heat_data = []
    let alldata = {}
    alldata["Home"] = {
      "CG Appraisal: Objective Burden": 0,
      "CG Appraisal: Satisfaction": 0,
      "CG Appraisal: Subjective Burden": 0,
      "CG Coping: Negative Strategies": 0,
      "CG Coping: Positive Strategies": 0,
      "CG Health: Physical": 0,
      "CG Health: Psychological": 0,
      "CG Internal Resources": 0,
      "CG Stressor: Disability of PLWD: Behavioral": 0,
      "CG Stressor: Disability of PLWD: Functional": 0,
      "PLWD Health: Physical": 0,
      "PLWD Health: Psychological": 0,
      "Context: PLWD Resources (perceived social support)": 0,
      "Context: Caregiver Resources (perceived social support)": 0,
      "Context: Caregiver Beliefs on Providing Care": 0,
      "Institutionalization/Formal Care Utilization": 0,
      "Other": 0,
      "Quality of Life/Well-being": 0,
      "Relationship Quality": 0
    }
    // let keys = new Set()
    let keys = Object.keys(alldata.Home)
    let all = []
    return new Promise((resolve, reject) => {
      base('Intervention Table').select({

        // filterByFormula: airtableFilters,
        view: "Comprehensive View"
      }).eachPage(function page(records, fetchNextPage) {

        records.forEach(function(record) {
          all.push(record.fields)


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
          //keys.add(clean_setting)
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
              // keys.add(j)
              val[j] = 1
            }
            //console.log("val: ", val)
            alldata[clean_setting] = val
          } else {
            // look up the value dict
            //console.log("heere: ", alldata[clean_setting])
            let val = alldata[clean_setting]
            for (let j of outcomes){
              console.log("J: ", j, val)
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
          console.log('check: ', alldata[key])
          single["data"] = all

          heat_data.push(single)
        }
        //console.log("HEAT DATA: ", heat_data)
        for (let item of heat_data){
          for (let j of keys){
            if (! (Object.keys(item)).includes(j)) {
              item[j] = 0
            }
          }
        }

        heat_data.sort(function(first, second) {
          // console.log("FIRST: ", first.setting)
          return first.setting.length - second.setting.length;
        });

        // (heat_data[0]).sort()
        console.log("heat data: ", heat_data[0])


        heat_result["data"] = heat_data
        let total = sumArray(heat_data)
        console.log("TOTAL: ", total)
        total.data = heat_data[0].data
        total.setting = "Total"

        let all_total = []
        all_total.push(total)
        // heat_data.push(total)

        // console.log("DATATATATA: ", heat_data[0].data[0]["Measurement Tools (Caregiver Outcomes)"][0]["Tool Name"])
        console.log("Heat Data: ", heat_data)


        heat_result["keys"] = [...keys]
        heat_result["total"] = all_total
        resolve(heat_result)

      })
    })
  }// end of get PopulationsData


  const fetchHeatMapData = async () => {
    //console.log("fetchPopulationData")
    const result = await getHeatMapChartData()
    setHeatMapData(result.data)
    setHeatMapKeys(result.keys)
    setTotalData(result.total)
    console.log("RESULT: ", result)
    setLoadingHeatMapData(false)

  }

  useEffect(() => {
    if (initialFilterLoadComplete){
      setLoadingHeatMapData(true);
      fetchHeatMapData();
    }


  },[initialFilterLoadComplete])



  return (
    <div>

      <Container>
        <div>
          <div>

            <PrismHeatMap
              marginBottom={0}
              marginTop={300}
              marginLeft={200}
              marginRight={50}
              chartHeight={800}
              data={heatMapData}
              keys={heatMapKeys}
            />
            <PrismHeatMap
                marginBottom={0}
                marginTop={0}
                marginLeft={200}
                marginRight={50}
                chartHeight={80}
                data={totalData}
                keys={heatMapKeys}
            />
          </div>
        </div>

      </Container>
    </div>

  )
}



export default withRouter(DashboardRoute);
