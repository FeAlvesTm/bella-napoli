import { AdminModel } from '../models/adminModel.js';
import Users from '../models/userModel.js';

export class AdminDashboardService {
  static async getDashboardData() {
    const agora = new Date();

    const [pageStats, weeklySales, topProductsChart, recentOrders] =
      await Promise.all([
        AdminModel.getPageStats(),
        AdminModel.getWeeklySalesChart(),
        AdminModel.getTopProductsChart(),
        AdminModel.getRecentOrdersAdmin(),
      ]);

    const dataHoje = agora.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      ...pageStats,
      weeklySales: JSON.stringify(weeklySales),
      topProductsChart: JSON.stringify(topProductsChart),
      recentOrders,
      dataHoje,
    };
  }

  static async getCustomersData() {
    const customers = await Users.getAllUserData();

    const totalCustomers = customers.length;

    const totalOrders = customers.reduce(
      (acc, c) => acc + parseInt(c.total_orders || 0),
      0
    );

    const totalRevenue = customers.reduce(
      (acc, c) => acc + parseFloat(c.total_spent || 0),
      0
    );
    const dashboardStats = await AdminModel.getPageStats();
    const baseGrowth = dashboardStats.customersTrend;
    const avgLtv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return {
      baseGrowth,
      customers,
      stats: {
        totalCustomers,
        totalOrders,
        avgLtv,
      },
    };
  }
}
