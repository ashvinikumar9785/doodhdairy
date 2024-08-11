const moment = require('moment'); // For date manipulation

const utcDateTime = (date = new Date()) => {
  date = new Date(date);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    )
  );
};

const getDaysArray = function(year: number, month: number) {
  console.log(year, 'year', month);
  var monthIndex = month - 1; // 0..11 instead of 1..12
  var date = new Date(year, monthIndex, 1);
  var result = [];
  while (date.getMonth() == monthIndex) {
    result.push(moment(date).format('YYYY-MM-DD'));
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export { utcDateTime, getDaysArray };

