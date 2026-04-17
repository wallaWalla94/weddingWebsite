let currentLanguageChinese = "en";
let currentSlideChinese = 0;
let slideTimerChinese;
const weddingWebsiteUrl = "https://ginacarloswedding.com/";
let activeHouseholdChinese = [];

const chineseLabels = {
  en: "Español",
  es: "English",
};

const chineseMessages = {
  setup: {
    en: "Add your Supabase URL and anon key in js/supabaseWeddingConfig.js before using live RSVP.",
    es: "Agrega tu URL y anon key de Supabase en js/supabaseWeddingConfig.js antes de usar el RSVP en vivo.",
  },
  lookupLoading: {
    en: "Looking up your household...",
    es: "Buscando tu reservación...",
  },
  lookupEmpty: {
    en: "Please enter your household code and at least a first and last name.",
    es: "Por favor ingresa el código de tu reservación y al menos un nombre y un apellido.",
  },
  lookupMissing: {
    en: "We could not find a household with that code and name.",
    es: "No encontramos una reservación con ese código y nombre.",
  },
  lookupNameFormat: {
    en: "Please enter at least a first name and last name.",
    es: "Por favor ingresa al menos un nombre y un apellido.",
  },
  lookupReady: {
    en: "Household loaded. Please confirm each guest. If you need to make any changes to your RSVP after submitting, please contact us directly.",
    es: "Reservación lista. Por favor confirma cada invitado. Si necesitas hacer cambios en tu reservación por favor contáctanos directamente.",
  },
  submitLoading: {
    en: "Submitting your RSVP...",
    es: "Enviando tu RSVP...",
  },
  submitValidation: {
    en: "Please load your household before submitting.",
    es: "Por favor llena el formulario antes de enviar.",
  },
  submitSuccess: {
    en: "Your RSVP was submitted successfully.",
    es: "Tu RSVP fue enviado con exito.",
  },
  requestError: {
    en: "We could not reach the RSVP service right now. Please try again.",
    es: "No pudimos conectarnos al servicio de RSVP en este momento. Inténtalo otra vez.",
  },
  alreadySubmitted: {
    en: "You have already RSVP’d. Please contact us if you would like to make any changes.",
    es: "Ya has enviado tu RSVP. Por favor contáctanos si deseas hacer cambios.",
  },
  dialogSuccessTitle: {
    en: "RSVP received",
    es: "RSVP recibido",
  },
  dialogSuccessBody: {
    en: "Your RSVP was submitted successfully.",
    es: "Tu RSVP fue enviado con éxito.",
  },
  dialogWarningTitle: {
    en: "RSVP already submitted",
    es: "RSVP ya enviado",
  },
  dialogWarningBody: {
    en: "You have already RSVP’d. Please contact us if you would like to make any changes.",
    es: "Ya has enviado tu RSVP. Por favor contáctanos si deseas hacer cambios.",
  },
};

function getChineseConfig() {
  const config = window.WEDDING_SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) {
    return null;
  }

  return {
    url: config.url.replace(/\/$/, ""),
    anonKey: config.anonKey,
  };
}

function getChineseHeaders() {
  const config = getChineseConfig();
  if (!config) return null;

  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    "Content-Type": "application/json",
  };
}

function setChineseStatus(messageKey = "") {
  const status = document.getElementById("rsvpStatusChinese");
  if (!status) return;

  if (!messageKey) {
    status.textContent = "";
    status.dataset.messageKey = "";
    return;
  }

  status.dataset.messageKey = messageKey;
  status.textContent = chineseMessages[messageKey][currentLanguageChinese];
}

function updateChineseCalendarLink(calendarLink) {
  if (!calendarLink) return;

  const websiteLine =
    currentLanguageChinese === "es"
      ? `Sitio web: ${weddingWebsiteUrl}`
      : `Website: ${weddingWebsiteUrl}`;

  const details =
    currentLanguageChinese === "es"
      ? `Llegada 2:30 PM, Ceremonia 3:00 PM, Recepción 5:00 PM\n${websiteLine}`
      : `Arrival 2:30 PM, Ceremony 3:00 PM, Reception 5:00 PM\n${websiteLine}`;

  const calendarUrl = new URL(calendarLink.href);
  calendarUrl.searchParams.set("details", details);
  calendarLink.href = calendarUrl.toString();
}

function renderChineseHouseholdMembers() {
  const container = document.getElementById("householdMembersChinese");
  const householdPanel = document.getElementById("householdPanelChinese");
  const welcome = document.getElementById("householdWelcomeChinese");

  if (!container || !householdPanel || !welcome) return;

  if (!activeHouseholdChinese.length) {
    container.innerHTML = "";
    welcome.textContent = currentLanguageChinese === "es" ? "Bienvenido" : "Welcome";
    householdPanel.classList.remove("is-visible");
    householdPanel.style.display = "none";
    return;
  }

  const familyName = activeHouseholdChinese[0].familyName || "";
  welcome.textContent =
    currentLanguageChinese === "es"
      ? familyName
        ? `Bienvenidos, ${familyName}`
        : "Bienvenidos"
      : familyName
        ? `Welcome, ${familyName}`
        : "Welcome";

  container.innerHTML = activeHouseholdChinese
    .map((guest) => {
      const attendingValue =
        guest.attending === true || guest.attending === "true" ? "yes" : "no";
      const yesLabel = currentLanguageChinese === "es" ? "Asistirá" : "Attending";
      const noLabel = currentLanguageChinese === "es" ? "No asistirá" : "Not attending";

      return `
        <article class="household-member-card">
          <div class="household-member-copy">
            <h3>${guest.fullName}</h3>
          </div>
          <div class="household-attendance-options">
            <label class="selection-pill">
              <input type="radio" name="attendance-${guest.id}" value="yes" ${attendingValue === "yes" ? "checked" : ""}>
              <span>${yesLabel}</span>
            </label>
            <label class="selection-pill">
              <input type="radio" name="attendance-${guest.id}" value="no" ${attendingValue === "no" ? "checked" : ""}>
              <span>${noLabel}</span>
            </label>
          </div>
        </article>
      `;
    })
    .join("");

  householdPanel.style.display = "grid";
  householdPanel.classList.remove("is-visible");
  void householdPanel.offsetWidth;
  householdPanel.classList.add("is-visible");
}

function applyChineseLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-en]").forEach((element) => {
    const value = element.getAttribute(`data-${lang}`);
    if (value) {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-en-placeholder]").forEach((element) => {
    const value = element.getAttribute(`data-${lang}-placeholder`);
    if (value) {
      element.setAttribute("placeholder", value);
    }
  });

  const toggle = document.getElementById("languageToggleChinese");
  if (toggle) {
    toggle.textContent = chineseLabels[lang];
  }

  const status = document.getElementById("rsvpStatusChinese");
  if (status?.dataset.messageKey) {
    setChineseStatus(status.dataset.messageKey);
  }

  renderChineseHouseholdMembers();
}

function showChineseSlide(index) {
  const slides = [...document.querySelectorAll(".hero-slide")];
  const dots = [...document.querySelectorAll(".slide-dot")];
  if (!slides.length) return;

  currentSlideChinese = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentSlideChinese);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentSlideChinese);
  });
}

function scheduleChineseSlides() {
  window.clearTimeout(slideTimerChinese);
  slideTimerChinese = window.setTimeout(() => {
    showChineseSlide(currentSlideChinese + 1);
    scheduleChineseSlides();
  }, 6500);
}

async function callChineseRpc(functionName, payload) {
  const config = getChineseConfig();
  const headers = getChineseHeaders();
  if (!config || !headers) {
    throw new Error("setup");
  }

  const response = await fetch(`${config.url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    const message =
      errorData?.message ||
      errorData?.error ||
      "request";

    const err = new Error(message);

    // preserve database error code if available
    if (errorData?.code) {
      err.code = errorData.code;
    }

    throw err;
  }

  return response.json();
}

function normalizeChineseName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchesChineseGuestName(inputName, guestName) {
  const inputParts = normalizeChineseName(inputName).split(" ").filter(Boolean);
  const guestParts = normalizeChineseName(guestName).split(" ").filter(Boolean);

  if (inputParts.length < 2) {
    return false;
  }

  const matchedCount = inputParts.filter((part) => guestParts.includes(part)).length;
  return matchedCount >= 2;
}

function parseChineseContactInfo(contactValue) {
  const value = String(contactValue || "").trim();
  if (!value) {
    return { email: "", phone: "" };
  }

  const emailMatch = value.match(/Email:\s*([^|]+?)(?:\s*\|\s*Phone:|$)/i);
  const phoneMatch = value.match(/Phone:\s*([^|]+?)(?:\s*\|\s*Email:|$)/i);

  if (emailMatch || phoneMatch) {
    return {
      email: emailMatch?.[1]?.trim() || "",
      phone: phoneMatch?.[1]?.trim() || "",
    };
  }

  if (value.includes("@")) {
    return { email: value, phone: "" };
  }

  return { email: "", phone: value };
}

function formatChineseContactInfo(emailValue, phoneValue) {
  const email = String(emailValue || "").trim();
  const phone = String(phoneValue || "").trim();
  const contactParts = [];

  if (email) contactParts.push(`Email: ${email}`);
  if (phone) contactParts.push(`Phone: ${phone}`);

  return contactParts.join(" | ") || null;
}

async function sendChineseConfirmationNotification(payload) {
  const normalizedPayload = {
    email: payload.email || "",
    phone: payload.phone || "",
    contact: payload.contact || payload.email || payload.phone || "",
    dietaryNotes: payload.dietaryNotes || payload.dietary || "",
    message: payload.message || payload.note || "",
    language: payload.language || "en",
    householdName: payload.householdName,
    lookupName: payload.lookupName,
    websiteUrl: "https://ginacarloswedding.com/",
    guests: payload.guests || []
  };

  console.log("Sending confirmation payload:", normalizedPayload); // 👈 debug

  const response = await fetch("/.netlify/functions/send-rsvp-confirmation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizedPayload),
  });

  return response;
}


async function loadChineseHousehold() {
  const config = getChineseConfig();
  const fullNameInput = document.getElementById("fullNameChinese");
  const codeInput = document.getElementById("householdCodeChinese");
  const email = document.getElementById("contactEmailChinese");
  const phone = document.getElementById("contactPhoneChinese");
  const dietaryNotes = document.getElementById("dietaryNotesChinese");
  const message = document.getElementById("messageChinese");

  if (!config) {
    setChineseStatus("setup");
    return;
  }

  const fullNameRaw = fullNameInput?.value.trim() || "";
  const fullName = normalizeChineseName(fullNameRaw);
  const code = codeInput?.value.trim();

  if (!fullName || !code) {
    activeHouseholdChinese = [];
    renderChineseHouseholdMembers();
    setChineseStatus("lookupEmpty");
    return;
  }

  if (!/\S+\s+\S+/.test(fullName)) {
    activeHouseholdChinese = [];
    renderChineseHouseholdMembers();
    setChineseStatus("lookupNameFormat");
    return;
  }

  setChineseStatus("lookupLoading");

  try {
    const rows = await callChineseRpc("lookup_household_secure", {
      input_code: code,
      input_name: fullName,
    });

    if (!rows.length) {
      activeHouseholdChinese = [];
      renderChineseHouseholdMembers();
      setChineseStatus("lookupMissing");
      return;
    }

    activeHouseholdChinese = rows.map((row) => ({
      id: row.guest_id,
      fullName: row.full_name,
      householdId: row.household_id,
      familyName: row.household_name || "",
      attending: row.attending,
    }));

    const sharedValues = rows.find(
      (row) => row.contact || row.dietary_notes || row.message
    );

    const contactInfo = parseChineseContactInfo(sharedValues?.contact);

    if (email) email.value = contactInfo.email;
    if (phone) phone.value = contactInfo.phone;
    if (dietaryNotes) dietaryNotes.value = sharedValues?.dietary_notes || "";
    if (message) message.value = sharedValues?.message || "";

    renderChineseHouseholdMembers();
    setChineseStatus("lookupReady");
  } catch (error) {
    console.error(error);
    setChineseStatus(error.message === "setup" ? "setup" : "requestError");
  }
}


function showChineseDialog(titleKey, bodyKey) {
  const dialog = document.getElementById("rsvpDialogChinese");
  const title = document.getElementById("rsvpDialogTitleChinese");
  const body = document.getElementById("rsvpDialogMessageChinese");

  if (!dialog) return;

  if (title && chineseMessages[titleKey]) {
    title.textContent = chineseMessages[titleKey][currentLanguageChinese];
  }

  if (body && chineseMessages[bodyKey]) {
    body.textContent = chineseMessages[bodyKey][currentLanguageChinese];
  }

  if (dialog.showModal) {
    dialog.showModal();
  } else {
    window.alert(chineseMessages[bodyKey][currentLanguageChinese]);
  }
}


async function submitChineseRsvp(event) {
  event.preventDefault();

  const config = getChineseConfig();
  const form = document.getElementById("rsvpFormChinese");
  const fullNameRaw = document.getElementById("fullNameChinese")?.value.trim() || "";
  const fullName = normalizeChineseName(fullNameRaw);
  const code = document.getElementById("householdCodeChinese")?.value.trim() || "";
  const email = document.getElementById("contactEmailChinese");
  const phone = document.getElementById("contactPhoneChinese");
  const dietaryNotes = document.getElementById("dietaryNotesChinese");
  const message = document.getElementById("messageChinese");

  if (!form) return;

  if (!config) {
    setChineseStatus("setup");
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!activeHouseholdChinese.length) {
    setChineseStatus("submitValidation");
    return;
  }

  setChineseStatus("submitLoading");

  try {
    const emailValue = email?.value.trim() || "";
    const phoneValue = phone?.value.trim() || "";
    const contactValue = formatChineseContactInfo(emailValue, phoneValue);
    const responses = activeHouseholdChinese.map((guest) => {
      const attendanceInput = document.querySelector(
        `input[name="attendance-${guest.id}"]:checked`
      );

      return {
        guest_id: guest.id,
        attending: attendanceInput?.value === "yes",
      };
    });

    const result = await callChineseRpc("submit_household_rsvp_secure", {
      input_code: code,
      input_name: fullName,
      input_contact: contactValue,
      input_dietary_notes: dietaryNotes?.value.trim() || null,
      input_message: message?.value.trim() || null,
      input_responses: responses,
    });

    const isSuccess =
      result === true ||
      result?.submit_household_rsvp_secure === true ||
      (Array.isArray(result) &&
        (result[0] === true || result[0]?.submit_household_rsvp_secure === true));

    if (!isSuccess) {
      setChineseStatus("alreadySubmitted");
      showChineseDialog("dialogWarningTitle", "dialogWarningBody");
      return;
    }

    if (emailValue || phoneValue) {
      try {
        await sendChineseConfirmationNotification({
          language: currentLanguageChinese,
          householdName: activeHouseholdChinese[0]?.familyName || "",
          lookupName: fullNameRaw,
          email: emailValue || null,
          phone: phoneValue || null,
          contact: contactValue || "",
          dietaryNotes: dietaryNotes?.value.trim() || "",
          message: message?.value.trim() || "",
          websiteUrl: weddingWebsiteUrl,
          guests: activeHouseholdChinese.map((guest, index) => ({
            name: guest.fullName,
            attending: responses[index]?.attending === true,
          })),
        });
      } catch (notificationError) {
        console.warn("RSVP confirmation notification failed", notificationError);
      }
    }

    setChineseStatus("submitSuccess");
    showChineseDialog("dialogSuccessTitle", "dialogSuccessBody");
  } catch (error) {
    console.error(error);

    if (error.message === "setup") {
      setChineseStatus("setup");
      return;
    }

    if (
      error.message?.includes("duplicate") ||
      error.message?.includes("already") ||
      error.code === "23505"
    ) {
      setChineseStatus("alreadySubmitted");
      showChineseDialog("dialogWarningTitle", "dialogWarningBody");
      return;
    }

    setChineseStatus("requestError");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("siteNav");
  const menuToggle = document.getElementById("menuToggleChinese");
  const languageToggle = document.getElementById("languageToggleChinese");
  const rsvpForm = document.getElementById("rsvpFormChinese");
  const lookupButton = document.getElementById("lookupHouseholdChinese");
  const calendarLink = document.getElementById("calendarLinkChinese");
  const prev = document.getElementById("prevSlide");
  const next = document.getElementById("nextSlide");
  const dotsContainer = document.getElementById("slideDots");
  const dialog = document.getElementById("rsvpDialogChinese");
  const dialogClose = document.getElementById("rsvpDialogCloseChinese");
  const navLinks = [...document.querySelectorAll(".site-nav a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const householdPanel = document.getElementById("householdPanelChinese");
  if (householdPanel) {
    householdPanel.style.display = "none";
    householdPanel.classList.remove("is-visible");
  }

  document.querySelectorAll(".hero-slide").forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `slide-dot${index === 0 ? " is-active" : ""}`;
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => {
      showChineseSlide(index);
      scheduleChineseSlides();
    });
    dotsContainer?.appendChild(dot);
  });

  showChineseSlide(0);
  scheduleChineseSlides();

  prev?.addEventListener("click", () => {
    showChineseSlide(currentSlideChinese - 1);
    scheduleChineseSlides();
  });

  next?.addEventListener("click", () => {
    showChineseSlide(currentSlideChinese + 1);
    scheduleChineseSlides();
  });

  menuToggle?.addEventListener("click", () => {
    nav?.classList.toggle("is-open");
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const savedLang = localStorage.getItem("languageChinese");
  const browserLang = navigator.language.startsWith("es") ? "es" : "en";
  currentLanguageChinese = savedLang || browserLang;
  applyChineseLanguage(currentLanguageChinese);
  updateChineseCalendarLink(calendarLink);

  languageToggle?.addEventListener("click", () => {
    currentLanguageChinese = currentLanguageChinese === "en" ? "es" : "en";
    localStorage.setItem("languageChinese", currentLanguageChinese);
    applyChineseLanguage(currentLanguageChinese);
    updateChineseCalendarLink(calendarLink);
  });

  lookupButton?.addEventListener("click", loadChineseHousehold);
  rsvpForm?.addEventListener("submit", submitChineseRsvp);

  dialogClose?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-current", isCurrent);
        });
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => observer.observe(section));
});
