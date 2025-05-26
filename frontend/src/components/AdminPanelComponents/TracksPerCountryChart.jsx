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

  if (!data || data.length === 0) {
  return (
    <div className="text-center py-8 text-gray-400">
      {t('admin.noDataAvailable')}
    </div>
  );
}
  return (
    <div className="w-full mt-20"> 
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
              data: { fill: "#F04642" },
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
            axis: { stroke: "#374151" }, 
            grid: {
              stroke: "#273a3f",
              strokeWidth: 0.5
            },
            ticks: { stroke: "transparent" },
            tickLabels: { fill: 'white', fontSize: 10, padding: 5 }
          }}
        />
        <VictoryAxis
          style={{
            axis: { stroke: "#374151" },
            grid: { stroke: "transparent" },
            ticks: { stroke: "transparent" },
            tickLabels: { angle: -45, fontSize: 10, padding: 15, fill: 'white' }
          }}
        />
        <VictoryBar
          data={formattedData}
          style={{
            data: { fill: "#F04642", width: 20 },
            labels: { fill: 'white', fontSize: 12 }
          }}
        />
      </VictoryChart>
    </div>
  );
};

export default TracksPerCountryChart;