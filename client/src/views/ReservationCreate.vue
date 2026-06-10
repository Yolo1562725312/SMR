<template>
  <div class="page-container">
    <el-page-header @back="router.back()" content="新建预约" />
    <el-card style="max-width: 700px; margin: 20px auto">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="会议室" prop="roomId">
          <el-select v-model="form.roomId" placeholder="请选择会议室" style="width: 100%">
            <el-option v-for="room in rooms" :key="room.id" :label="`${room.name} (${room.location})`" :value="room.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议主题" prop="title">
          <el-input v-model="form.title" placeholder="请输入会议主题" />
        </el-form-item>
        <el-form-item label="会议描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入会议描述（选填）" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">提交预约</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getRooms } from '@/api/room';
import { createReservation } from '@/api/reservation';

const router = useRouter();
const route = useRoute();
const formRef = ref();
const loading = ref(false);
const rooms = ref<any[]>([]);

const form = reactive({
  roomId: route.query.roomId ? Number(route.query.roomId) : undefined as number | undefined,
  title: '',
  description: '',
  startTime: '',
  endTime: '',
});

const rules = {
  roomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
  title: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
};

const handleSubmit = async () => {
  await formRef.value?.validate();
  loading.value = true;
  try {
    await createReservation({
      ...form,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
    });
    ElMessage.success('预约成功');
    router.push('/reservations');
  } catch (e) {} finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    rooms.value = await getRooms();
  } catch (e) {}
});
</script>
