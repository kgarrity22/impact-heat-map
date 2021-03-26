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

  function allModal(node){
    console.log("NODE: ", node)
    //console.log("type: ", typeof(node.data.formattedX))
    let title=""
    if (typeof(node.data.formattedX)==='object'){
      let x = String(node.data.x)
      title = x.slice(4, 15) + " x " + node.data.y
    } else {
      title = node.data.x + " x " + node.data.y
    }
    let alltables = []
    //console.log("CHECKING: ", node.data.all)
    let complete = node.data.all


    setAllTableData(alltables)
    let table = []
    for (let item of Object.keys(complete)){
      console.log("complete[item]: ", complete)
      table.push(<div>
          <h3>{item}</h3>
          <MainTable tabledata={ complete[item] } height={"auto"} />
        </div>
      )
    }
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


        onClick={(node, e) => allModal(node)}
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
