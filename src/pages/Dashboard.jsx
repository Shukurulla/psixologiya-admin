import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import {
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Jami talabalar',
      value: data?.totalStudents || 0,
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      gradient: 'gradient-blue',
    },
    {
      title: 'Jami testlar',
      value: data?.totalTests || 0,
      change: '+3.2%',
      trend: 'up',
      icon: FileText,
      gradient: 'gradient-purple',
    },
    {
      title: 'Topshirilgan',
      value: data?.totalResults || 0,
      change: '+23.1%',
      trend: 'up',
      icon: CheckCircle,
      gradient: 'gradient-green',
    },
    {
      title: "E'tibor talab",
      value: data?.needsAttentionCount || 0,
      change: '-5.4%',
      trend: 'down',
      icon: AlertTriangle,
      gradient: 'gradient-orange',
    },
  ];

  const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Umumiy ko'rsatkichlar va statistika</p>
        </div>
        <div className="text-sm text-gray-500">
          Oxirgi yangilanish: {format(new Date(), 'HH:mm:ss')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.gradient} rounded-xl flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon size={16} />
                  <span className="font-medium">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value.toLocaleString()}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Completions Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Testlar statistikasi</h2>
              <p className="text-sm text-gray-500 mt-1">Test bo'yicha topshirilganlar soni</p>
            </div>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1">
              <span>Batafsil</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.completionsByTest?.slice(0, 6) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="testName" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Test Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Testlar taqsimoti</h2>
              <p className="text-sm text-gray-500 mt-1">Umumiy ko'rinish</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.completionsByTest?.slice(0, 4) || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ testName, count }) => `${testName}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data?.completionsByTest?.slice(0, 4).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Oxirgi natijalar</h2>
            <p className="text-sm text-gray-500 mt-1">Eng yangi topshirilgan testlar</p>
          </div>
          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1">
            <span>Hammasini ko'rish</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Talaba</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Test</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ball</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sana</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Holat</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentResults?.map((result, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {result.studentName?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{result.studentName}</p>
                        <p className="text-xs text-gray-500">{result.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{result.testName}</td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-purple-600">
                      {result.totalScore}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {format(new Date(result.completedAt), 'dd.MM.yyyy HH:mm')}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`
                        inline-flex px-3 py-1 rounded-full text-xs font-medium
                        ${result.needsAttention
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                        }
                      `}
                    >
                      {result.needsAttention ? "E'tibor talab" : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
