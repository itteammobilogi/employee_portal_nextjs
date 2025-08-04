import Cookies from "js-cookie";

export const setAuthSession = (token, role_id) => {
  Cookies.set("token", token, { expires: 7 });
  Cookies.set("role_id", role_id);
};

export const clearAuthSession = () => {
  Cookies.remove("token");
  Cookies.remove("role_id");
};

export const getToken = () => Cookies.get("token");
export const getRoleId = () => Cookies.get("role_id");
