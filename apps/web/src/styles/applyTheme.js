export function applySavedTheme() {
  const theme = localStorage.getItem("erp_theme") || "light";

  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}
