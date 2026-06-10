import request from './request';

export function getDashboard() {
  return request.get('/statistics/dashboard');
}

export function getRoomUsageRate(startDate: string, endDate: string) {
  return request.get('/statistics/room-usage', { params: { startDate, endDate } });
}

export function getReservationStats(startDate: string, endDate: string) {
  return request.get('/statistics/reservations', { params: { startDate, endDate } });
}

export function getCheckinStats(startDate: string, endDate: string) {
  return request.get('/statistics/checkins', { params: { startDate, endDate } });
}
