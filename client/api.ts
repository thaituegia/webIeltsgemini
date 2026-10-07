export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  if (!response.ok) {
    let message = `Yêu cầu chưa thành công (${response.status}). Vui lòng thử lại.`;
    try {
      const data: unknown = await response.json();
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
      )
        message = data.error;
      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      )
        message = data.message;
    } catch {
      /* Keep a useful message when the service returns no JSON. */
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Có lỗi xảy ra. Vui lòng thử lại.";
}

export function formatDate(
  date: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok",
    ...options,
  }).format(new Date(date));
}
