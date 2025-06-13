'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const [startDate, endDate] = dateRange;
    // Send form data to backend here
    alert(
      'User created:\n' +
        JSON.stringify(
          {
            ...form,
            startDate: startDate?.toLocaleDateString(),
            endDate: endDate?.toLocaleDateString(),
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[#FAF9F6]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-6 py-8">
        <h1 className="text-2xl font-bold text-[#4A2C2A] mb-6 text-center">
          Create User
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="font-semibold">
            Name
            <input
              className="block w-full mt-1 p-2 rounded border"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label className="font-semibold">
            Phone
            <input
              className="block w-full mt-1 p-2 rounded border"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>
          <label className="font-semibold">
            Location (City)
            <input
              className="block w-full mt-1 p-2 rounded border"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </label>
          <label className="font-semibold">
            Subscription
            <select
              className="block w-full mt-1 p-2 rounded border"
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
          <label className="font-semibold">
            Start & End Date
            <Calendar
              selectRange
              value={dateRange}
              onChange={setDateRange}
            />
            <div className="mt-2 text-sm text-gray-700">
              {dateRange[0] && dateRange[1]
                ? `Selected: ${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                : 'Select a start and end date'}
            </div>
          </label>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-[#43a1ff] text-white font-semibold rounded-xl shadow hover:bg-[#2563eb] transition"
          >
            Create
          </button>
        </form>
        <div className="flex justify-between mt-6">
         
        </div>
      </div>
    </div>
  );
}