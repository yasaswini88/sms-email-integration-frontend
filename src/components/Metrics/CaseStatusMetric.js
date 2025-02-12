import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

const CaseStatusMetric = ({ firmId }) => {
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
                return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
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
            categories: [],
        },
        legend: {
            show: false,
        },
    });

    const [series, setSeries] = useState([
        {
            name: "Case Status Distribution",
            data: [],
        },
    ]);

    useEffect(() => {
        if (firmId) {
            loadMetricsData();
        }
    }, [firmId]);

    const loadMetricsData = async () => {
        try {
            const response = await axios.get(
                `http://23.23.199.217:8080/api/metrics/customer/caseStatus/${firmId}`
            );

            const categories = response.data.map((element) => element.status);
            const counts = response.data.map((element) => element.count);

            setOptions((prevOptions) => ({
                ...prevOptions,
                xaxis: { categories },
            }));

            setSeries([{ name: "Case Status Distribution", data: counts }]);
            
            setCount((prevCount) => prevCount + 1);
        } catch (error) {
            console.error("Error fetching case status metrics:", error);
        }
    };

    return (
        <div>
            {count > 0 && (
                <Chart
                    options={options}
                    series={series}
                    type="bar"
                    height="350"
                />
            )}
        </div>
    );
};

export default CaseStatusMetric;
