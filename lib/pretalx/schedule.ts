import { format, isSameDay, parseISO } from "date-fns";
import { Response } from "./schedule-types";
import { timeToNumber } from "components/schedule/time-helpers";
import { slugify } from "../pretix/utils/slugify";

export type Schedule = {
  rooms: string[];
  rows: Row[];
  days: Date[];
};

type Row = {
  time: string;
  type: "break" | "session" | "empty";
} & (
  | {
      type: "break";
      title: string;
      style: RowStyle & ColumnStyle;
    }
  | {
      type: "session";
      sessions: Session[];
      style: RowStyle;
    }
  | {
      type: "empty";
      style: RowStyle;
    }
);

export type Session = {
  title: string;
  speakers: {
    name: string;
    slug: string;
  }[];
  room: string;
  style: ColumnStyle & RowStyle;
  type: string;
  experience: string;
  duration: number;
  slug: string;
  start: string;
  end: string;
};

type ColumnStyle = {
  gridColumnStart: number;
  gridColumnEnd: number;
};

type RowStyle = {
  gridRowStart: number;
  gridRowEnd: number;
};

const getRooms = async () => {
  // rooms in the schedule API are not ordered so we use the ones from the
  // export API instead
  const response = await fetch(
    "https://program.europython.eu/europython-2023/schedule/export/schedule.json"
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();

  return data.schedule.conference.rooms.map(
    (room: { name: string }) => room.name
  ) as string[];
};

// This API is not public, so it might change in the future
export async function getSchedule(day: string) {
  const response = await fetch(
    "https://pretalx.com/api/events/europython-2023/schedules/latest/"
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = (await response.json()) as Response;
  const date = parseISO(day);

  const orderedRooms = await getRooms();

  const days = Array.from(
    new Set(
      data.slots.map((item) => format(parseISO(item.slot.start), "yyyy-MM-dd"))
    )
  )
    .map((day) => parseISO(day))
    .sort((a, b) => a.getTime() - b.getTime());

  const items = data.slots
    .filter((item) => isSameDay(date, parseISO(item.slot.start)))
    .filter((item) => !item.title.toLowerCase().includes("placeholder"));
  const breaks = data.breaks.filter((item) =>
    isSameDay(date, parseISO(item.start))
  );

  const roomsForDay = Array.from(
    new Set(items.flatMap((item) => item.slot.room.en))
  );
  const rooms = orderedRooms.filter((room) => roomsForDay.includes(room));

  const getColumns = (room: string) => {
    const index = rooms.indexOf(room);
    return {
      gridColumnStart: index + 2,
      gridColumnEnd: index + 3,
    };
  };

  const slotsByTime = items.reduce((acc, item) => {
    const time = format(parseISO(item.slot.start), "HH:mm");
    const timeEnd = format(parseISO(item.slot.end), "HH:mm");

    if (!acc[time]) {
      acc[time] = [];
    }

    // remove this if it is in a break?
    if (!acc[timeEnd]) {
      acc[timeEnd] = [];
    }

    acc[time].push(item);

    return acc;
  }, {} as { [key: string]: typeof items });

  const breaksByTime = breaks.reduce((acc, item) => {
    const time = format(parseISO(item.start), "HH:mm");

    if (!acc[time]) {
      acc[time] = [];
    }

    acc[time].push(item);

    return acc;
  }, {} as { [key: string]: typeof breaks });

  let currentRow = 2;

  const bareRows = Object.entries(slotsByTime)
    .map(([time, slots]) => {
      if (slots.length === 0) {
        return {
          time,
          type: "empty",
        } as Row;
      }

      return {
        time,
        type: "session",
        sessions: slots.map((slot) => ({
          title: slot.title,
          speakers: slot.speakers.map((speaker) => ({
            name: speaker.name,
            // TODO: use our slug
            slug: speaker.code,
          })),
          duration: slot.duration,
          room: slot.slot.room.en,
          type: slot.submission_type.en,
          slug: slugify(slot.title),
          start: slot.slot.start,
          end: slot.slot.end,
        })),
      } as Row;
    })
    .concat(
      Object.entries(breaksByTime).map(([time, breaks]) => {
        return {
          time,
          type: "break",
          title: breaks[0].description.en,
          // TODO: maybe add rooms?
        } as Row;
      })
    )
    .sort((a, b) => {
      return timeToNumber(a.time) - timeToNumber(b.time);
    });

  let currentRowMap = 2;

  const rowTimeMap = Object.fromEntries(
    bareRows.map((row) => {
      const time = row.time;

      currentRowMap += 1;

      return [time, currentRowMap - 1];
    })
  );

  const rows = bareRows.map((row) => {
    if (row.type === "break") {
      row.style = {
        gridColumnStart: 1,
        gridColumnEnd: rooms.length + 2,
        gridRowStart: rowTimeMap[row.time],
        gridRowEnd: rowTimeMap[row.time] + 1,
      };
    } else {
      row.style = {
        gridRowStart: rowTimeMap[row.time],
        gridRowEnd: rowTimeMap[row.time] + 1,
      };

      if (row.type === "session") {
        row.sessions = row.sessions.map((session) => {
          const start = format(parseISO(session.start), "HH:mm");
          const end = format(parseISO(session.end), "HH:mm");

          session.style = {
            ...getColumns(session.room),
            gridRowStart: rowTimeMap[start],
            gridRowEnd: rowTimeMap[end],
          };

          return session;
        });
      }
    }

    currentRow += 1;

    return row;
  });

  return {
    rooms: rooms,
    rows,
    days,
  } as Schedule;
}
