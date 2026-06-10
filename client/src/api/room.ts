import request from './request';

export function getRooms() {
  return request.get('/rooms');
}

export function getRoom(id: number) {
  return request.get(`/rooms/${id}`);
}

export function createRoom(data: any) {
  return request.post('/rooms', data);
}

export function updateRoom(id: number, data: any) {
  return request.put(`/rooms/${id}`, data);
}

export function deleteRoom(id: number) {
  return request.delete(`/rooms/${id}`);
}

export function addEquipment(data: any) {
  return request.post('/rooms/equipment', data);
}

export function deleteEquipment(id: number) {
  return request.delete(`/rooms/equipment/${id}`);
}
