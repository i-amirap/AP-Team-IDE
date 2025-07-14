window.onload = function () {
  const editor = ace.edit("editor", {
    mode: "ace/mode/html",
    theme: "ace/theme/monokai",
    fontSize: 16,
    showPrintMargin: false,
    wrap: true,
    useWorker: false,
    fontFamily: "Consolas",
  });

  const tabs = document.querySelectorAll("#tabs button");
  const projectSelect = document.getElementById("projectSelect");
  const themeToggle = document.getElementById("themeToggle");
  const editToggle = document.getElementById("editToggle");
  const fontSelect = document.getElementById("fontSelect");

  let currentMode = "html";
  let isDark = true;
  let isReadOnly = false;

  // محتواهای پروژه
  let contents = {
    html: "<!-- کد HTML شما -->",
    css: "/* CSS شما */",
    javascript: "// JavaScript شما",
  };

  // پروژه‌ها از لوکال‌استوریج
  let projects = JSON.parse(localStorage.getItem("projects") || "{}");

  // بارگذاری پروژه‌ها در select
  function loadProjects() {
    projectSelect.innerHTML = `<option value="new">پروژه جدید</option>`;
    for (const name in projects) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      projectSelect.appendChild(opt);
    }
  }
  loadProjects();

  // سوئیچ تب
  function switchTab(mode) {
    if (mode === currentMode) return;
    contents[currentMode] = editor.getValue();
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
    editor.session.setMode("ace/mode/" + mode);
    editor.setValue(contents[mode], -1);
    editor.setReadOnly(isReadOnly);
    currentMode = mode;
  }
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.mode));
  });

  // تغییر تم
  themeToggle.addEventListener("click", () => {
    if (isDark) {
      editor.setTheme("ace/theme/chrome");
      themeToggle.textContent = "تم تاریک";
      document.body.style.background = "#f5f5f5";
      document.body.style.color = "#222";
      document.querySelector("#developed-by").style.background = "black";
    } else {
      editor.setTheme("ace/theme/monokai");
      themeToggle.textContent = "تم روشن";
      document.body.style.background = "#1e1e1e";
      document.body.style.color = "#eee";
      document.querySelector("#developed-by").style.background = "transparent";
    }
    isDark = !isDark;
  });

  // حالت خواندنی
  editToggle.addEventListener("click", () => {
    isReadOnly = !isReadOnly;
    editor.setReadOnly(isReadOnly);
    editToggle.textContent = isReadOnly ? "حالت ویرایش" : "حالت خواندنی";
  });

  // تغییر فونت
  fontSelect.addEventListener("change", () => {
    editor.setOption("fontFamily", fontSelect.value);
  });

  // Undo و Redo
  document.getElementById("undoBtn").addEventListener("click", () => {
    editor.undo();
  });
  document.getElementById("redoBtn").addEventListener("click", () => {
    editor.redo();
  });

  // اجرا
  document.getElementById("runBtn").addEventListener("click", () => {
    contents[currentMode] = editor.getValue();
    const output = `
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head><style>${contents.css}</style></head>
        <body>${contents.html}<script>${contents.javascript}<\/script></body>
        </html>`;
    document.getElementById("preview").srcdoc = output;
  });

  document.addEventListener("keyup", () => {
    document.querySelector("#runBtn").click();
  });

  // دانلود
  document.getElementById("downloadBtn").addEventListener("click", () => {
    contents[currentMode] = editor.getValue();
    const content = `
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head><style>${contents.css}</style></head>
        <body>${contents.html}<script>${contents.javascript}<\/script></body>
        </html>`;
    const blob = new Blob([content], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "project.html";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ذخیره پروژه
  document.getElementById("saveBtn").addEventListener("click", () => {
    contents[currentMode] = editor.getValue();
    const name = prompt("نام پروژه را وارد کنید:");
    if (!name) return alert("نام پروژه وارد نشد!");
    projects[name] = { ...contents };
    localStorage.setItem("projects", JSON.stringify(projects));
    loadProjects();
    projectSelect.value = name;
    alert("پروژه ذخیره شد.");
  });

  // حذف پروژه فعلی
  document.getElementById("deleteBtn").addEventListener("click", () => {
    if (projectSelect.value === "new") {
      alert("هیچ پروژه فعالی برای حذف وجود ندارد.");
      return;
    }
    if (!confirm(`آیا از حذف پروژه "${projectSelect.value}" مطمئن هستید؟`))
      return;
    delete projects[projectSelect.value];
    localStorage.setItem("projects", JSON.stringify(projects));
    loadProjects();
    projectSelect.value = "new";
    Object.keys(contents).forEach((k) => (contents[k] = ""));
    editor.setValue("", -1);
    alert("پروژه حذف شد.");
  });

  // پاک کردن ادیتورها
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (confirm("آیا می‌خواهید تمام کدها پاک شوند؟")) {
      Object.keys(contents).forEach((k) => (contents[k] = ""));
      editor.setValue("", -1);
      document.querySelector("#runBtn").click();
    }
  });

  // اشتراک‌گذاری با پسورد و کپی خودکار لینک (کدگذاری Base64)
  document.getElementById("shareBtn").addEventListener("click", () => {
    contents[currentMode] = editor.getValue();
    const pwd = prompt("رمز عبور برای لینک اشتراک‌گذاری وارد کنید (اختیاری):");
    if (pwd === null) return;

    const data = {
      contents,
      pwd,
    };

    const jsonStr = JSON.stringify(data);
    const base64Data = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode("0x" + p1)
      )
    );

    const url = new URL(window.location.href);
    url.searchParams.set("data", base64Data);

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        alert("لینک اشتراک‌گذاری کپی شد");
      })
      .catch(() => {
        alert("لینک اشتراک‌گذاری:\n" + url.toString());
      });
  });

  // بارگذاری پروژه انتخاب شده یا لینک اشتراک‌گذاری
  function loadProject(name) {
    if (name === "new") {
      Object.keys(contents).forEach((k) => (contents[k] = ""));
      editor.setValue("", -1);
    } else if (projects[name]) {
      Object.assign(contents, projects[name]);
      editor.setValue(contents.html, -1);
    }
    editor.session.setMode("ace/mode/" + currentMode);
    editor.setReadOnly(isReadOnly);
  }

  projectSelect.addEventListener("change", () => {
    const val = projectSelect.value;
    contents[currentMode] = editor.getValue();
    if (val === "new") {
      Object.keys(contents).forEach((k) => (contents[k] = ""));
      editor.setValue("", -1);
    } else {
      loadProject(val);
    }
  });

  // بررسی وجود پارامتر اشتراک‌گذاری در آدرس و بارگذاری پروژه رمزدار
  function checkShareLink() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("data")) return false;

    try {
      const base64Data = params.get("data");
      const jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(
            atob(base64Data),
            (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      );
      const data = JSON.parse(jsonStr);

      if (data.pwd) {
        let tries = 3;
        while (tries > 0) {
          const pass = prompt("رمز عبور این پروژه را وارد کنید:");
          if (pass === null) return false;
          if (pass === data.pwd) break;
          alert("رمز اشتباه است. دوباره تلاش کنید.");
          tries--;
        }
        if (tries === 0) return false;
      }

      Object.assign(contents, data.contents);
      editor.setValue(contents.html, -1);
      editor.session.setMode("ace/mode/html");
      editor.setReadOnly(isReadOnly);
      alert("پروژه با موفقیت بارگذاری شد.");
      return true;
    } catch (e) {
      console.error("خطا در بارگذاری پروژه اشتراک‌گذاری شده:", e);
      return false;
    }
  }

  // مقداردهی اولیه
  if (!checkShareLink()) {
    loadProject("new");
    // اگر پروژه جدید است و کاربر چیزی نوشته، بازگردانی از sessionStorage
    if (projectSelect.value === "new") {
      const temp = sessionStorage.getItem("tempProject");
      if (temp) {
        Object.assign(contents, JSON.parse(temp));
        editor.setValue(contents.html, -1);
      }
    }
  }

  // تابع ذخیره خودکار (هر 5 ثانیه بررسی می‌کند)
  setInterval(() => {
    const selectedProject = projectSelect.value;
    if (selectedProject && selectedProject !== "new") {
      contents[currentMode] = editor.getValue();
      projects[selectedProject] = { ...contents };
      localStorage.setItem("projects", JSON.stringify(projects));
      console.log("Auto-saved project:", selectedProject);
    } else if (selectedProject === "new") {
      // ذخیره موقت پروژه جدید در حافظه موقت
      contents[currentMode] = editor.getValue();
      sessionStorage.setItem("tempProject", JSON.stringify(contents));
    }
  }, 5000); // هر ۵ ثانیه

  // تنظیم حالت خواندنی اولیه و فونت
  editor.setReadOnly(isReadOnly);
  editor.setOption("fontFamily", fontSelect.value);

  // تب پیش‌فرض
  switchTab(currentMode);
};

// ثبت Service Worker برای PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./pwa/sw.js")
      .then((registration) => {
        console.log("ServiceWorker ثبت شد با موفقیت: ", registration.scope);
      })
      .catch((error) => {
        console.log("ServiceWorker ثبت نشد: ", error);
      });
  });
}

// بررسی وضعیت اینترنت
window.addEventListener("load", () => {
  if (!navigator.onLine) {
    // انتقال به صفحه بررسی اتصال
    location.href = "check-connection.html";
  }
});

// همچنین اگر اینترنت در زمان استفاده قطع شد
window.addEventListener("offline", () => {
  location.href = "check-connection.html";
});

// حذف کادر آبی بعد از کلیک روی المنت ها در موبایل
window.addEventListener("load", (e) => {
  if (navigator.userAgentData.mobile) {
    document.querySelectorAll("*").forEach(elem => {
      elem.style.curser = "none";
    });
  }
});

