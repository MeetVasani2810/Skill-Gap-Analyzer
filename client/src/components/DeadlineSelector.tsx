import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, X } from "lucide-react";
import { setDeadline, getDeadline, deleteDeadline } from "@/lib/api";

interface DeadlineSelectorProps {
    roadmapId: string;
    onDeadlineChange?: (daysRemaining: number | null) => void;
}

export function DeadlineSelector({ roadmapId, onDeadlineChange }: DeadlineSelectorProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial deadline
    useEffect(() => {
        if (!roadmapId) return;

        const loadDeadline = async () => {
            setLoading(true);
            try {
                const data = await getDeadline(roadmapId);
                if (data && data.deadline) {
                    const date = new Date(data.deadline);
                    setSelectedDate(date);
                    setDaysRemaining(data.days_remaining);
                    if (onDeadlineChange) onDeadlineChange(data.days_remaining);
                }
            } catch (err) {
                // Ignore 404, it just means no deadline set
                console.log("No deadline found or error fetching", err);
            } finally {
                setLoading(false);
            }
        };

        loadDeadline();
    }, [roadmapId, onDeadlineChange]);

    const handleDateChange = async (date: Date | null) => {
        if (!date) return;

        setLoading(true);
        setError(null);

        try {
            // Format to YYYY-MM-DD (local time)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const result = await setDeadline(roadmapId, dateStr);

            setSelectedDate(date);
            setDaysRemaining(result.days_remaining);
            if (onDeadlineChange) onDeadlineChange(result.days_remaining);
        } catch (err) {
            console.error("Failed to set deadline:", err);
            setError("Failed to save deadline. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        setLoading(true);
        try {
            await deleteDeadline(roadmapId);
            setSelectedDate(null);
            setDaysRemaining(null);
            if (onDeadlineChange) onDeadlineChange(null);
        } catch (err) {
            console.error("Failed to clear deadline:", err);
            setError("Failed to remove deadline");
        } finally {
            setLoading(false);
        }
    };

    // Calculate minimum date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
        <div className="p-4 rounded-xl bg-card border border-border shadow-soft mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Set Roadmap Goal</h4>
                        <p className="text-xs text-muted-foreground">Select a target completion date</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            minDate={tomorrow}
                            placeholderText="Select deadline"
                            className="w-full sm:w-40 px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            dateFormat="MMMM d, yyyy"
                            disabled={loading}
                        />
                    </div>

                    {selectedDate && (
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            title="Clear deadline"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
            )}

            {daysRemaining !== null && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span>
                        <span className="font-semibold text-foreground">{daysRemaining} days</span> remaining
                    </span>
                    {daysRemaining < 30 && (
                        <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full">
                            Closing in!
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
