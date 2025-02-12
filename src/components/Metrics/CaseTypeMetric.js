import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const CaseTypeMetric = ({ firmId }) => {
  const [options, setOptions] = useState({
    chart: {
      type: 'treemap',
    },
    title: {
      text: 'Case Type Metrics',
      align: 'center',
    },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
        colorScale: {
          ranges: [
            {
              from: 1,
              to: 5,
              color: '#ff7f0e', // Orange for lower counts
            },
            {
              from: 6,
              to: 15,
              color: '#2ca02c', // Green for moderate counts
            },
            {
              from: 16,
              to: 50,
              color: '#1f77b4', // Blue for high counts
            },
          ],
        },
      },
    },
  });

  const [series, setSeries] = useState([{ data: [] }]);

  useEffect(() => {
    if (firmId) {
      loadMetricsData();
    }
  }, [firmId]);

  const loadMetricsData = async () => {
    try {
      const response = await axios.get(
        `http://23.23.199.217:8080/api/metrics/customer/caseType/${firmId}`
      );

      const caseTypes = response.data.map((element) => ({
        x: element.caseType,
        y: element.count,
      }));

      setSeries([{ data: caseTypes }]);
    } catch (error) {
      console.error("Error fetching case type metrics:", error);
    }
  };

  return (
    <div>
      {series[0].data.length > 0 ? (
        <Chart options={options} series={series} type="treemap" height="350" />
      ) : (
        <p style={{ textAlign: 'center', color: '#777', marginTop: '20px' }}>
          No data available
        </p>
      )}
    </div>
  );
};

export default CaseTypeMetric;


