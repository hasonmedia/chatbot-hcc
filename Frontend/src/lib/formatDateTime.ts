export const formatDateTime = (isoString: string | undefined) => {
  if (!isoString) return "Không có";
  try {
    return new Date(isoString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "Ngày không hợp lệ";
  }
};

export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTime = (isoString: string) => {
  try {
    if (!isoString) return "vừa xong";
    const date = new Date(isoString);
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return "vừa xong";
    }
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "vừa xong"; // Fallback
  }
};
