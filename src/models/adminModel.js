import { pool } from '../../db/database.js';
import AppError from '../middlewares/appError.js';

export class AdminModel {
  static async getStoreConfig() {
    const query = `
      SELECT *, 
        TO_CHAR(mon_start, 'HH24:MI') as mon_start, TO_CHAR(mon_end, 'HH24:MI') as mon_end,
        TO_CHAR(tue_start, 'HH24:MI') as tue_start, TO_CHAR(tue_end, 'HH24:MI') as tue_end,
        TO_CHAR(wed_start, 'HH24:MI') as wed_start, TO_CHAR(wed_end, 'HH24:MI') as wed_end,
        TO_CHAR(thu_start, 'HH24:MI') as thu_start, TO_CHAR(thu_end, 'HH24:MI') as thu_end,
        TO_CHAR(fri_start, 'HH24:MI') as fri_start, TO_CHAR(fri_end, 'HH24:MI') as fri_end,
        TO_CHAR(sat_start, 'HH24:MI') as sat_start, TO_CHAR(sat_end, 'HH24:MI') as sat_end,
        TO_CHAR(sun_start, 'HH24:MI') as sun_start, TO_CHAR(sun_end, 'HH24:MI') as sun_end
      FROM store_config 
      LIMIT 1
    `;
    const { rows } = await pool.query(query);

    if (!rows[0]) return {};

    const { id, updated_at, ...configData } = rows[0];
    return configData;
  }

  static async updateStoreConfig(data) {
    const allowedFields = [
      'store_name',
      'cnpj',
      'phone',
      'email',
      'address',

      'delivery_fee',
      'free_delivery_active',
      'free_delivery_threshold',
      'delivery_time',

      'mon_start',
      'mon_end',
      'mon_switch',
      'tue_start',
      'tue_end',
      'tue_switch',
      'wed_start',
      'wed_end',
      'wed_switch',
      'thu_start',
      'thu_end',
      'thu_switch',
      'fri_start',
      'fri_end',
      'fri_switch',
      'sat_start',
      'sat_end',
      'sat_switch',
      'sun_start',
      'sun_end',
      'sun_switch',

      'pay_card',
      'pay_pix',
      'pay_cash',
    ];
    const entries = Object.entries(data).filter(([key]) =>
      allowedFields.includes(key)
    );

    if (entries.length === 0) {
      throw new AppError('Nenhum campo válido para atualizar', 400);
    }

    const fields = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');

    const values = entries.map(([, value]) => value);
    const query = `UPDATE store_config SET ${fields}, updated_at = NOW() WHERE id = 1 RETURNING *`;
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getPageStats() {
    const agora = new Date();

    const periodoAtual = [
      new Date(agora.getFullYear(), agora.getMonth(), 1),
      agora,
    ];

    const periodoPassado = [
      new Date(agora.getFullYear(), agora.getMonth() - 1, 1),
      new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59, 999),
    ];

    const fetchRevenue = async (period) => {
      const query = `
      SELECT 
        COUNT(id) AS "orders",
        COALESCE(SUM(total_amount), 0) AS "revenue",
        COALESCE(AVG(total_amount), 0) AS "ticket"
      FROM orders WHERE status = 'concluido' AND created_at BETWEEN $1 AND $2
    `;
      const { rows } = await pool.query(query, period);
      return rows[0];
    };

    const atual = await fetchRevenue(periodoAtual);
    const passado = await fetchRevenue(periodoPassado);

    const clientesAtual = await this.getNewCustomersCount(...periodoAtual);
    const clientesPassado = await this.getNewCustomersCount(...periodoPassado);

    const calcTrend = (now, prev) => {
      const n = parseFloat(now);
      const p = parseFloat(prev);
      if (p === 0) return n > 0 ? '100.0' : '0.0';
      return (((n - p) / p) * 100).toFixed(1);
    };

    return {
      totalRevenue: parseFloat(atual.revenue).toFixed(2),
      revTrend: calcTrend(atual.revenue, passado.revenue),
      totalOrders: parseInt(atual.orders),
      ordersTrend: calcTrend(atual.orders, passado.orders),
      newCustomers: clientesAtual,
      customersTrend: calcTrend(clientesAtual, clientesPassado),
      averageTicket: parseFloat(atual.ticket).toFixed(2),
      ticketTrend: calcTrend(atual.ticket, passado.ticket),
      topProducts: await this.getTopProductsPerformance(),
      peakDays: await this.getPeakDaysData(),
    };
  }

  static async getNewCustomersCount(startDate, endDate) {
    let start =
      startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let end = endDate || new Date();

    const startLocal = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      0,
      0
    );
    const endLocal = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      23,
      59,
      59,
      999
    );

    const query = `
    SELECT COUNT(id) AS total_count
    FROM users
    WHERE created_at >= $1 AND created_at <= $2
  `;

    const { rows } = await pool.query(query, [startLocal, endLocal]);
    const count = parseInt(rows[0]?.total_count ?? 0);

    return count;
  }

  static async getWeeklySalesChart() {
    const query = `
    SELECT 
      EXTRACT(DOW FROM created_at) AS "dia_semana",
      SUM(total_amount) AS "vendas"
    FROM orders
    WHERE status = 'concluido' 
    AND created_at >= DATE_TRUNC('month', NOW()) 
    GROUP BY dia_semana
    ORDER BY dia_semana ASC;
  `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getTopProductsChart() {
    const query = `
    SELECT 
      p.name AS "label",
      SUM(oi.quantity) AS "value"
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'concluido' 
    AND o.created_at >= DATE_TRUNC('month', NOW())
    GROUP BY p.name
    ORDER BY value DESC
    LIMIT 5; -- Pegamos apenas os 5 mais vendidos
  `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getTopProductsPerformance() {
    const query = `
    SELECT 
      p.name, 
      p.category,
      SUM(oi.quantity * oi.price_at_purchase) as total,
      DATE_TRUNC('month', o.created_at) as mes
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'concluido' 
    AND o.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    GROUP BY p.name, p.category, mes
  `;

    const { rows } = await pool.query(query);
    const agora = new Date();
    const mesAtualInicio = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      1
    ).getTime();

    const stats = rows.reduce((acc, item) => {
      if (!item.name) return acc;

      const isAtual = new Date(item.mes).getTime() === mesAtualInicio;

      if (!acc[item.name]) {
        acc[item.name] = {
          name: item.name,
          category: item.category || 'Geral',
          atual: 0,
          passado: 0,
        };
      }

      const valor = parseFloat(item.total || 0);
      if (isAtual) acc[item.name].atual += valor;
      else acc[item.name].passado += valor;

      return acc;
    }, {});

    return Object.values(stats)
      .map((p) => {
        let growth = 0;
        if (p.passado > 0) {
          growth = ((p.atual - p.passado) / p.passado) * 100;
        } else if (p.atual > 0) {
          growth = 100.0;
        }

        return {
          name: p.name,
          category: p.category,
          revenue: p.atual.toFixed(2),
          growth: growth.toFixed(1),
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  static async getRecentOrdersAdmin() {
    const query = `
    SELECT 
      o.id, 
      u.name AS "userName", 
      o.total_amount, 
      o.status, 
      o.created_at,
      STRING_AGG(oi.quantity || 'x ' || p.name, ', ') AS "itemsSummary"
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    GROUP BY o.id, u.name
    ORDER BY o.created_at DESC
    LIMIT 50;
  `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getPeakDaysData() {
    const query = `
    SELECT 
      DATE_TRUNC('day', created_at) AS data_dia,
      COUNT(id)::int AS total_pedidos
    FROM orders
    WHERE status = 'concluido' 
      AND created_at >= CURRENT_DATE - INTERVAL '27 days'
    GROUP BY data_dia
    ORDER BY data_dia ASC
  `;

    const { rows } = await pool.query(query);
    const maxPedidos = Math.max(...rows.map((r) => r.total_pedidos), 1);

    const statsMap = {};
    rows.forEach((r) => {
      const dataStr = new Date(r.data_dia).toISOString().split('T')[0];
      statsMap[dataStr] = r.total_pedidos;
    });

    const heatmap = [];
    const hoje = new Date();

    for (let i = 27; i >= 0; i--) {
      const dataAlvo = new Date();
      dataAlvo.setDate(hoje.getDate() - i);
      const dataStr = dataAlvo.toISOString().split('T')[0];

      const qtd = statsMap[dataStr] || 0;

      let level = 0;
      if (qtd > 0) {
        level = Math.max(1, Math.ceil((qtd / maxPedidos) * 4));
      }

      heatmap.push({
        diaNome: dataAlvo.toLocaleDateString('pt-BR', { weekday: 'long' }),
        data: dataAlvo.toLocaleDateString('pt-BR'),
        level: level,
        qtdTotal: qtd,
      });
    }

    return { cells: heatmap };
  }
}
