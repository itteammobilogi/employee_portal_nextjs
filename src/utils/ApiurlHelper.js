// src/utils/ApiurlHelper.js
const BASE_URL = "https://portalapi.mobilogi.com";

export async function postApi(endpoint, body) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

// export async function getApi(endpoint) {
//   const token = localStorage.getItem("token");

//   try {
//     const response = await fetch(`${BASE_URL}${endpoint}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: token ? `Bearer ${token}` : "",
//       },
//     });

//     if (response.ok) {
//       const data = await response.json();
//       return data;
//     } else {
//       const errorText = await response.text();
//       let errorMessage = `Error: ${response.status} - ${response.statusText}`;

//       if (response.status === 404) {
//         errorMessage = "Route not found (404)";
//       }

//       console.error("API call error:", errorMessage, errorText);
//       throw new Error(errorMessage);
//     }
//   } catch (error) {
//     console.error("API call error:", error.message);
//     throw error;
//   }
// }

// utils/ApiurlHelper.js

// ApiurlHelper.js
export const getAttendanceApi = async (
  endpoint,
  { timeoutMs = 20000 } = {}
) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Allow env override in dev: NEXT_PUBLIC_API_BASE="https://portalapi.mobilogi.com"
  const rawBase =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE) ||
    "https://portalapi.mobilogi.com";

  // Ensure base ends with ONE slash
  const BASE_URL = rawBase.replace(/\/+$/, "") + "/";

  // Ensure endpoint has NO leading slash
  const path = String(endpoint || "").replace(/^\/+/, "");

  const url = BASE_URL + path;

  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: ac.signal,
    });

    const contentType = response.headers.get("Content-Type") || "";
    const rawText = await response.text();

    if (!response.ok) {
      let message = `Error ${response.status}: ${response.statusText}`;
      if (response.status === 404) message = "Route not found (404)";
      console.error("[API]", message, { url, body: rawText });
      throw new Error(message);
    }

    if (contentType.includes("application/json")) {
      return rawText.trim() ? JSON.parse(rawText) : {};
    }
    throw new Error("Invalid JSON response received");
  } catch (err) {
    // Friendlier network errors
    const msg = String(err?.message || err);
    if (
      msg.includes("Failed to fetch") ||
      msg.includes("Name not resolved") ||
      msg.includes("ERR_NAME_NOT_RESOLVED")
    ) {
      console.error("[API] Network/DNS error for:", url);
      throw new Error(
        "Network error: unable to reach API (check domain/DNS, CORS, or connectivity)."
      );
    }
    if (msg.includes("aborted")) {
      console.error("[API] Request timed out:", url);
      throw new Error("Request timed out. Please try again.");
    }
    console.error("[API] getApi failed:", msg, { url });
    throw err;
  } finally {
    clearTimeout(t);
  }
};

export const getApi = async (endpoint) => {
  const token = localStorage.getItem("token");
  const BASE_URL = "https://portalapi.mobilogi.com";

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });

    const contentType = response.headers.get("Content-Type");
    const rawText = await response.text();

    if (!response.ok) {
      let message = `Error ${response.status}: ${response.statusText}`;
      if (response.status === 404) message = "Route not found (404)";
      console.error("API call error:", message, rawText);
      throw new Error(message);
    }

    if (contentType?.includes("application/json")) {
      return rawText.trim() ? JSON.parse(rawText) : {};
    } else {
      throw new Error("Invalid JSON response received");
    }
  } catch (error) {
    console.error("getApi failed:", error.message);
    throw error;
  }
};

export async function getRaw(endpoint) {
  const token = localStorage.getItem("token");

  return await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

export async function postRaw(endpoint, body = {}) {
  const token = localStorage.getItem("token");

  return await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body),
  });
}

export async function putApi(endpoint, body) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const leaveputApi = async (url, body) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export async function deleteApi(endpoint) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

// export async function deleteApi(endpoint) {
//   const token = localStorage.getItem("token");

//   const response = await fetch(`${BASE_URL}${endpoint}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: token ? `Bearer ${token}` : "",
//     },
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     console.error("Delete API Error:", data.message || response.statusText);
//     throw new Error(data.message || "Delete request failed");
//   }

//   return data;
// }
