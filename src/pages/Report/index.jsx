import { useEffect, useState } from 'react';
import { PDFViewer, Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { useParams } from 'react-router-dom';
// import { getLogsToPrintAction, getTimerLogsOfMachine } from '../../../../../actions/timer';

import Logo from "../../assets/images/logo-dark.png"

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    fontSize: 12
  },
  viewer: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  image: {
    width: 200,
    marginBottom: 20
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    borderBottomStyle: 'solid',
    paddingTop: 10
  },
  col1: {
    width: '5%'
  },
  col2: {
    width: '10%'
  },
  col3: {
    width: '20%'
  },
  col4: {
    width: '20%'
  },
  col5: {
    width: '10%'
  },
  col6: {
    width: '20%'
  },
  col7: {
    width: '10%'
  },
  col8: {
    width: '10%'
  }
});

const ReportPage = (props) => {
  const [loading, setLoading] = useState(true)

  const { city, classify, machine, from, to } = useParams()
  const [logs, setLogs] = useState([])

  // const page = 0;

  const getReports = async () => {
    // setLoading(true)
    // const items_per_page = 100
    // const res = await getTimerLogsOfMachine(
    //   machine,
    //   classify,
    //   from,
    //   to,
    //   0,
    //   true,
    //   0,
    //   city,
    //   8,
    //   '',
    // )
    // const data = await getLogsToPrintAction(0, 0, from, to, 1, 1, classify, city, items_per_page);
    // let _logs = data.logs, page = 2

    // // while (page < 5) {
    // //   const _data = await getLogsToPrintAction(0, 0, from, to, page, 1, classify, city, items_per_page);
    // //   _logs = _logs.concat(_data.logs)
    // //   page++
    // // }
    // setLogs(_logs)
    setLoading(false)
  }

  useEffect(() => {
    console.log ('useEffect')
    getReports()
  }, [])

  return ((!loading) ? 
    <PDFViewer style={styles.viewer}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Image src={Logo} style={styles.image}/>
            <View style={styles.row}>
              <Text style={styles.col1}>No</Text>
              <Text style={styles.col2}>City</Text>
              <Text style={styles.col3}>Machine</Text>
              <Text style={styles.col4}>Part</Text>
              <Text style={styles.col5}>Id</Text>
              <Text style={styles.col6}>Start</Text>
              <Text style={styles.col7}>Duration</Text>
            </View>
            {
              logs.map((log, index) => (
                <View style={styles.row} key={"log"+index}>
                  <Text style={styles.col1}>{logs.length - index}</Text>
                  <Text style={styles.col2}>{city}</Text>
                  <Text style={styles.col3}>{log.machine}</Text>
                  <Text style={styles.col4}>{log.part}</Text>
                  <Text style={styles.col5}>{log.id}</Text>
                  <Text style={styles.col6}>{log.startTime}</Text>
                  <Text style={styles.col7}>{log.time} s</Text>
                </View>
              ))
            }
          </View>
        </Page>
      </Document>
    </PDFViewer> :
    <h1 className="mt-3 ms-5">Loading...</h1>)
}

export default ReportPage;