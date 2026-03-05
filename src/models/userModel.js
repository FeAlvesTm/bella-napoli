import { pool } from '../../db/database.js';
import bcrypt from 'bcryptjs';

class Users {
  static async getAllUserData() {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.user_img_url,
        COUNT(o.id) AS total_orders,
        SUM(COALESCE(o.total_amount, 0)) AS total_spent,
        MAX(o.created_at) AS last_order_date
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY total_spent DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async createUser(
    name,
    email,
    password,
    phone,
    zip_code,
    neighborhood,
    street,
    number,
    complement,
    avatarUrl
  ) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users (name,email,password,phone,zip_code,neighborhood,street,number,complement,user_img_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, name, email, phone, user_img_url',
      [
        name,
        email,
        hashedPassword,
        phone,
        zip_code,
        neighborhood,
        street,
        number,
        complement,
        avatarUrl,
      ]
    );
    return newUser.rows[0];
  }

  static async findUserByEmail(email) {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    return user.rows[0];
  }

  static async findUserById(id) {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  static async updateUserData(userId, data, imageUrl) {
    const query = `
    UPDATE users 
    SET 
      name = $1, 
      email = $2, 
      phone = $3, 
      zip_code = $4, 
      street = $5, 
      number = $6, 
      neighborhood = $7, 
      complement = $8,
      user_img_url = $9
    WHERE id = $10
  `;

    const values = [
      data.name,
      data.email,
      data.phone,
      data.zipcode,
      data.street,
      data.number,
      data.neighborhood,
      data.complement,
      imageUrl,
      userId,
    ];

    await pool.query(query, values);
  }
}
export default Users;
