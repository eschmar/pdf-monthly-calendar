import dayjs from "dayjs";
import "./normalize.css";
import "./print.css";
import "./styles.css";
const weekday = require("dayjs/plugin/weekday");
const weekOfYear = require("dayjs/plugin/weekOfYear");

dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY = dayjs().format("YYYY-MM-DD");

const INITIAL_YEAR = dayjs().format("YYYY");
const INITIAL_MONTH = dayjs().format("M");

let currentMonthDays;
let previousMonthDays;
let nextMonthDays;

const app = document.getElementById("app");
app.innerHTML = '';

/** Parse input parameters */

const CAL_NUM_MONTHS_AHEAD = 18;



/** Generate calendar months */

let year = parseInt(INITIAL_YEAR);
let month = parseInt(INITIAL_MONTH);
for (let i = 0; i < CAL_NUM_MONTHS_AHEAD; i++) {
  console.log("Generating: ", year, month)
  generateCalendarMonth(year, month++);

  if (month == 13) {
    year += 1;
    month = 1;
  }
}

/** Add print Styles */

const page = document.getElementById("page");
let documentHeight = page.offsetHeight;
const printStyle = document.createElement('style');

printStyle.innerHTML = `
  @page {
    size: 21.0cm ${documentHeight}px;
    margin: 0;
  }
  @media print {
    html, body {
      width: 21.0cm;
      height: ${documentHeight}px;
    }
  }
`;

document.body.appendChild(printStyle);

/** Helpers */

function generateCalendarMonth(year = INITIAL_YEAR, month = INITIAL_MONTH) {
  const wrapperElement = document.createElement("div");
  wrapperElement.classList.add("calendar-month-wrapper");

  const monthElement = document.createElement("div");
  monthElement.classList.add("calendar-month");

  /** Add Weekday Header */
  const daysOfWeekElement = document.createElement("ol");
  daysOfWeekElement.classList.add("days-of-week", "day-of-week");

  WEEKDAYS.forEach((weekday) => {
    const weekDayElement = document.createElement("li");
    daysOfWeekElement.appendChild(weekDayElement);
    weekDayElement.innerText = weekday;
  });

  monthElement.appendChild(daysOfWeekElement);

  /** Add Calendar Days body */
  const calendarDaysElement = document.createElement("ol");
  calendarDaysElement.classList.add("calendar-days", "days-grid");

  currentMonthDays = createDaysForCurrentMonth(
    year,
    month,
    dayjs(`${year}-${month}-01`).daysInMonth()
  );

  previousMonthDays = createDaysForPreviousMonth(year, month);
  nextMonthDays = createDaysForNextMonth(year, month);

  const days = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];

  days.forEach((day) => {
    appendDay(day, calendarDaysElement);
  });

  monthElement.appendChild(calendarDaysElement);

  /** Add current month label */
  const labelElement = document.createElement("div");
  labelElement.classList.add("selected-month");

  const labelSpanElement = document.createElement("span");
  // labelSpanElement.classList.add("day-of-week");

  labelSpanElement.innerText = dayjs(
    new Date(year, month - 1)
  ).format("MMM YY");

  labelElement.appendChild(labelSpanElement);

  /** Append calendar month */
  wrapperElement.appendChild(labelElement);
  wrapperElement.appendChild(monthElement);

  app.appendChild(wrapperElement);
}

function appendDay(day, calendarDaysElement) {
  const dayElement = document.createElement("li");
  const dayElementClassList = dayElement.classList;
  dayElementClassList.add("calendar-day");
  const dayOfMonthElement = document.createElement("span");
  dayOfMonthElement.innerText = day.dayOfMonth;
  dayElement.appendChild(dayOfMonthElement);
  calendarDaysElement.appendChild(dayElement);

  if (!day.isCurrentMonth) {
    dayElementClassList.add("calendar-day--not-current");
  }

  if (day.date === TODAY) {
    dayElementClassList.add("calendar-day--today");
  }
}

function getNumberOfDaysInMonth(year, month) {
  return dayjs(`${year}-${month}-01`).daysInMonth();
}

function createDaysForCurrentMonth(year, month) {
  return [...Array(getNumberOfDaysInMonth(year, month))].map((day, index) => {
    return {
      date: dayjs(`${year}-${month}-${index + 1}`).format("YYYY-MM-DD"),
      dayOfMonth: index + 1,
      isCurrentMonth: true
    };
  });
}

function createDaysForPreviousMonth(year, month) {
  const firstDayOfTheMonthWeekday = getWeekday(currentMonthDays[0].date);

  const previousMonth = dayjs(`${year}-${month}-01`).subtract(1, "month");

  // Cover first day of the month being sunday (firstDayOfTheMonthWeekday === 0)
  const visibleNumberOfDaysFromPreviousMonth = firstDayOfTheMonthWeekday
    ? firstDayOfTheMonthWeekday - 1
    : 6;

  const previousMonthLastMondayDayOfMonth = dayjs(currentMonthDays[0].date)
    .subtract(visibleNumberOfDaysFromPreviousMonth, "day")
    .date();

  return [...Array(visibleNumberOfDaysFromPreviousMonth)].map((day, index) => {
    return {
      date: dayjs(
        `${previousMonth.year()}-${previousMonth.month() + 1}-${
          previousMonthLastMondayDayOfMonth + index
        }`
      ).format("YYYY-MM-DD"),
      dayOfMonth: previousMonthLastMondayDayOfMonth + index,
      isCurrentMonth: false
    };
  });
}

function createDaysForNextMonth(year, month) {
  const lastDayOfTheMonthWeekday = getWeekday(
    `${year}-${month}-${currentMonthDays.length}`
  );

  const nextMonth = dayjs(`${year}-${month}-01`).add(1, "month");

  const visibleNumberOfDaysFromNextMonth = lastDayOfTheMonthWeekday
    ? 7 - lastDayOfTheMonthWeekday
    : lastDayOfTheMonthWeekday;

  return [...Array(visibleNumberOfDaysFromNextMonth)].map((day, index) => {
    return {
      date: dayjs(
        `${nextMonth.year()}-${nextMonth.month() + 1}-${index + 1}`
      ).format("YYYY-MM-DD"),
      dayOfMonth: index + 1,
      isCurrentMonth: false
    };
  });
}

function getWeekday(date) {
  return dayjs(date).weekday();
}
