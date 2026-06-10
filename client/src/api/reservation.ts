import request from './request';

export function getReservations(params?: any) {
  return request.get('/reservations', { params });
}

export function getReservation(id: number) {
  return request.get(`/reservations/${id}`);
}

export function createReservation(data: any) {
  return request.post('/reservations', data);
}

export function updateReservation(id: number, data: any) {
  return request.put(`/reservations/${id}`, data);
}

export function confirmReservation(id: number) {
  return request.put(`/reservations/${id}/confirm`);
}

export function cancelReservation(id: number) {
  return request.put(`/reservations/${id}/cancel`);
}

export function deleteReservation(id: number) {
  return request.delete(`/reservations/${id}`);
}

export function getRoomSchedule(roomId: number, startDate: string, endDate: string) {
  return request.get(`/reservations/room/${roomId}/schedule`, { params: { startDate, endDate } });
}
