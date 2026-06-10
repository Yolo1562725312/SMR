import request from './request';

export function checkin(reservationId: number) {
  return request.post('/checkins', { reservationId });
}

export function checkout(reservationId: number) {
  return request.post(`/checkins/${reservationId}/checkout`);
}

export function getMyCheckins() {
  return request.get('/checkins/my');
}

export function getReservationCheckins(reservationId: number) {
  return request.get(`/checkins/reservation/${reservationId}`);
}
