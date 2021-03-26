import React, { useCallback, useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsiveHeatMap } from '@nivo/heatmap'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'
import LandscapeTooltip from '../landscape-tooltip'
import Modal from 'react-modal';
import MainTable from '../tabulator'
import ModalTable from '../modal-table'
import './index.css'

//import ChartTooltip from '../tooltip'
//import { COLORS, COLOR_SCHEMES } from '../../../../constants'

import './index.css'

const PrismHeatMap = (props) => {
  // console.log("props.fdatda: ", props.data)
  let all_records = []
  if (typeof((props.data)[0]) !== 'undefined'){
    all_records = (props.data)[0]
  }

  //console.log("ALL reecords", all_records)
  // console.log(all_records["data"])
  // console.log("HERE: ", all_records["Other"], all_records.setting)

  var subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [allTableData, setAllTableData] = useState([])
  const [tables, setTables] = useState([])
  const [modalTitle, setModalTitle] = useState("")

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = '#f00';
  }

  function closeModal(){
    setIsOpen(false);
  }

  function allModal(node, e, all_records){
    console.log("NODE: ", node)
    console.log("E: ", e)
    //console.log("type: ", typeof(node.data.formattedX))
    let title= node.xKey + " by " + node.yKey
    // if (typeof(node.data.formattedX)==='object'){
    //   let x = String(node.data.x)
    //   title = x.slice(4, 15) + " x " + node.data.y
    // } else {
    //   title = node.data.x + " x " + node.data.y
    // }
    let clean_all = (all_records[0]).data
    console.log("CLEAN ALL: ", clean_all)
    let alltables = []
    //console.log("CHECKING: ", node.data.all)
    // let complete = node.data.all
    let ys = (node.yKey).split(" + ")
    console.log("Ys: ", ys)

    let clean_data = []
    // console.log("all recrods: ", all_records)
    for (let i of clean_all){
      //console.log("BIG: ", (i["Combined Outcome Categories"]).includes(node.xKey))
    //  console.log("BIG2: ", String(i["Intervention Setting"])===String(ys))
      if ((i["Combined Outcome Categories"]).includes(node.xKey) && (i["Intervention Setting"]).length === ys.length){
        console.log("IIIII: ", i)
        if (String(i["Intervention Setting"])===String(ys)){
          i["key"] = clean_all.indexOf(i)
          clean_data.push(i)
        }
      }

    }
    console.log("clean_data: ", clean_data)

    setAllTableData(alltables)
    let table = []
    // for (let item of clean_all){
    //   // console.log("complete[item]: ", clean_all)
    //   table.push(<div>
    //       <h3>{item}</h3>
    //       <MainTable tabledata={ clean_data } height={"auto"} />
    //     </div>
    //   )
    // }
    table.push(<div>
          
          <MainTable tabledata={ clean_data } height={"auto"} />
        </div>

    )
    console.log(table)
    setTables(table)
    setModalTitle(title)
    openModal()
  }


  return (
    <div className="heat-map-container">
    <ResponsiveHeatMap
        data={props.data}
        keys={props.keys}
        indexBy={"setting"}
        margin={{ top: 200, right: 40, bottom: 60, left: 300 }}
        forceSquare={true}
        colors="YlGn"
        axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: -90, legend: '', legendOffset: 36 }}
        axisRight={null}
        axisBottom={null}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,

            legendPosition: 'middle',
            legendOffset: -40
        }}


        onClick={(node, e) => allModal(node, e, props.data)}
        hoverTarget="cell"
        cellHoverOthersOpacity={0.25}
    />
    <div className="scatter-modal">
    <Modal
      isOpen={modalIsOpen}
      onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      contentLabel="Example Modal"
      ariaHideApp={false}
      className="Modal"
    >
      <h2 ref={_subtitle => (subtitle = _subtitle)}>{modalTitle}</h2>
      <button className="close-btn" onClick={closeModal}>close</button>

      <div className="tableholder">
        {tables}
      </div>

    </Modal>
    </div>
    </div>



  )

}
export default PrismHeatMap;
