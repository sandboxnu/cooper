import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

type Data = {
  value?: number;
  name?: string;
}[];

interface DonutChartProps {
  data: Data;
  width?: string;
  height?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = "100%",
  height = "400px",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);

      const option: echarts.EChartsOption = {
        tooltip: { show: false },
        legend: {
          left: "50%",
          top: "20%",
          orient: "vertical",
          itemWidth: 25,
          itemHeight: 25,
          icon: "circle",
          selectedMode: false,
        },
        series: [
          {
            name: "Access From",
            type: "pie",
            radius: ["25%", "55%"],
            center: ["20%", "40%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            color: ["#edd8af", "#caedea", "#ddb4e0"],
            label: { show: false, position: "center" },
            emphasis: {
              scale: false,
              label: { show: false },
            },
            labelLine: { show: false },
            data,
          },
        ],
      };

      chartInstance.current.setOption(option);
    }
    return () => {
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width, height }} />;
};

export default DonutChart;
