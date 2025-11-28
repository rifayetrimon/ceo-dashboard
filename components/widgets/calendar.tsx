"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    const getDaysInMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const days = Array.from(
        { length: getDaysInMonth(currentDate) },
        (_, i) => i + 1
    );
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevDays = Array.from({ length: firstDay }, (_, i) => null);
    const nextDays = Array.from(
        { length: 42 - days.length - firstDay },
        (_, i) => null
    );
    const allDays = [...prevDays, ...days, ...nextDays];

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    const handlePrevMonth = () => {
        const prevMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
        );
        setCurrentDate(prevMonth);
        setSelectedDay(1);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
        );
        setCurrentDate(nextMonth);
        setSelectedDay(1);
    };

    return (
        <div className="bg-card rounded-xl border border-border p-6 animate-in fade-in slide-in-from-top-2 duration-500 delay-250">
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">{monthName}</h3>
                    <div className="flex gap-1">
                        <button
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-muted rounded transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-muted rounded transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div
                            key={day}
                            className="text-xs font-medium text-muted-foreground py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {allDays.map((day, i) => {
                        // Highlight today
                        const isToday =
                            day === today.getDate() &&
                            currentDate.getMonth() === today.getMonth() &&
                            currentDate.getFullYear() === today.getFullYear();
                        return (
                            <button
                                key={i}
                                onClick={() => day && setSelectedDay(day)}
                                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200
                  ${!day ? "text-muted-foreground/50 cursor-default" : ""}
                  ${day === selectedDay
                                        ? "bg-primary text-white font-semibold shadow-lg scale-105"
                                        : "hover:bg-muted text-foreground hover:scale-105"
                                    }
                  ${day ? "hover:shadow-md active:scale-95 cursor-pointer" : ""}
                  ${isToday ? "ring-2 ring-primary/60 ring-offset-2" : ""}
                `}
                                aria-current={isToday ? "date" : undefined}
                                disabled={!day}
                            >
                                {day}
                                {isToday && day ? (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
