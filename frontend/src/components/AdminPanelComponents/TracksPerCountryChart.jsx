import React from 'react';
import {
  VictoryChart,
  VictoryAxis,
  VictoryBar,
} from 'victory';
import { useTranslation } from 'react-i18next';

const TracksPerCountryChart = ({ data }) => {
  const { t } = useTranslation();
  const formattedData = data.map(item => ({
    x: item.country,
    y: item.count,
  }));

  // Determine the maximum y-value to set integer ticks appropriately
  const maxY = Math.max(...formattedData.map(d => d.y), 0);
  const yAxisTicks = Array.from({ length: maxY + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xl font-semibold text-mainYellow mb-4">{t('admin.trackCountryStats')}</p>
      <VictoryChart
        domainPadding={{ x: 40 }}
        padding={{ top: 20, bottom: 70, left: 50, right: 20 }}
        theme={{
          axis: {
            style: {
              tickLabels: { fill: 'white', fontSize: 10, padding: 5 },
              axisLabel: { fill: 'white', fontSize: 12, padding: 30 }
            }
          },
          bar: {
            style: {
              labels: { fill: 'white', fontSize: 12 }
            }
          },
          tooltip: {
            style: { fill: 'white', fontSize: 12 }
          }
        }}
      >
        <VictoryAxis
          dependentAxis
          tickValues={yAxisTicks} // Set explicit integer tick values
          style={{
            axis: { stroke: "#F7FEBE" },
            grid: {
              stroke: "#6B7280",
              strokeWidth: 0.5
            },
            ticks: { stroke: "transparent" },
            tickLabels: { fill: 'white', fontSize: 10, padding: 5 }
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: "#F7FEBE" },
            grid: { stroke: "transparent" },
            ticks: { stroke: "transparent" },
            tickLabels: { angle: -45, fontSize: 10, padding: 15, fill: 'white' } 
          }}
        />
        <VictoryBar
          data={formattedData}
          style={{
            data: { fill: "#F04642", width: 20 },
            labels: { fill: "#F7FEBE", fontSize: 12 }
          }}
        />
      </VictoryChart>
    </div>
  );
};

export default TracksPerCountryChart;