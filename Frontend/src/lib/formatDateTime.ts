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
