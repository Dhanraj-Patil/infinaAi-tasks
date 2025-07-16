import { useState, useEffect, useCallback, useRef } from 'react';

const POLL_INTERVAL = 30000; // 30 seconds

export default function useGoogleCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isFetchingRef = useRef(false);
    const [updateTime, setUpdateTime] = useState(null);

    const fetchEvents = useCallback(async (updateTime) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const params = updateTime != null
                ? { calendarId: 'primary', 
                    updateMin: updateTime,
                    singleEvents: true,
                    orderBy: 'updated',
                    timeMin: new Date().toISOString(),
                    showDeleted: true
                 }
                : {
                    calendarId: 'primary',
                    maxResults: 250,
                    orderBy: 'startTime',
                    timeMin: new Date().toISOString(),
                    singleEvents: true,
                    showDeleted: true
                };

            const response = await window.gapi.client.calendar.events.list(params);

            // Process events
            const newEvents = response.result.items;
            setEvents(prev => {
                if (updateTime == null) return newEvents.filter(e => e.status !== 'cancelled');

                // Merge changes using a Map to prevent duplicates
                const eventMap = new Map(prev.map(e => [e.id, e]));
                newEvents.forEach(event => {
                    if (event.status === 'deleted' || event.status === 'cancelled') {
                        eventMap.delete(event.id);
                    } else {
                        eventMap.set(event.id, event);
                    }
                });

                const sortedEvents = Array.from(eventMap.values()).sort((a, b) => {
                    const startA = a.start.dateTime || a.start.date;
                    const startB = b.start.dateTime || b.start.date;
                    return new Date(startA) - new Date(startB);
                });
                return Array.from(sortedEvents.values());
            });

            setUpdateTime(new Date().toISOString())
        } catch (err) {
            setError(err.result?.error?.message || 'Error fetching events');
            console.error('Calendar API error:', err);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    // Smart polling
    useEffect(() => {
        let pollTimer;

        const poll = () => {
            if (!isFetchingRef.current) {
                fetchEvents(updateTime);
            }
        };

        pollTimer = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(pollTimer);
    }, [fetchEvents, updateTime]);

    const createEvent = useCallback(async (eventData) => {
        try {
            console.log(eventData)
            const data = {
                summary: eventData.title,
                start: {
                    dateTime: eventData.start,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    dateTime: eventData.end,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                description: eventData.description
            }
            const response = await window.gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: data
            });

            // Trigger immediate sync
            fetchEvents(updateTime);
            return response.result;
        } catch (err) {
            setError('Failed to create event');
            console.error('Event creation error:', err);
            throw err;
        }
    }, [fetchEvents, updateTime]);

    const deleteEvent = useCallback(async (eventId) => {
        try {
            await window.gapi.client.calendar.events.delete({
                calendarId: 'primary',
                eventId
            });

            setEvents(prev => {
                const eventMap = new Map(prev.map(e => [e.id, e]));
                eventMap.delete(eventMap)
                return Array.from(eventMap.values)
            })

            // Trigger immediate sync
            fetchEvents(updateTime);
        } catch (err) {
            setError('Failed to delete event');
            console.error('Event deletion error:', err);
            throw err;
        }
    }, [fetchEvents, updateTime]);

    return {
        events,
        loading,
        error,
        fetchEvents,
        createEvent,
        deleteEvent
    };
}