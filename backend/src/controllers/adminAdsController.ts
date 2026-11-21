import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from './advertisementCMSController.js';

export const getAdminAds = getCampaigns;
export const createAd = createCampaign;
export const updateAd = updateCampaign;
export const deleteAd = deleteCampaign;
