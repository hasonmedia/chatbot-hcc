function normalizeCustomer(raw) {
  if (!raw) return null;

  // Nếu raw là string -> parse JSON
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch (e) {
      console.warn("Invalid JSON in customer_data:", raw);
      return null;
    }
  }

  // chuẩn hoá key: bỏ dấu tiếng Việt, lowercase
  const normalizeKey = (key) =>
    key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  let phone = "";
  let name = "";

  for (const [key, value] of Object.entries(raw)) {
    const k = normalizeKey(key);

    // tìm phone
    if (!phone && (k.includes("sodienthoai") || k.includes("phone"))) {
      phone = value;
    }

    // tìm tên
    if (!name && k.includes("ten")) {
      name = value;
    }
  }

  return { phone, name };
}
export default normalizeCustomer;