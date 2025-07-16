import React, { useState } from "react";

const formatDateTime = (date) => {
  return new Date(date - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const CreateEventForm = ({ onCreate }) => {
  const [formData, setFormData] = useState({
    title: "",
    start: formatDateTime(new Date()),
    end: formatDateTime(new Date(Date.now() + 3600000)),
    description: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field changes
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.start) newErrors.start = "Start time is required";
    if (!formData.end) newErrors.end = "End time is required";

    if (formData.start && formData.end) {
      const startTime = new Date(formData.start).getTime();
      const endTime = new Date(formData.end).getTime();

      if (endTime <= startTime) {
        newErrors.end = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add this function at the top of the file
  const toRFC3339 = (datetimeString) => {
    const date = new Date(datetimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Update the handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onCreate({
        title: formData.title,
        start: toRFC3339(formData.start),
        end: toRFC3339(formData.end),
        description: formData.description,
      });
      // Reset form after submission
      setFormData({
        title: "",
        start: formatDateTime(new Date()),
        end: formatDateTime(new Date(Date.now() + 3600000)),
        description: "",
      });
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Create New Event
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Events will sync across all your devices
        </p>
      </div>
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Event Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                errors.title ? "border-red-300" : "border-gray-300"
              } focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="start"
                className="block text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <input
                type="datetime-local"
                name="start"
                id="start"
                value={formData.start}
                onChange={handleChange}
                className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                  errors.start ? "border-red-300" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.start && (
                <p className="mt-1 text-sm text-red-600">{errors.start}</p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="end"
                className="block text-sm font-medium text-gray-700"
              >
                End Time
              </label>
              <input
                type="datetime-local"
                name="end"
                id="end"
                value={formData.end}
                onChange={handleChange}
                className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                  errors.end ? "border-red-300" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.end && (
                <p className="mt-1 text-sm text-red-600">{errors.end}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full shadow-sm sm:text-sm rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
