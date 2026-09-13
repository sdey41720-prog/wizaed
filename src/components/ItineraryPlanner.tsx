import React, { useState } from 'react';
import { 
  CalendarDays, 
  Users, 
  Plus, 
  DollarSign, 
  Compass, 
  ThumbsUp, 
  Share2, 
  Copy, 
  Sparkles,
  MapPin,
  Clock,
  Trash2,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Itinerary, ItineraryItem, Collaborator, Destination } from '../types';
import { playUiClick, playFlyTransitionSound } from '../utils/audio';

interface ItineraryPlannerProps {
  itineraries: Itinerary[];
  activeItinerary: Itinerary;
  setActiveItinerary: (it: Itinerary) => void;
  onUpdateItinerary: (updated: Itinerary) => void;
  onFlyToDestination: (destName: string) => void;
  destinations: Destination[];
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  itineraries,
  activeItinerary,
  setActiveItinerary,
  onUpdateItinerary,
  onFlyToDestination,
}) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New activity form state
  const [actTitle, setActTitle] = useState('');
  const [actLocation, setActLocation] = useState('');
  const [actCategory, setActCategory] = useState<ItineraryItem['category']>('Sightseeing');
  const [actTime, setActTime] = useState('10:00 AM');
  const [actCost, setActCost] = useState(25);
  const [actNotes, setActNotes] = useState('');

  // Day filter
  const dayItems = activeItinerary.items.filter(item => item.dayIndex === selectedDay);

  // Total cost calculation
  const totalCalculatedCost = activeItinerary.items.reduce((sum, item) => sum + item.costUsd, 0);
  const perPersonCost = Math.round(totalCalculatedCost / (activeItinerary.collaborators.length || 1));

  // Vote on activity
  const handleVote = (itemId: string) => {
    const currentUserId = 'user-1'; // alex
    const updatedItems = activeItinerary.items.map(item => {
      if (item.id === itemId) {
        const hasVoted = item.votedBy.includes(currentUserId);
        const newVotedBy = hasVoted
          ? item.votedBy.filter(id => id !== currentUserId)
          : [...item.votedBy, currentUserId];
        return {
          ...item,
          votedBy: newVotedBy,
          votes: newVotedBy.length,
        };
      }
      return item;
    });

    onUpdateItinerary({
      ...activeItinerary,
      items: updatedItems,
    });
    playUiClick();
  };

  // Toggle item completed
  const handleToggleComplete = (itemId: string) => {
    const updatedItems = activeItinerary.items.map(item => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    onUpdateItinerary({
      ...activeItinerary,
      items: updatedItems,
    });
    playUiClick();
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    const updatedItems = activeItinerary.items.filter(item => item.id !== itemId);
    onUpdateItinerary({
      ...activeItinerary,
      items: updatedItems,
    });
    playUiClick();
  };

  // Submit new activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) return;

    const newItem: ItineraryItem = {
      id: `act-${Date.now()}`,
      dayIndex: selectedDay,
      timeSlot: actTime,
      title: actTitle,
      location: actLocation || activeItinerary.destinationName,
      category: actCategory,
      costUsd: Number(actCost) || 0,
      assignedTo: 'user-1',
      votes: 1,
      votedBy: ['user-1'],
      notes: actNotes,
      completed: false,
    };

    onUpdateItinerary({
      ...activeItinerary,
      items: [...activeItinerary.items, newItem],
    });

    setIsAddActivityOpen(false);
    setActTitle('');
    setActLocation('');
    setActNotes('');
    playUiClick();
  };

  const handleCopyInviteLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
    } catch {}
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  // Trigger 3D Fly-Through
  const handleFlyThrough = () => {
    playFlyTransitionSound();
    onFlyToDestination(activeItinerary.destinationName);
    try {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div id="itinerary-planner-container" className="fixed inset-0 top-18 sm:top-20 z-20 p-3 sm:p-6 overflow-y-auto pointer-events-none flex justify-center">
      <div 
        id="itinerary-main-card"
        className="w-full max-w-5xl bg-slate-950/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl pointer-events-auto text-white flex flex-col gap-6"
      >
        {/* Top Header: Title, Itinerary Switcher, Live Collaborators */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <CalendarDays className="w-4 h-4" />
              <span>COLLABORATIVE TRAVEL ITINERARY • {activeItinerary.dateRange}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{activeItinerary.title}</span>
              <button
                onClick={handleFlyThrough}
                className="text-xs px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition active:scale-95"
                title="Fly through trip locations on 3D globe"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Fly 3D Tour</span>
              </button>
            </h1>
          </div>

          {/* Collaborator Presence Bar & Invite Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              {activeItinerary.collaborators.map((c: Collaborator) => (
                <div
                  key={c.id}
                  className="relative group cursor-pointer"
                  title={`${c.name} (${c.status}) - ${c.currentAction || ''}`}
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      c.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 px-2 py-1 bg-slate-900 text-[10px] text-white rounded-md whitespace-nowrap shadow-xl border border-slate-700">
                    <div className="font-bold">{c.name}</div>
                    <div className="text-slate-400">{c.currentAction}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              id="invite-collaborator-btn"
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 text-xs font-semibold border border-sky-500/30 transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>
          </div>
        </div>

        {/* Budget Split Calculator Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">TOTAL ESTIMATED BUDGET</div>
              <div className="text-base font-bold text-white">${totalCalculatedCost} USD</div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">EQUAL SPLIT ({activeItinerary.collaborators.length} FRIENDS)</div>
              <div className="text-base font-bold text-sky-400">${perPersonCost} USD / person</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
            <div>
              <div className="text-[10px] text-slate-400">TOTAL ACTIVITIES</div>
              <div className="text-base font-bold text-white">{activeItinerary.items.length} items planned</div>
            </div>
            <button
              onClick={() => onFlyToDestination(activeItinerary.destinationName)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Center on Map</span>
            </button>
          </div>
        </div>

        {/* Days Timeline Navigation Strip */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {Array.from({ length: activeItinerary.totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const countForDay = activeItinerary.items.filter(it => it.dayIndex === dayNum).length;
              return (
                <button
                  key={dayNum}
                  onClick={() => { setSelectedDay(dayNum); playUiClick(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                    selectedDay === dayNum
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Day {dayNum}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedDay === dayNum ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {countForDay}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            id="add-activity-trigger-btn"
            onClick={() => { setIsAddActivityOpen(true); playUiClick(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-sky-500/20 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Activity</span>
          </button>
        </div>

        {/* Day Activities List */}
        <div className="space-y-3 min-h-60">
          {dayItems.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-sm text-slate-300">No activities planned for Day {selectedDay} yet.</p>
              <p className="text-xs text-slate-500 mt-1">Tap &quot;Add Activity&quot; or explore destinations to add spots with friends!</p>
            </div>
          ) : (
            dayItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  item.completed 
                    ? 'bg-slate-900/30 border-slate-800/50 opacity-60' 
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox */}
                  <input
                    type="checkbox"
                    checked={!!item.completed}
                    onChange={() => handleToggleComplete(item.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-sky-500 bg-slate-800 focus:ring-0 cursor-pointer"
                  />

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                        {item.timeSlot}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                      {item.costUsd > 0 && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          ${item.costUsd} USD
                        </span>
                      )}
                    </div>
                    <h2 className={`font-bold text-sm ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{item.location}</span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-slate-400 mt-1.5 italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                        💡 {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Collaborative Voting & Delete Controls */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => handleVote(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      item.votedBy.includes('user-1')
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Vote thumbs up with friends"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{item.votes}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Itinerary Switcher Strip */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Switch Itineraries:</span>
          <div className="flex gap-2">
            {itineraries.map(it => (
              <button
                key={it.id}
                onClick={() => { setActiveItinerary(it); playUiClick(); }}
                className={`px-3 py-1 rounded-xl font-medium transition ${
                  activeItinerary.id === it.id
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {it.destinationName}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Add Activity Modal */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-sky-500/40 p-6 shadow-2xl text-white">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>Add Activity for Day {selectedDay}</span>
            </h2>

            <form onSubmit={handleAddActivity} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shibuya Sky Sunset Observation"
                  value={actTitle}
                  onChange={e => setActTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 02:00 PM"
                    value={actTime}
                    onChange={e => setActTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Category</label>
                  <select
                    value={actCategory}
                    onChange={e => setActCategory(e.target.value as ItineraryItem['category'])}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food">Food & Dining</option>
                    <option value="Culture">Culture</option>
                    <option value="Activity">Activity</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Location / Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Shibuya Scramble"
                    value={actLocation}
                    onChange={e => setActLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Cost ($ USD)</label>
                  <input
                    type="number"
                    value={actCost}
                    onChange={e => setActCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Collaborative Notes & Tips</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Book online ticket at least 3 days ahead"
                  value={actNotes}
                  onChange={e => setActNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 transition shadow-lg shadow-sky-500/25"
                >
                  Save to Day {selectedDay}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Friends Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-sky-500/40 p-6 shadow-2xl text-white">
            <h2 className="text-base font-bold mb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-sky-400" />
              <span>Invite Friends to Collaborate</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Friends can add stops, vote on activities, and split costs in real-time.
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 mb-4">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/trip?join=${activeItinerary.id}`}
                className="bg-transparent text-xs text-slate-300 outline-none w-full"
              />
              <button
                onClick={handleCopyInviteLink}
                className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Currently Planning Together</span>
              {activeItinerary.collaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Can Edit</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsInviteOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
