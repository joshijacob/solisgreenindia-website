// ===============================================
//  Solis Green India – Christmas Offer Config
//  Loaded before christmas-popup.js
// ===============================================
window.SOLIS_FESTIVE_CONFIG = {
    enabled: true,

    // Used for localStorage key – change next year
    campaignId: "christmas-2024",

    // Offer detail page (you said: /festive-offers)
    offerPageUrl: "/festive-offers/",

    // Date window when badge + popup should be active
    // (If you don't care about dates, set startDate/endDate to null)
    startDate: "2024-12-01",
    endDate: "2025-01-05",

    // Behaviour: first click shows popup, later clicks go directly to offer page
    firstClickShowsPopup: true,

    // Text contents inside popup
    heading: "🎄 Christmas Solar Celebration",
    subheading: "Book your solar system this Christmas and enjoy extra savings with Solis Green India.",

    discountBadge: "Flat ₹5,000 Christmas Discount*",

    bulletPoints: [
        "Extra Christmas discount on new rooftop systems",
        "Complete guidance for Kerala government solar subsidy",
        "Priority installation for bookings confirmed before 31 December",
        "Special support for homes in Pathanamthitta, Kottayam, Alappuzha & Kollam"
    ],

    // Contact numbers (without formatting)
    primaryPhone: "8301849474",
    alternatePhone: "9539316623",

    // WhatsApp number WITH country code (no + sign)
    whatsappNumber: "918301849474",

    // Optional: auto-open popup after this many ms (null = disabled)
    autoOpenDelayMs: null // e.g. 8000 to auto-open after 8 seconds
};
