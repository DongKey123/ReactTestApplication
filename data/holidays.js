import Holidays from "date-holidays";

// 한국 공휴일 인스턴스 생성
const hd = new Holidays("KR");

// 특정 날짜가 공휴일인지 확인
export const isHoliday = (dateString) => {
  const result = hd.isHoliday(new Date(dateString));
  return result && result.length > 0;
};

// 공휴일 이름 가져오기
export const getHolidayName = (dateString) => {
  const result = hd.isHoliday(new Date(dateString));
  if (result && result.length > 0) {
    return result[0].name;
  }
  return null;
};

// 특정 연도의 모든 공휴일 가져오기
export const getHolidaysForYear = (year) => {
  return hd.getHolidays(year);
};

// 달력에 표시할 공휴일 마커 생성 (특정 월)
export const getHolidayMarkers = (year, month) => {
  const holidays = hd.getHolidays(year);
  const markers = {};

  holidays.forEach((holiday) => {
    const date = new Date(holiday.date);
    const holidayMonth = date.getMonth() + 1;

    // 해당 월의 공휴일만 필터링 (month가 지정된 경우)
    if (!month || holidayMonth === month) {
      const dateString = date.toISOString().split("T")[0];
      markers[dateString] = {
        name: holiday.name,
        marked: true,
        dotColor: "#F44336",
      };
    }
  });

  return markers;
};

// 현재 연도 기준 공휴일 마커 (달력용)
export const getCurrentYearHolidayMarkers = () => {
  const currentYear = new Date().getFullYear();
  // 현재 연도와 다음 연도 공휴일 포함
  return {
    ...getHolidayMarkers(currentYear),
    ...getHolidayMarkers(currentYear + 1),
  };
};
