<template>
  <div class="page-container">
    <div class="page-header">
      <h2>预约管理</h2>
      <el-button type="primary" @click="router.push('/reservations/create')">新建预约</el-button>
    </div>
    <el-card>
      <div style="margin-bottom: 16px; display: flex; gap: 12px">
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px" @change="loadReservations">
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已取消" value="cancelled" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </div>
      <el-table :data="reservations" stripe>
        <el-table-column prop="title" label="会议主题" width="200" />
        <el-table-column prop="room.name" label="会议室" width="120" />
        <el-table-column label="预约人" width="100">
          <template #default="{ row }">{{ row.user?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="开始时间" width="170">
          <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="170">
          <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending' && userStore.isAdmin()" size="small" type="success" @click="handleConfirm(row.id)">确认</el-button>
            <el-button v-if="row.status === 'pending' || row.status === 'confirmed'" size="small" type="warning" @click="handleCancel(row.id)">取消</el-button>
            <el-button v-if="row.status === 'confirmed'" size="small" type="primary" @click="handleCheckin(row.id)">签到</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import { getReservations, confirmReservation, cancelReservation } from '@/api/reservation';
import { checkin } from '@/api/checkin';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const reservations = ref<any[]>([]);
const filterStatus = ref('');

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

const statusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'info' };
  return map[status] || 'info';
};

const statusText = (status: string) => {
  const map: Record<string, string> = { pending: '待确认', confirmed: '已确认', cancelled: '已取消', completed: '已完成' };
  return map[status] || status;
};

const loadReservations = async () => {
  try {
    const params: any = {};
    if (filterStatus.value) params.status = filterStatus.value;
    reservations.value = await getReservations(params);
  } catch (e) {}
};

const handleConfirm = async (id: number) => {
  try {
    await confirmReservation(id);
    ElMessage.success('已确认');
    loadReservations();
  } catch (e) {}
};

const handleCancel = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定取消此预约？', '提示');
    await cancelReservation(id);
    ElMessage.success('已取消');
    loadReservations();
  } catch (e) {}
};

const handleCheckin = async (id: number) => {
  try {
    await checkin(id);
    ElMessage.success('签到成功');
    loadReservations();
  } catch (e) {}
};

onMounted(loadReservations);
</script>
