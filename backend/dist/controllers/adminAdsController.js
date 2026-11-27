"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAd = exports.updateAd = exports.createAd = exports.getAdminAds = void 0;
const advertisementCMSController_js_1 = require("./advertisementCMSController.js");
exports.getAdminAds = advertisementCMSController_js_1.getCampaigns;
exports.createAd = advertisementCMSController_js_1.createCampaign;
exports.updateAd = advertisementCMSController_js_1.updateCampaign;
exports.deleteAd = advertisementCMSController_js_1.deleteCampaign;
