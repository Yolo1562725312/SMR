<template>
  <div class="page-container">
    <el-page-header @back="router.back()" :content="room?.name" />
    <div v-if="room" style="margin-top: 20px">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="会议室名称">{{ room.name }}</el-descriptions-item>
              <el-descriptions-item label="位置">{{ room.location }}</el-descriptions-item>
              <el-descriptions-item label="容量">{{ room.capacity }} 人</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="room.status === 'available' ? 'success' : 'danger'">
                  {{ room.status === 'available' ? '可用' : '停用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">{{ room.description || '暂无描述' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>设备列表</span>
                <el-button v-if="userStore.isAdmin()" size="small" type="primary" @click="showEquipDialog = true">添加</el-button>
              </div>
            </template>
            <el-table :data="room.equipment || []" size="small">
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="category" label="类型" />
              <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.status === 'normal' ? 'success' : 'warning'">{{ row.status === 'normal' ? '正常' : '维修' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60">
                <template #default="{ row }">
                  <el-button v-if="userStore.isAdmin()" size="small" type="danger" link @click.stop="handleDeleteEquip(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      <div style="margin-top: 20px; text-align: center">
        <el-button type="primary" size="large" @click="router.push({ path: '/reservations/create', query: { roomId: String(room.id) } })">
          预约此会议室
        </el-button>
      </div>
    </div>

    <el-dialog v-model="showEquipDialog" title="添加设备" width="400px">
      <el-form :model="equipForm" label-width="60px">
        <el-form-item label="名称">
          <el-input v-model="equipForm.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="equipForm.category" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="equipForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEquipDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddEquip">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getRoom, addEquipment, deleteEquipment } from '@/api/room';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const room = ref<any>(null);
const showEquipDialog = ref(false);
const equipForm = reactive({ name: '', category: '', description: '' });

const loadRoom = async () => {
  try {
    room.value = await getRoom(Number(route.params.id));
  } catch (e) {}
};

const handleAddEquip = async () => {
  try {
    await addEquipment({ ...equipForm, roomId: Number(route.params.id) });
    ElMessage.success('添加成功');
    showEquipDialog.value = false;
    equipForm.name = '';
    equipForm.category = '';
    equipForm.description = '';
    loadRoom();
  } catch (e) {}
};

const handleDeleteEquip = async (id: number) => {
  try {
    await deleteEquipment(id);
    ElMessage.success('删除成功');
    loadRoom();
  } catch (e) {}
};

onMounted(loadRoom);
</script>
