<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会议室管理</h2>
      <el-button v-if="userStore.isAdmin()" type="primary" @click="showAddDialog = true">新增会议室</el-button>
    </div>
    <el-row :gutter="16">
      <el-col :span="8" v-for="room in rooms" :key="room.id">
        <el-card style="margin-bottom: 16px" shadow="hover" @click="router.push(`/rooms/${room.id}`)">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-weight: 600">{{ room.name }}</span>
              <el-tag :type="room.status === 'available' ? 'success' : 'danger'">
                {{ room.status === 'available' ? '可用' : '停用' }}
              </el-tag>
            </div>
          </template>
          <p style="color: #606266; margin-bottom: 8px">位置：{{ room.location }}</p>
          <p style="color: #606266; margin-bottom: 8px">容量：{{ room.capacity }} 人</p>
          <p style="color: #909399; font-size: 13px">{{ room.description || '暂无描述' }}</p>
          <div style="margin-top: 12px">
            <el-tag v-for="eq in (room.equipment || []).slice(0, 3)" :key="eq.id" size="small" style="margin-right: 4px">
              {{ eq.name }}
            </el-tag>
            <el-tag v-if="(room.equipment || []).length > 3" size="small" type="info">
              +{{ room.equipment.length - 3 }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAddDialog" title="新增会议室" width="500px">
      <el-form :model="roomForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="roomForm.name" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="roomForm.location" />
        </el-form-item>
        <el-form-item label="容量">
          <el-input-number v-model="roomForm.capacity" :min="1" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roomForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddRoom">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getRooms, createRoom } from '@/api/room';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const rooms = ref<any[]>([]);
const showAddDialog = ref(false);
const roomForm = reactive({ name: '', location: '', capacity: 10, description: '' });

const loadRooms = async () => {
  try {
    rooms.value = await getRooms();
  } catch (e) {}
};

const handleAddRoom = async () => {
  try {
    await createRoom(roomForm);
    ElMessage.success('创建成功');
    showAddDialog.value = false;
    roomForm.name = '';
    roomForm.location = '';
    roomForm.capacity = 10;
    roomForm.description = '';
    loadRooms();
  } catch (e) {}
};

onMounted(loadRooms);
</script>
