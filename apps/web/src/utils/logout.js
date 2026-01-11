export function logoutERP() {
  localStorage.removeItem("erp_token");
  localStorage.removeItem("erp_user");
  window.location.href = "/login";
}
