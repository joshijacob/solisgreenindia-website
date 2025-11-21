// ======================================================
//  Solis Green India – Christmas Header Icon + Popup
//  Depends on window.SOLIS_FESTIVE_CONFIG
// ======================================================
(function () {
    const cfg = window.SOLIS_FESTIVE_CONFIG || {};
    if (!cfg.enabled) return;

    const STORAGE_KEY =
        "solis_festive_seen_" + (cfg.campaignId || "default");

    document.addEventListener("DOMContentLoaded", function () {
        if (!isCampaignActive(cfg)) return;

        createHeaderOfferBadge(cfg);
        createPopup(cfg);

        if (typeof cfg.autoOpenDelayMs === "number") {
            setTimeout(() => {
                if (!hasSeenPopup()) {
                    openPopup();
                    markPopupSeen();
                }
            }, cfg.autoOpenDelayMs);
        }
    });

    // -----------------------------
    //  Helpers – date & state
    // -----------------------------

    function isCampaignActive(config) {
        if (!config.startDate || !config.endDate) return true;

        const today = new Date();
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);

        return today >= start && today <= end;
    }

    function hasSeenPopup() {
        try {
            return localStorage.getItem(STORAGE_KEY) === "1";
        } catch (e) {
            return false;
        }
    }

    function markPopupSeen() {
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch (e) {
            // ignore
        }
    }

    function formatDateLabel(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // -----------------------------
    //  Header badge
    // -----------------------------

    function createHeaderOfferBadge(config) {
        const navList = document.querySelector("header nav ul");
        if (!navList) return;

        // Create <li> after "Contact"
        const li = document.createElement("li");
        li.className = "xmas-offer-nav-item";

        li.innerHTML = `
            <button id="xmasOfferBadge" type="button" aria-label="View festive solar offers">
                <span class="xmas-offer-icon">
                    <i class="fas fa-gift" aria-hidden="true"></i>
                </span>
                <span class="xmas-offer-text">Offers</span>
                <span class="xmas-offer-tag">New</span>
            </button>
        `;

        navList.appendChild(li);

        const badge = li.querySelector("#xmasOfferBadge");
        if (!badge) return;

        badge.addEventListener("click", function (e) {
            e.preventDefault();

            if (config.firstClickShowsPopup && !hasSeenPopup()) {
                openPopup();
                markPopupSeen();
            } else {
                goToOfferPage(config);
            }
        });
    }

    function goToOfferPage(config) {
        if (!config.offerPageUrl) return;
        window.location.href = config.offerPageUrl;
    }

    // -----------------------------
    //  Popup creation & behaviour
    // -----------------------------

    function createPopup(config) {
        // Avoid duplicate creation
        if (document.getElementById("solis-gift-popup")) return;

        const overlay = document.createElement("div");
        overlay.id = "solis-gift-popup";
        overlay.setAttribute("aria-hidden", "true");

        const endLabel = formatDateLabel(config.endDate);

        overlay.innerHTML = `
            <div id="solis-popup-content" role="dialog"
                 aria-modal="true"
                 aria-labelledby="solisOfferHeading">
                <button type="button"
                        class="solis-btn-close"
                        aria-label="Close festive offer popup">
                    &times;
                </button>

                <h2 id="solisOfferHeading">${config.heading || "Festive Solar Offers"}</h2>
                <h3>${config.subheading || ""}</h3>

                <div class="solis-discount-badge">
                    ${config.discountBadge || "Special Festive Discount"}
                </div>

                ${
                    Array.isArray(config.bulletPoints)
                        ? `<ul class="solis-offer-points">
                            ${config.bulletPoints
                                .map((item) => `<li>${item}</li>`)
                                .join("")}
                           </ul>`
                        : ""
                }

                <div class="solis-submit-buttons">
                    <button type="button"
                            class="solis-btn solis-btn-email"
                            id="solisOfferCallBtn">
                        <i class="fas fa-phone"></i>
                        Call Primary
                    </button>

                    <button type="button"
                            class="solis-btn solis-btn-whatsapp"
                            id="solisOfferWhatsAppBtn">
                        <i class="fab fa-whatsapp"></i>
                        WhatsApp Offer
                    </button>

                    <button type="button"
                            class="solis-btn solis-btn-details"
                            id="solisOfferDetailsBtn">
                        <i class="fas fa-gift"></i>
                        View Full Offer
                    </button>
                </div>

                <p class="solis-offer-footer">
                    ${
                        endLabel
                            ? `*Offer valid for new bookings confirmed till ${endLabel}.`
                            : "*Limited period festive offer – conditions apply."
                    }
                </p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Optional: tiny snowflakes in the popup
        createPopupSnowflakes(overlay);

        // Close handlers
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                closePopup();
            }
        });

        const closeBtn = overlay.querySelector(".solis-btn-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", closePopup);
        }

        document.addEventListener("keydown", escHandler);

        // Button actions
        const callBtn = overlay.querySelector("#solisOfferCallBtn");
        const waBtn = overlay.querySelector("#solisOfferWhatsAppBtn");
        const detailsBtn = overlay.querySelector("#solisOfferDetailsBtn");

        if (callBtn && config.primaryPhone) {
            callBtn.addEventListener("click", function () {
                window.location.href = "tel:" + config.primaryPhone;
            });
        }

        if (waBtn && config.whatsappNumber) {
            waBtn.addEventListener("click", function () {
                const message =
                    "🎄 SOLIS GREEN INDIA – Christmas Solar Offer 🎄%0A%0A" +
                    "Hi, I am interested in the Christmas solar discount. " +
                    "Please share more details.";
                const url =
                    "https://wa.me/" +
                    config.whatsappNumber +
                    "?text=" +
                    message;
                window.open(url, "_blank");
            });
        }

        if (detailsBtn) {
            detailsBtn.addEventListener("click", function () {
                goToOfferPage(config);
            });
        }
    }

    function createPopupSnowflakes(overlay) {
        for (let i = 0; i < 15; i++) {
            const flake = document.createElement("span");
            flake.className = "solis-snowflake";
            flake.textContent = "❄";

            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 6 + Math.random() * 6;

            flake.style.left = left + "%";
            flake.style.animationDuration = duration + "s";
            flake.style.animationDelay = delay + "s";

            overlay.appendChild(flake);
        }
    }

    function openPopup() {
        const overlay = document.getElementById("solis-gift-popup");
        if (!overlay) return;

        overlay.style.display = "block";
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closePopup() {
        const overlay = document.getElementById("solis-gift-popup");
        if (!overlay) return;

        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "auto";

        document.removeEventListener("keydown", escHandler);
    }

    function escHandler(e) {
        if (e.key === "Escape") {
            closePopup();
        }
    }
})();
