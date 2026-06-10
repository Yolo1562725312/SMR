<template>
  <div class="page-container">
    <div class="page-header">
      <h2>签到管理</h2>
    </div>
    <el-card>
      <el-table :data="checkins" stripe>
        <el-table-column label="会议主题">
          <template #default="{ row }">{{ row.reservation?.title || '-' }}</template>
        </el-table-column>
        <el-table-column label="会议室">
          <template #default="{ row }">{{ row.reservation?.room?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="签到时间">
          <template #default="{ row }">{{ row.checkinTime ? formatTime(row.checkinTime) : '未签到' }}</template>
        </el-table-column>
        <el-table-column label="签退时间">
          <template #default="{ row }">{{ row.checkoutTime ? formatTime(row.checkoutTime) : '未签退' }}</template>
        </el-table-column>
        <el-table-column label="是否迟到">
          <template #default="{ row }">
            <el-tag :type="row.isLate ? 'danger' : 'success'">{{ row.isLate ? '迟到' : '准时' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag>{{ row.status === 'checked_in' ? '已签到' : row.status === 'checked_out' ? '已签退' : '待签到' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="handleCheckin(row.reservationId)">签到</el-button>
            <el-button v-if="row.status === 'checked_in'" size="small" type="warning" @click="handleCheckout(row.reservationId)">签退</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { getMyCheckins, checkin, checkout } from '@/api/checkin';

const checkins = ref<any[]>([]);

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss');

const loadCheckins = async () => {
  try {
    checkins.value = await getMyCheckins();
  } catch (e) {}
};

const handleCheckin = async (reservationId: number) => {
  try {
    await checkin(reservationId);
    ElMessage.success('签到成功');
    loadCheckins();
  } catch (e) {}
};

const handleCheckout = async (reservationId: number) => {
  try {
    await checkout(reservationId);
    ElMessage.success('签退成功');
    loadCheckins();
  } catch (e) {}
};

onMounted(loadCheckins);
</script>
