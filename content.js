// Codex Reset Watch — 内容类落地页脚本
(function () {
  // 主题切换
  const savedTheme = localStorage.getItem("reset-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("reset-theme", next);
    });
  }
})();
