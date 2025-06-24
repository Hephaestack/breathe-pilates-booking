'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
  // Returns DD/MM/YYYY
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

function getDatesInRange(start, end) {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function ProgramsPage() {
  const { t, i18n } = useTranslation();
  const calendarLocale = i18n.language === 'gr' ? 'el-GR' : 'en-US';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const lastClickRef = useRef({ date: null, time: 0 });
  const justClearedRef = useRef(false);  const router = useRouter();
  
  const [programsByDate, setProgramsByDate] = useState({});

  useEffect(() => {
    fetch('http://localhost:8000/classes')
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        data.forEach(prog => {
          const key = prog.date;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(prog);
        });
        setProgramsByDate(grouped);
      });
  }, []);
  const handleDayClick = (date) => {
    const now = Date.now();
    if (
      lastClickRef.current.date &&
      lastClickRef.current.date.getTime() === date.getTime() &&
      now - lastClickRef.current.time < 300
    ) {
      setSelectedDate(null);
      lastClickRef.current = { date: null, time: 0 };
      justClearedRef.current = true;
    } else {
      setSelectedDate(date);
      lastClickRef.current = { date, time: now };
      justClearedRef.current = false;
    }
  };

  // Get programs for the selected date
  const programsForSelectedDate = selectedDate 
    ? programsByDate[formatDate(selectedDate)] || []
    : [];

  return (    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-[#3a2826] px-6 py-10 w-full flex flex-col items-center max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-9">
          {t('available_programs')}
        </h1>      <div className="calendar-center drop-shadow-xl shadow-[#302f2f]">
          <Calendar
            locale={calendarLocale}
            value={selectedDate}
            onChange={(date) => {
              if (justClearedRef.current) {
                justClearedRef.current = false;
                return;
              }
              setSelectedDate(date);
            }}
            onClickDay={handleDayClick}
            tileClassName={({ date, view }) => {
              const key = formatDate(date);
              if (view === 'month' && programsByDate[key]) {
                return 'has-program';
              }
              return '';
            }}
            tileContent={({ date, view }) =>
              view === 'month' ? (
                <div
                  style={{ width: '100%', height: '100%' }}
                  // If you want to handle double click, define handleDoubleClickDay
                />
              ) : null
            }
          />
        </div>        <div className="flex flex-col items-center w-full p-5 border-[#4A2C2A]/30 shadow-[#3a2826]">
          <h2 className="text-lg font-semibold text-[#4A2C2A] mb-3 text-center">
            {selectedDate ? formatDateDisplay(selectedDate) : ''}
          </h2>
          {programsForSelectedDate.length === 0 ? (
            <p className="text-center text-[#4A2C2A] ">{t('no_programs')}</p>
          ) : (
            <ul className="w-full space-y-4">
              {programsForSelectedDate.map((prog, idx) => {
                const isFull = prog.current_participants >= prog.max_participants;
                const borderColor = isFull
                  ? 'border-red-400'
                  : 'border-green-400';
                return (                  <li
                    key={idx}
                    className={`p-5 rounded-xl bg-[#ffffff] shadow border ${borderColor}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-[#4A2C2A]">
                        {prog.class_name}: {prog.time}
                      </span>
                      <span className="text-sm bold font-black text-[#4A2C2A]">
                        {prog.current_participants} / {prog.max_participants}
                      </span>
                    </div>
                    <div className="flex justify-center mt-4">
                      <button
                        className={`px-5 py-2 rounded-lg text-sm font-semibold shadow transition ${
                          isFull
                            ? 'bg-red-500 text-white cursor-not-allowed'
                            : 'bg-green-400 text-white hover:bg-green-500'
                        }`}
                        disabled={isFull}
                        onClick={() =>
                          router.push(
                            `/book/${formatDate(selectedDate)}?program=${encodeURIComponent(
                              prog.class_name
                            )}`
                          )
                        }
                      >
                        {t('book')}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <style jsx global>{`
        .has-program {
          background: #B5651D !important;
          border-radius: 50% !important;
          color: #065f46 !important;
          font-weight: bold;
          position: relative;
          z-index: 2;
        }
        .react-calendar__tile--range.has-program,
        .react-calendar__tile--active.has-program,
        .react-calendar__tile--rangeStart.has-program,
        .react-calendar__tile--rangeEnd.has-program {
          background: #34d399 !important;
          color: #fff !important;
        }
        .react-calendar__tile--range:not(.has-program),
        .react-calendar__tile--rangeStart:not(.has-program),
        .react-calendar__tile--rangeEnd:not(.has-program) {
          background: #e7c9a9 !important;
          color: #4A2C2A !important;
          border-radius: 50% !important;
        }        .react-calendar__tile--now.react-calendar__tile--range:not(.has-program) {
          background: #e7c9a9 !important;
          color: #4A2C2A !important;
        }
        .react-calendar__tile--now:not(.react-calendar__tile--active) {
          background: #f0e6d6 !important;
          color: #4A2C2A !important;
          border: 2px solid #d4b896 !important;
          border-radius: 50% !important;
          font-weight: 600 !important;
        }
        .react-calendar__tile--now.has-program:not(.react-calendar__tile--active) {
          background: #d4a574 !important;
          color: #4A2C2A !important;
          border: 2px solid #B5651D !important;
        }
      `}</style>
    </div>
  );
}