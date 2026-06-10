<template>
  <div class="page-container">
    <div class="page-header">
      <h2>仪表盘</h2>
    </div>
    <div class="card-row">
      <el-card class="stat-card">
        <div class="stat-value">{{ stats.todayReservations || 0 }}</div>
        <div class="stat-label">今日预约</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-value">{{ stats.totalRooms || 0 }}</div>
        <div class="stat-label">会议室总数</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-value" style="color: #67c23a">{{ stats.availableRooms || 0 }}</div>
        <div class="stat-label">可用会议室</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-value" style="color: #e6a23c">{{ stats.activeCheckins || 0 }}</div>
        <div class="stat-label">正在使用</div>
      </el-card>
    </div>
    <el-card>
      <template #header>
        <span>我的近期预约</span>
      </template>
      <el-table :data="reservations" stripe>
        <el-table-column prop="title" label="会议主题" />
        <el-table-column prop="room.name" label="会议室" />
        <el-table-column label="开始时间">
          <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="结束时间">
          <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { getDashboard } from '@/api/statistics';
import { getReservations } from '@/api/reservation';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const stats = ref<any>({});
const reservations = ref<any[]>([]);

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const statusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'info' };
  return map[status] || 'info';
};

const statusText = (status: string) => {
  const map: Record<string, string> = { pending: '待确认', confirmed: '已确认', cancelled: '已取消', completed: '已完成' };
  return map[status] || status;
};

onMounted(async () => {
  try {
    stats.value = await getDashboard();
    const data = await getReservations({ userId: userStore.userInfo.id });
    reservations.value = (Array.isArray(data) ? data : []).slice(0, 10);
  } catch (e) {}
});
</script>
