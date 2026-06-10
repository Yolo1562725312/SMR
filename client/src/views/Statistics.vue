<template>
  <div class="page-container">
    <div class="page-header">
      <h2>使用统计</h2>
      <div style="display: flex; gap: 12px; align-items: center">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="loadAll" />
      </div>
    </div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header><span>会议室使用率</span></template>
          <div ref="roomUsageChartRef" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>预约状态分布</span></template>
          <div ref="reservationPieChartRef" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header><span>签到统计</span></template>
          <div style="text-align: center; padding: 20px 0">
            <div style="font-size: 48px; font-weight: 700; color: #409eff">{{ checkinStats.onTimeRate || 0 }}%</div>
            <div style="color: #909399; margin-top: 8px">准时签到率</div>
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 40px">
              <div>
                <div style="font-size: 24px; font-weight: 600; color: #67c23a">{{ checkinStats.totalCheckins || 0 }}</div>
                <div style="color: #909399">总签到</div>
              </div>
              <div>
                <div style="font-size: 24px; font-weight: 600; color: #f56c6c">{{ checkinStats.lateCheckins || 0 }}</div>
                <div style="color: #909399">迟到</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { getRoomUsageRate, getReservationStats, getCheckinStats } from '@/api/statistics';

const dateRange = ref<[Date, Date]>([
  dayjs().subtract(30, 'day').toDate(),
  dayjs().toDate(),
]);

const roomUsageChartRef = ref<HTMLElement>();
const reservationPieChartRef = ref<HTMLElement>();
const checkinStats = ref<any>({});

let roomUsageChart: echarts.ECharts | null = null;
let reservationPieChart: echarts.ECharts | null = null;

const loadAll = async () => {
  if (!dateRange.value) return;
  const startDate = dayjs(dateRange.value[0]).format('YYYY-MM-DD');
  const endDate = dayjs(dateRange.value[1]).format('YYYY-MM-DD');

  try {
    const [roomUsage, resStats, chkStats] = await Promise.all([
      getRoomUsageRate(startDate, endDate),
      getReservationStats(startDate, endDate),
      getCheckinStats(startDate, endDate),
    ]);

    checkinStats.value = chkStats;

    await nextTick();

    if (roomUsageChartRef.value) {
      if (!roomUsageChart) {
        roomUsageChart = echarts.init(roomUsageChartRef.value);
      }
      roomUsageChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: roomUsage.map((r: any) => r.roomName) },
        yAxis: { type: 'value', name: '使用率(%)', max: 100 },
        series: [{ type: 'bar', data: roomUsage.map((r: any) => r.usageRate), itemStyle: { color: '#409eff' } }],
      });
    }

    if (reservationPieChartRef.value) {
      if (!reservationPieChart) {
        reservationPieChart = echarts.init(reservationPieChartRef.value);
      }
      reservationPieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: resStats.confirmed, name: '已确认', itemStyle: { color: '#67c23a' } },
            { value: resStats.cancelled, name: '已取消', itemStyle: { color: '#f56c6c' } },
            { value: resStats.completed, name: '已完成', itemStyle: { color: '#909399' } },
          ],
        }],
      });
    }
  } catch (e) {}
};

onMounted(loadAll);
</script>
