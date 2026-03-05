import { pool } from '../../db/database.js';

export const getStoreConfig = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM store_config LIMIT 1');
    res.locals.storeConfig = rows[0] || {};

    next();
  } catch (error) {
    next(error);
  }
};
