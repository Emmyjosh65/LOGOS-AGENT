"use strict";

/*
 * ============================================
 * LOGOS AI PIN DATABASE
 * ============================================
 *
 * EDIT THIS FILE WHEN YOU WANT TO ADD/REMOVE
 * REDEEMABLE PINS.
 *
 * IMPORTANT:
 * If this file is served directly to the browser,
 * users can inspect it.
 *
 * For real paid PINs, move this exact logic to
 * your Node.js backend/database before production.
 */


/* ============================================
   PLAN CONFIGURATION
============================================ */

const LOGOS_PLANS = {

  FREE: {

    name: "FREE",

    price: 0,

    imagesPerWeek: 2,

    videosPerWeek: 1,

    unlimitedImages: false

  },


  PLUS: {

    name: "PLUS",

    price: 2500,

    imagesPerWeek: 7,

    videosPerWeek: 3,

    unlimitedImages: false

  },


  PRO: {

    name: "PRO",

    price: 4000,

    imagesPerWeek: 15,

    videosPerWeek: 6,

    unlimitedImages: false

  },


  ULTRA: {

    name: "ULTRA",

    price: 20000,

    imagesPerWeek: Infinity,

    videosPerWeek: 13,

    unlimitedImages: true

  }

};


/* ============================================
   YOUR PIN LIST
============================================ */

/*
 * Add your PINs here.
 *
 * Example:
 *
 * "LOGOS-PLUS-1234": {
 *   tier: "PLUS",
 *   used: false
 * }
 *
 */


const LOGOS_PINS = {

  /*
   * PLUS
   */

  "LOGOS-PLUS-1001": {
    tier: "PLUS",
    used: false
  },

  "LOGOS-PLUS-1002": {
    tier: "PLUS",
    used: false
  },

  "LOGOS-PLUS-1003": {
    tier: "PLUS",
    used: false
  },


  /*
   * PRO
   */

  "LOGOS-PRO-2001": {
    tier: "PRO",
    used: false
  },

  "LOGOS-PRO-2002": {
    tier: "PRO",
    used: false
  },

  "LOGOS-PRO-2003": {
    tier: "PRO",
    used: false
  },


  /*
   * ULTRA
   */

  "LOGOS-ULTRA-3001": {
    tier: "ULTRA",
    used: false
  },

  "LOGOS-ULTRA-3002": {
    tier: "ULTRA",
    used: false
  }

};


/* ============================================
   STORAGE
============================================ */

function loadPINDatabase() {

  try {

    const saved =
      localStorage.getItem(
        "logos_used_pins"
      );

    if (!saved) return;

    const usedPins =
      JSON.parse(saved);

    Object.keys(usedPins)
      .forEach(pin => {

        if (
          LOGOS_PINS[pin]
        ) {

          LOGOS_PINS[pin].used =
            true;

        }

      });

  } catch (error) {

    console.error(
      "PIN database error:",
      error
    );

  }

}


function savePINDatabase() {

  const used = {};

  Object.keys(LOGOS_PINS)
    .forEach(pin => {

      if (
        LOGOS_PINS[pin].used
      ) {

        used[pin] = true;

      }

    });


  localStorage.setItem(
    "logos_used_pins",
    JSON.stringify(used)
  );

}


/* ============================================
   REDEEM PIN
============================================ */

function redeemLOGOSPin(
  pin,
  user
) {

  if (!user) {

    return {

      success: false,

      message:
        "Please log in first."

    };

  }


  if (!pin) {

    return {

      success: false,

      message:
        "Enter a PIN."

    };

  }


  const normalized =
    pin
      .trim()
      .toUpperCase();


  const data =
    LOGOS_PINS[
      normalized
    ];


  if (!data) {

    return {

      success: false,

      message:
        "Invalid LOGOS PIN."

    };

  }


  if (data.used) {

    return {

      success: false,

      message:
        "This PIN has already been used."

    };

  }


  const plan =
    LOGOS_PLANS[
      data.tier
    ];


  if (!plan) {

    return {

      success: false,

      message:
        "This PIN has an invalid tier."

    };

  }


  /*
   * Mark PIN as used.
   */

  data.used = true;

  savePINDatabase();


  /*
   * Return the activated plan.
   */

  return {

    success: true,

    tier: plan.name,

    price: plan.price,

    imagesPerWeek:
      plan.imagesPerWeek,

    videosPerWeek:
      plan.videosPerWeek,

    unlimitedImages:
      plan.unlimitedImages,

    message:
      `${plan.name} activated successfully.`

  };

}


/* ============================================
   GET PLAN
============================================ */

function getLOGOSPlan(
  tier
) {

  return (
    LOGOS_PLANS[tier] ||
    LOGOS_PLANS.FREE
  );

}


/* ============================================
   INITIALISE
============================================ */

loadPINDatabase();


/*
 * Make functions available to main.js.
 */

window.LOGOS_PLANS =
  LOGOS_PLANS;

window.LOGOS_PINS =
  LOGOS_PINS;

window.redeemLOGOSPin =
  redeemLOGOSPin;

window.getLOGOSPlan =
  getLOGOSPlan;
