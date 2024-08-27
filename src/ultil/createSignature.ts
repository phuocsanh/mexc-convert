import CryptoJS from "crypto-js";

interface Param {
  key: string;
  value: string;
  disabled?: boolean;
}
export const createSignature = (
  parameters: Param[],
  apiSecret: string
): string => {
  const ts = Date.now();
  const paramsObject: { [key: string]: string } = {};

  // Xử lý tham số để loại bỏ `signature` và `timestamp`, đồng thời lọc các tham số bị tắt hoặc trống
  parameters.forEach((param) => {
    if (
      param.key !== "signature" &&
      param.key !== "timestamp" &&
      !isEmpty(param.value) &&
      !isDisabled(param.disabled)
    ) {
      paramsObject[param.key] = param.value;
    }
  });

  // Thêm timestamp vào tham số
  paramsObject["timestamp"] = ts.toString();

  // Tạo chuỗi truy vấn từ các tham số
  const queryString = Object.keys(paramsObject)
    .map((key) => `${key}=${paramsObject[key]}`)
    .join("&");

  // Tạo chữ ký HMAC SHA256
  const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();

  return signature;
};

// Hàm kiểm tra nếu tham số bị tắt
const isDisabled = (disabled?: boolean): boolean => {
  return disabled === true;
};

// Hàm kiểm tra nếu tham số trống
const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};
