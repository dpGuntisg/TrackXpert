import React from 'react';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryLabel,
} from 'victory';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const UserGrowthChart = ({ data }) => {
  const { t } = useTranslation();
  const now = new Date();
  const currentMonthName = format(now, 'MMMM');
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentMonthData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const foundDay = data.find(item => item.day === day);
    return { day, userCount: foundDay ? foundDay.count : 0 };
  });

  // Determine the maximum y-value for better scaling
  const maxY = Math.max(...currentMonthData.map(d => d.userCount), 0);
  const yAxisTicks = Array.from({ length: maxY + 1 }, (_, i) => i);

  return (
    <div className="w-full rounded-xl p-6">
      <p className="text-sm text-gray-300 mb-4 text-center">{t(`common.${currentMonthName.toLowerCase()}`)}</p>
      <VictoryChart
        padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        domainPadding={{ x: 10 }}
        theme={{
          axis: {
            style: {
              tickLabels: { fill: 'white', fontSize: 10, padding: 5 },
              axisLabel: { fill: 'white', fontSize: 12, padding: 30 }
            }
          },
          line: {
            style: {
              data: { stroke: "#F04642", strokeWidth: 3 },
              labels: { fill: 'white', fontSize: 12 }
            }
          },
        }}
      >
        <VictoryAxis
          dependentAxis
          tickValues={yAxisTicks}
          style={{
            axis: { stroke: "#374151" },
            grid: {
              stroke: "#273a3f",
              strokeWidth: 0.5
            },
            ticks: { stroke: "transparent" },
            tickLabels: { fill: 'white', fontSize: 10, padding: 5 }
          }}
          label={t('admin.userCount')}
          axisLabelComponent={<VictoryLabel dy={-20} />}
        />
        <VictoryAxis
          tickValues={currentMonthData.map(d => d.day)}
          style={{
            axis: { stroke: "#374151" },
            grid: { stroke: "transparent" },
            ticks: { stroke: "transparent" },
            tickLabels: { fill: 'white', fontSize: 10, padding: 5 }
          }}
          label={t('admin.dayOfMonth')}
          axisLabelComponent={<VictoryLabel dx={20} dy={20} />}
        />
        <VictoryLine
          data={currentMonthData}
          x="day"
          y="userCount"
        />
      </VictoryChart>
    </div>
  );
};

export default UserGrowthChart;