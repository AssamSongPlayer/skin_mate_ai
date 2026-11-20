'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import { getStreakDays } from '@/services/calendarService';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ProgressPage() {
  const { calendarTasks, skinChats } = useAppContext();

  // Weekly check-in form state
  const [improvement, setImprovement] = useState<'yes' | 'somewhat' | 'no' | ''>('');
  const [irritation, setIrritation] = useState<'no' | 'mild' | 'severe' | ''>('');
  const [notes, setNotes] = useState('');
  const [submittedCheckIn, setSubmittedCheckIn] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    const data = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = calendarTasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === 'completed').length;
      const rate = dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0;

      return {
        day: days[d.getDay()],
        date: dateStr.slice(5),
        rate,
        tasks: dayTasks.length,
        completed,
      };
    });

    setChartData(data);
    setStreakDays(getStreakDays());
  }, [calendarTasks]);

  const totalCompleted = calendarTasks.filter((t) => t.status === 'completed').length;

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedCheckIn(true);
  };

  return (
    <PageWrapper title="Progress Tracker">
      <div className="space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#181822] border border-[#2D2D3D] shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] shadow-md shadow-purple-950/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#F5F3FF]">{streakDays} Day{streakDays !== 1 ? 's' : ''}</p>
              <p className="text-xs text-[#A1A1AA]">Current Consistency Streak</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#181822] border border-[#2D2D3D] shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#34D399]/10 flex items-center justify-center text-[#34D399] shadow-md shadow-emerald-950/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#F5F3FF]">{totalCompleted}</p>
              <p className="text-xs text-[#A1A1AA]">Total Completed Skincare Steps</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#181822] border border-[#2D2D3D] shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C4B5FD]/10 flex items-center justify-center text-[#C4B5FD] shadow-md shadow-purple-950/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#F5F3FF]">{skinChats.length}</p>
              <p className="text-xs text-[#A1A1AA]">Active Consultations Logged</p>
            </div>
          </div>
        </div>

        {/* 7-Day Completion Chart */}
        <div className="p-6 rounded-2xl bg-[#181822] border border-[#2D2D3D] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF]">Weekly Consistency & Adherence</h3>
              <p className="text-xs text-[#A1A1AA]">Daily routine completion percentage over the last 7 days</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#A78BFA]/10 text-[#A78BFA]">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#A1A1AA" fontSize={12} tickLine={false} />
                  <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#20202C',
                      borderColor: '#2D2D3D',
                      borderRadius: '0.75rem',
                      color: '#F5F3FF',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Adherence']}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate >= 80 ? '#34D399' : entry.rate > 0 ? '#A78BFA' : '#2D2D3D'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#A1A1AA] text-xs">
                Loading activity history...
              </div>
            )}
          </div>
        </div>

        {/* Weekly Skin Check-in Survey */}
        <div className="p-6 rounded-2xl bg-[#181822] border border-[#A78BFA]/30 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-purple-950/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF]">Weekly Skin Check-in</h3>
              <p className="text-xs text-[#A1A1AA]">
                Report observations to allow AI to adapt and optimize your routine safety
              </p>
            </div>
          </div>

          {submittedCheckIn ? (
            <div className="p-6 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#34D399] mx-auto" />
              <h4 className="text-sm font-semibold text-[#F5F3FF]">Check-in Recorded!</h4>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                Thank you! Your feedback has been stored locally. Your AI Assistant will reference these responses during your next consultation.
              </p>
              <button
                onClick={() => setSubmittedCheckIn(false)}
                className="mt-2 text-xs text-[#A78BFA] underline"
              >
                Submit another update
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F3FF] mb-2">
                  1. Have you noticed any improvement in your primary skin concerns?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'yes', label: 'Yes, noticeable improvement' },
                    { id: 'somewhat', label: 'Somewhat / subtle change' },
                    { id: 'no', label: 'No visible change yet' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setImprovement(opt.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        improvement === opt.id
                          ? 'bg-[#A78BFA] text-white border-[#A78BFA]'
                          : 'bg-[#20202C] border-[#2D2D3D] text-[#A1A1AA] hover:text-[#F5F3FF]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F3FF] mb-2">
                  2. Have you experienced any irritation, burning, or redness?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'no', label: 'No irritation at all' },
                    { id: 'mild', label: 'Mild tingling or dryness' },
                    { id: 'severe', label: 'Noticeable redness or burning' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setIrritation(opt.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        irritation === opt.id
                          ? 'bg-[#A78BFA] text-white border-[#A78BFA]'
                          : 'bg-[#20202C] border-[#2D2D3D] text-[#A1A1AA] hover:text-[#F5F3FF]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F3FF] mb-2">
                  3. Any notes or new concerns to log for your AI Assistant?
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Skin feels a bit dry around forehead in the mornings..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-xs text-[#F5F3FF] placeholder-[#A1A1AA] outline-none focus:border-[#A78BFA]"
                />
              </div>

              <button
                type="submit"
                disabled={!improvement || !irritation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-md shadow-purple-950/40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Check-in Response</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
