import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Extract JWT from Clerk session.
 * @returns {Promise<{Authorization: string, "Content-Type": string} | null>} - Headers object with Bearer token, or null if not found
 */
export async function getBackendAuthHeaders() {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      console.warn("[backendAuth] No Clerk userId found (unauthenticated request)");
      return null;
    }

    const token = await getToken();
    if (!token) {
      console.warn("[backendAuth] Failed to retrieve JWT token from Clerk");
      return null;
    }

    console.log(`[backendAuth] Successfully retrieved Clerk token for user ${userId}`);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  } catch (err) {
    console.error("[backendAuth] Unexpected error retrieving Clerk token:", err.message);
    return null;
  }
}

/**
 * Forward any HTTP method (GET, POST, DELETE, PUT) to backend.
 * Auth headers are attached server-side from Clerk session.
 * Body is only forwarded for methods that can have a body.
 */
export async function forwardToBackend(request, backendUrl, options = {}) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    console.warn(
      "[forwardToBackend] No auth session found for:",
      request.method,
      backendUrl,
      "- sending unauthenticated request."
    );
  }

  const method = options.method || request.method;

  // Only read body for methods that support it
  const hasBody = ["POST", "PUT", "PATCH"].includes(method.toUpperCase());

  let body = undefined;
  if (hasBody) {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  // Merge headers: original request content-type + auth headers
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...options.headers,
  };

  try {
    const fetchOptions = {
      method,
      headers,
      ...(body !== undefined && { body }),
    };

    console.log(
      `[forwardToBackend] ${method} ${backendUrl} with Authorization: ${authHeaders?.Authorization ? "Bearer token present" : "MISSING"}`,
    );

    const response = await fetch(backendUrl, fetchOptions);
    console.log(`[forwardToBackend] Response: ${response.status}`);

    // Return response as-is (pass through status + body)
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[forwardToBackend] Fetch error:", err.message);
    return NextResponse.json(
      { error: "Backend unreachable", detail: err.message },
      { status: 502 },
    );
  }
}

