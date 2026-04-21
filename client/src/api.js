/**
 * Ensure that FormData is correctly packaged.
 * 
 * If a value is undefined or null, it is omitted.
 * If a value is an array, it is converted to a JSON string.
 * 
 * @param {*} payload The object to convert to FormData
 * @returns A valid FormData object
 */
function toFormData(payload) {
	const formData = new FormData();

	Object.entries(payload).forEach(([k, v]) => {
		if (v === undefined || v === null) {
			return;
		}

		if (Array.isArray(v)) {
			formData.append(k, JSON.stringify(v));
			return;
		}

		formData.append(k, v);
	});

	return formData;
}

/**
 * Safely reads and parses JSON from a Response object.
 * 
 * @param {Response} res - The Response object to read from
 * @returns A parsed JSON object, or an empty object if the response is empty or invalid JSON
 */
async function safeReadJson(res) {
	const text = await res.text();

	if (!text) {
		return {};
	}

	try {
		return JSON.parse(text);
	} catch {
		return {};
	}
}

/**
 * Handles all API requests and returns a consistent error object on failure.
 * 
 * @param {*} path The API endpoint to call
 * @param {*} options Fetch options (method, headers, body, credentials, etc.)
 * @param {*} fallbackMessage The message to return in case of a network error
 * @returns The response data on success, or an error object on failure.
 */
async function request(path, options = {}, fallbackMessage = "An error occurred") {
	try {
		const res = await fetch(path, options);
		const data = await safeReadJson(res);

		if (!res.ok) {
			return { error: data.message || fallbackMessage };
		}

		return data;
	} catch {
		return { error: fallbackMessage };
	}
}

/**
 * Helper function for making JSON API requests.
 * Automatically converts the body to JSON.
 * 
 * @param {*} path The API endpoint to call
 * @param {*} options Fetch options (method, headers, body, credentials, etc.)
 * @param {*} fallbackMessage The message to return in case of a network error
 * @returns The response data on success, or an error object on failure.
 */
async function requestJson(path, { method = "GET", body, credentials } = {}, fallbackMessage) {
	return request(
		path,
		{
			method,
			headers: { "Content-Type": "application/json"},
			body: body ? JSON.stringify(body) : undefined,
			credentials
		},
		fallbackMessage
	)
}

/**
 * Helper function for making FormData API requests.
 * Automatically converts the body to a FormData object.
 * 
 * @param {*} path The API endpoint to call
 * @param {*} options Fetch options (method, headers, body, credentials, etc.)
 * @param {*} fallbackMessage The message to return in case of a network error
 * @returns The response data on success, or an error object on failure.
 */
async function requestForm(path, { method = "POST", body, credentials } = {}, fallbackMessage) {
	return request(
		path,
		{
			method,
			body: toFormData(body),
			credentials
		},
		fallbackMessage
	)
}

export async function healthCheck() {
	return requestJson("/api/health", {}, "Network error: Failed to reach server");
}


// ========================================
// ========== Authentication API ==========
// ========================================

export async function login(credentials) {
	return requestJson(
		"/api/auth/login",
		{
			method: "POST",
			body: credentials,
			credentials: "include"
		},
		"Network error: Failed to login"
	);
}

export async function register(credentials) {
	return requestJson(
		"/api/auth/register",
		{
			method: "POST",
			body: credentials,
			credentials: "include"
		},
		"Network error: Failed to register"
	);
}

export async function verify(token) {
	return requestJson(
		"/api/auth/verify?token=" + encodeURIComponent(token),
		{},
		"Network error: Failed to verify user"
	);
}

export async function logout() {
	return requestJson(
		"/api/auth/logout",
		{
			method: "POST",
			credentials: "include"
		},
		"Network error: Failed to logout user"
	);
}

export async function getMe() {
	return requestJson(
		"/api/auth/me",
		{
			credentials: "include"
		},
		"Network error: Failed to grab user authentication"
	);
}


// ================================
// ========== Events API ==========
// ================================

export async function createEvent(data) {
	return requestForm(
		"/api/events/create-event",
		{
			method: "POST",
			body: data,
			credentials: "include"
		},
		"Network error: Failed to create event"
	);
}

export async function updateEvent(eventId, data) {
	return requestForm(
		"/api/events/update-event?eventId=" + encodeURIComponent(eventId),
		{
			method: "PUT",
			body: data,
			credentials: "include"
		},
		"Network error: Failed to update event"
	)
}

export async function deleteEvent(eventId) {
	return requestJson(
		"/api/events/delete-event?eventId=" + encodeURIComponent(eventId),
		{
			method: "DELETE",
			credentials: "include"
		},
		"Network error: Failed to delete event"
	);
}

export async function getEvent(eventId) {
	return requestJson(
		"/api/events/get-event?eventId=" + encodeURIComponent(eventId),
		{},
		"Network error: Failed to grab event"
	);
}

export async function getUserMadeEvents() {
	return requestJson(
		"/api/events/get-user-made-events",
		{
			credentials: "include"
		},
		"Network error: Failed to grab user's events"
	);
}

export async function getAllEvents(limit, offset, sourceFilter, dateFilter) {
	const params = new URLSearchParams();
	
	params.append("limit", String(limit));
	params.append("offset", String(offset));

	if (sourceFilter) {
		params.append("sourceFilter", sourceFilter);
	}

	if (dateFilter) {
		params.append("dateFilter", dateFilter.toLocaleDateString("en-CA"));
	}

	return requestJson(
		`/api/events/get-all-events?${params.toString()}`,
		{},
		"Network error: Failed to get all events"
	);
}

export function getEventImageUrl(imagePath) {
	return "/api/events/" + imagePath;
}