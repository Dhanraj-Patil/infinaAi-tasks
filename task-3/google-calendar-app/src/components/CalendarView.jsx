import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useGoogleCalendar from "../hooks/useGoogleCalendar";
import EventItem from "./EventItem";
import CreateEventForm from "./CreateEventForm";

const CalendarView = () => {
  const { isSignedIn, userProfile, signOut, loading: authLoading } = useAuth();
  const { events, loading, error, fetchEvents, createEvent, deleteEvent } =
    useGoogleCalendar();

  useEffect(() => {
    if (isSignedIn) {
      fetchEvents();
    }
  }, [isSignedIn, fetchEvents]);

  if (!isSignedIn) return null;
  if (authLoading)
    return <div className="text-center py-8">Loading calendar...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          {userProfile?.imageUrl && (
            <img
              className="h-12 w-12 rounded-full mr-4"
              src={userProfile.imageUrl}
              alt={userProfile.name}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Calendar</h1>
            <p className="text-gray-600">{userProfile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upcoming Events
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {events.length
                  ? "Real-time updates enabled"
                  : "Loading events..."}
              </p>
            </div>

            {loading && !events.length ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 mx-auto border-b-2 border-blue-500"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No upcoming events. Create your first event!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {events.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    onDelete={deleteEvent}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <CreateEventForm onCreate={createEvent} />
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
