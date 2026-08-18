import * as React from "react";
import {
  Settings,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getDate,
  getDaysInMonth,
  startOfMonth,
  getDay,
  startOfWeek,
  addDays,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: "note" | "event";
}

interface GlassCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onAddEvent?: (event: CalendarEvent) => void;
  events?: CalendarEvent[];
  className?: string;
}

export const GlassCalendar = React.forwardRef<HTMLDivElement, GlassCalendarProps>(
  (
    {
      className,
      selectedDate: propSelectedDate,
      onDateSelect,
      onAddEvent,
      events = [],
      ...props
    },
    ref
  ) => {
    const [currentMonth, setCurrentMonth] = React.useState(propSelectedDate || new Date());
    const [selectedDate, setSelectedDate] = React.useState(propSelectedDate || new Date());
    const [viewMode, setViewMode] = React.useState<"weekly" | "monthly">("monthly");

    // Modal states
    const [showModal, setShowModal] = React.useState(false);
    const [modalType, setModalType] = React.useState<"note" | "event">("event");
    const [inputTitle, setInputTitle] = React.useState("");

    // Local events state (synced with props)
    const [localEvents, setLocalEvents] = React.useState<CalendarEvent[]>(events);

    React.useEffect(() => {
      if (events && events.length > 0) {
        setLocalEvents(events);
      }
    }, [events]);

    // Compute monthly grid (padding days + month days)
    const monthGrid = React.useMemo(() => {
      const start = startOfMonth(currentMonth);
      const firstDayIndex = getDay(start); // 0 = Sun, 1 = Mon ...
      const totalDays = getDaysInMonth(currentMonth);

      const daysArray: Array<{ date: Date | null; isCurrentMonth: boolean }> = [];

      // Padding for days before month start
      for (let i = 0; i < firstDayIndex; i++) {
        daysArray.push({ date: null, isCurrentMonth: false });
      }

      // Actual month days
      for (let i = 1; i <= totalDays; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), i);
        daysArray.push({ date: d, isCurrentMonth: true });
      }

      return daysArray;
    }, [currentMonth]);

    // Compute weekly days for current selected week
    const weekDays = React.useMemo(() => {
      const start = startOfWeek(selectedDate);
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
      }
      return days;
    }, [selectedDate]);

    const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      onDateSelect?.(date);
    };

    const handlePrevMonth = () => {
      setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
      setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleSaveEntry = () => {
      if (!inputTitle.trim()) return;
      const newEntry: CalendarEvent = {
        id: String(Date.now()),
        date: format(selectedDate, "yyyy-MM-dd"),
        title: inputTitle.trim(),
        type: modalType,
      };

      setLocalEvents((prev) => [...prev, newEntry]);
      onAddEvent?.(newEntry);

      setInputTitle("");
      setShowModal(false);
    };

    const weekHeader = ["S", "M", "T", "W", "T", "F", "S"];

    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden",
          "bg-gradient-to-br from-neutral-900/90 via-black/95 to-neutral-950/90",
          "backdrop-blur-xl border border-white/10 text-white font-sans box-sizing-border",
          className
        )}
        {...props}
      >
        {/* Top Bar: Weekly/Monthly Toggle & Header */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center space-x-1 rounded-lg bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setViewMode("weekly")}
              className={cn(
                "rounded-md px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                viewMode === "weekly"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={cn(
                "rounded-md px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                viewMode === "monthly"
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/90">
              {format(currentMonth, "MMM yyyy")}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Selected Date Header */}
        <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {format(selectedDate, "EEEE")}
            </div>
            <div className="text-[11px] sm:text-xs text-white/50">
              {format(selectedDate, "MMMM d, yyyy")}
            </div>
          </div>
          <div className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {localEvents.filter((e) => e.date === format(selectedDate, "yyyy-MM-dd")).length}{" "}
            Events
          </div>
        </div>

        {/* Calendar 7-Column Day Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekHeader.map((h, i) => (
            <span key={i} className="text-[11px] sm:text-xs font-bold text-white/40">
              {h}
            </span>
          ))}
        </div>

        {/* Calendar Grid View */}
        {viewMode === "monthly" ? (
          <div className="grid grid-cols-7 gap-1 text-center">
            {monthGrid.map((item, idx) => {
              if (!item.date) {
                return <div key={`empty-${idx}`} className="h-7 w-7 sm:h-9 sm:w-9" />;
              }

              const isSel = isSameDay(item.date, selectedDate);
              const isTod = isToday(item.date);
              const dateStr = format(item.date, "yyyy-MM-dd");
              const hasEvent = localEvents.some((e) => e.date === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(item.date!)}
                  className={cn(
                    "h-7 w-7 sm:h-9 sm:w-9 mx-auto flex items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all relative cursor-pointer",
                    isSel
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-black font-bold shadow-lg scale-105"
                      : isTod
                      ? "bg-white/20 text-white font-bold border border-white/30"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  {getDate(item.date)}
                  {hasEvent && !isSel && (
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-amber-400"></span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Weekly View (7 Days) */
          <div className="grid grid-cols-7 gap-1 text-center py-2">
            {weekDays.map((d) => {
              const isSel = isSameDay(d, selectedDate);
              const isTod = isToday(d);
              const dateStr = format(d, "yyyy-MM-dd");
              const hasEvent = localEvents.some((e) => e.date === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(d)}
                  className={cn(
                    "h-8 w-7 sm:h-10 sm:w-9 mx-auto flex flex-col items-center justify-center rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all relative cursor-pointer",
                    isSel
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-black font-bold shadow-lg scale-105"
                      : isTod
                      ? "bg-white/20 text-white font-bold border border-white/30"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  <span>{getDate(d)}</span>
                  {hasEvent && !isSel && (
                    <span className="h-1 w-1 rounded-full bg-amber-400 mt-0.5"></span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Date Event List */}
        <div className="mt-3 pt-3 border-t border-white/10 max-h-[100px] overflow-y-auto space-y-1.5 no-scrollbar">
          {localEvents
            .filter((e) => e.date === format(selectedDate, "yyyy-MM-dd"))
            .map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs"
              >
                <span className="text-white/90 truncate max-w-[200px]">{ev.title}</span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0",
                    ev.type === "event"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  )}
                >
                  {ev.type}
                </span>
              </div>
            ))}
          {localEvents.filter((e) => e.date === format(selectedDate, "yyyy-MM-dd")).length ===
            0 && (
            <div className="text-center py-2 text-[11px] sm:text-xs text-white/40 italic">
              No notes or events scheduled for this day
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setModalType("note");
              setShowModal(true);
            }}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 sm:px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>Add Note</span>
          </button>
          <button
            onClick={() => {
              setModalType("event");
              setShowModal(true);
            }}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 sm:px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-[11px] sm:text-xs font-semibold text-amber-300 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>New Event</span>
          </button>
        </div>

        {/* Modal Popup */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[400] flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-neutral-900 border border-white/15 rounded-xl p-5 w-full max-w-sm shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-amber-400" />
                    <span>Add {modalType === "event" ? "Calendar Event" : "Note"}</span>
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-white/60 mb-3">
                  Scheduling for: <strong>{format(selectedDate, "MMMM d, yyyy")}</strong>
                </div>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEntry()}
                  placeholder={
                    modalType === "event"
                      ? "e.g. Astro 5.0 Release Build"
                      : "e.g. Verify GA4 live event parameters"
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400 mb-4"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400"
                  >
                    Save {modalType === "event" ? "Event" : "Note"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";
