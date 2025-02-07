import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

const CaseStatusMetric = ({firmId}) => {
    const [count, setCount] = useState(0);
    const [options, setOptions] = useState({
        chart: {
            type: 'bar',
            height: 350,
            dropShadow: {
              enabled: true,
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 0,
              horizontal: true,
              barHeight: '80%',
              isFunnel: true,
            },
          },
          dataLabels: {
            enabled: true,
            formatter: function (val, opt) {
              return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
            },
            dropShadow: {
              enabled: true,
            },
          },
          title: {
            text: 'Case Status Distribution',
            align: 'middle',
          },
          xaxis: {
            categories: [
            ],
          },
          legend: {
            show: false,
          },
    });

    const [series, setSeries] = React.useState([
        {
          name: "Case Status Distribution",
          data: [],
        },
      ]);

    useEffect(() => {
        loadMetricsData();
      }, [firmId]);
    
      const loadMetricsData = async () => {
        try {
          var response = await axios.get(
            `http://23.23.199.217:8080/api/metrics/customer/caseStatus/1`
          );
          var categories = [], counts = []
          response.data.forEach(element => {
            categories.push(element.status);
            counts.push(element.count);
          })
          
          var newOptions = {...options};
          var newSeries = [...series];
            newSeries[0].data = counts;
            newOptions.xaxis.categories = categories;
       
            setOptions(newOptions);
            setSeries(newSeries);
            setCount(count+1)
        } catch (error) {
          console.error("Error assigning conversation:", error);
        }
      };


  return (
    <div>
      {count > 0 && <Chart
        options={options}
        series={series}
        type="bar"
        height="350"
        count={count}
      />}
    </div>
  );
};

export default CaseStatusMetric;