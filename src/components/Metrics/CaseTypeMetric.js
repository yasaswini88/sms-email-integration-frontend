import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const CaseTypeMetric = ({ firmId }) => {

  const [options, setOptions] = useState({
    chart: {
      type: 'treemap'
    },
    title: {
      text: 'Case Type Metrics'
    },
    plotOptions: {
      treemap: {
        distributed: true,
        colorScale: {
          ranges: [
            {
              from: -6,
              to: 0,
              color: '#fb8500'
            },
            {
              from: 0.001,
              to: 6,
              color: '#65B12C'
            }
          ]
        }
      }
    }
  });

  const [series, setSeries] = useState([
    {
      data: [
        { x: 'Criminal Defense', y: 10 },
        { x: 'Personal Injury', y: 4 },
        { x: 'Family Law', y: 22 },
        { x: 'Wills and Trusts', y: 11 },
        { x: 'Real Estate', y: 9 },
        { x: 'Bankruptcy', y: 3 },
        { x: 'Civil Litigation', y: 7 }
      ]
    }
  ]);

  useEffect(() => {
    loadMetricsData();
  }, [firmId]);

  const loadMetricsData = async () => {
    try {
      var response = await axios.get(
        `http://23.23.199.217:8080/api/metrics/customer/caseType/1`
      );
      console.log(response.data);
      var caseTypes = []
      response.data.forEach(element => {
        caseTypes.push({ x: element.caseType, y: element.count });
      });
      setSeries([{ data: caseTypes }]);
    } catch (error) {
      console.error("Error assigning conversation:", error);
    }
  };

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="treemap"
        height="350"
      />
    </div>
  );
};

export default CaseTypeMetric;