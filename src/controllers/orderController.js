import { pool } from '../../db/database.js';
import AppError from '../middlewares/appError.js';
import { CheckoutService } from '../services/checkoutService.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = async (req, res, next) => {
  try {
    const url = await CheckoutService.createSession(
      req.user,
      req.body.cart,
      `${req.protocol}://${req.get('host')}`
    );

    res.json({ status: 'success', url });
  } catch (err) {
    next(err);
  }
};

export const webhookCheckout = async (req, res, next) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return next(err);
  }

  try {
    await CheckoutService.handleWebhook(event);
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};
