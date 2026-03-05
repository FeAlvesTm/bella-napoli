import { pool } from '../../db/database.js';

class Products {
  static async createProduct(productData) {
    const { name, price, description, image_url, category, status } =
      productData;

    const result = await pool.query(
      'INSERT INTO products (name, price, description, image_url, category, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, price, description, image_url, category, status]
    );
    return result.rows[0];
  }

  static async getAllProducts() {
    const products = await pool.query('SELECT * FROM products');
    return products.rows;
  }

  static async getProductsByCategory(category) {
    const products = await pool.query(
      "SELECT * FROM products WHERE category = $1 AND status = 'ativado'",
      [category]
    );
    return products.rows;
  }

  static async getProductById(id) {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [
      id,
    ]);
    return result.rows[0];
  }

  static async updateProduct(id, productData) {
    const { name, price, description, image_url, category, status } =
      productData;

    const allowedStatus = ['ativado', 'desativado'];
    if (!allowedStatus.includes(status)) {
      throw new Error('Status inválido');
    }

    const result = await pool.query(
      `UPDATE products 
         SET name = $1, price = $2, description = $3, image_url = $4, category = $5, status = $6 
         WHERE id = $7 
         RETURNING *`,
      [name, price, description, image_url, category, status, id]
    );
    return result.rows[0];
  }

  static async deleteProduct(id) {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rowCount;
  }
}

export default Products;
