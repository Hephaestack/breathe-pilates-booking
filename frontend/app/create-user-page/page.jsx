'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

const availableSubscriptions = [
  { id: 1, name: 'Monthly Pilates' },
  { id: 2, name: '10-Class Package' },
  { id: 3, name: 'Unlimited Summer' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    subscription: '',
  });

  const [dateRange, setDateRange] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDateRange([new Date(), new Date()]);
    setMounted(true);
  }, []);

  if (!mounted) return null; // <--- This line ensures nothing is rendered until client-side

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const [startDate, endDate] = dateRange || [];
    alert(
      'User created:\n' +
        JSON.stringify(
          {
            ...form,
            startDate: startDate?.toLocaleDateString('en-GB'),
            endDate: endDate?.toLocaleDateString('en-GB'),
          },
          null,
          2
        )
    );
    setForm({
      name: '',
      phone: '',
      city: '',
      subscription: '',
    });
    setDateRange([new Date(), new Date()]);
  };

  return (
    <div className="  min-h-screen flex flex-col items-center justify-center px-4 py-8 ">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-2xl px-6 py-8 shadow-black">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent  tracking-tight drop-shadow  text-center">
          Create User
        </h1>
        <form className="flex flex-col gap-4 text-[#4A2C2A]" onSubmit={handleSubmit}>
          <label className="font-semibold ">
            Name
            <input
              className="block w-full mt-1 p-2 rounded border focus:outline-none"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label className="font-semibold">
            Phone
            <input
              className="block w-full mt-1 p-2 rounded border focus:outline-none"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>
          <label className="font-semibold">
            Location (City)
            <input
              className="block w-full mt-1 p-2 rounded border focus:outline-none"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </label>
          <label className="font-semibold">
            Subscription
            <select
              className="block w-full mt-1 p-2 rounded border focus:outline-none"
              name="subscription"
              value={form.subscription}
              onChange={handleChange}
              required
            >
              <option value="">Select subscription</option>
              {availableSubscriptions.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </label>
      <label className="font-semibold text-center ">
  Start & End Date
    </label>
     <div className="calendar-center">
   <Calendar
  selectRange
  value={dateRange}
  onChange={setDateRange}
  locale="en-GB"
  tileClassName={({ date }) =>
    date.getDay() === 0 || date.getDay() === 6 ? 'calendar-weekend' : null
  }
/>
     </div>
<div className="mt-2 text-sm text-[#4A2C2A] text-center">
  {dateRange && dateRange[0] && dateRange[1]
    ? `Selected: ${dateRange[0].toLocaleDateString('en-GB')} - ${dateRange[1].toLocaleDateString('en-GB')}`
    : 'Select a start and end date'}
</div>
         
          <button
            type="submit"
            className=" text-white mt-4 px-6 py-2   bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A]  duration-300 ease-in-out font-semibold rounded-xl shadow transition"
          >
            Create
          </button>
        </form>
        <div className="flex justify-between mt-6"></div>
      </div>
    </div>
  );
}