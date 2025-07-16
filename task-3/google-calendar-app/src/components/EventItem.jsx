import React from "react";
import { format } from "date-fns";

const EventItem = ({ event, onDelete, isPending }) => {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;

  return (
    <li className={`${isPending ? "opacity-50" : ""}`}>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-blue-600 truncate">
            {event.summary}
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <button
              onClick={() => onDelete(event.id)}
              disabled={isPending}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <div className="mr-6 flex items-center text-sm text-gray-500">
              <svg
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {format(new Date(start), "MMM d, yyyy h:mm a")}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <svg
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {format(new Date(end), "h:mm a")}
            </div>
          </div>
        </div>
        {event.description && (
          <div className="mt-2 text-sm text-gray-700 line-clamp-2">
            {event.description}
          </div>
        )}
        {event.status === "pending" && (
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Saving...
          </div>
        )}
      </div>
    </li>
  );
};

export default EventItem;
