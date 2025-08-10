import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, AlertCircle, Clock, Users, Globe, Zap, Server } from 'lucide-react';

// 색상 팔레트 (디자인 시스템 준수)
const COLORS = [
  'var(--green-500)',
  'var(--red-500)',
  'var(--blue)',
  'var(--green-400)',
  'var(--warning-yellow)',
  'var(--black-300)'
];

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    connectToMetricsStream();

    return () => {
      // Cleanup WebSocket connection
      if (window.metricsWs) {
        window.metricsWs.close();
      }
    };
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToMetricsStream = () => {
    const ws = new WebSocket(`wss://${window.location.host}/api/v1/analytics/stream`);

    ws.onopen = () => {
      console.log('Connected to metrics stream');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics_update') {
        setRealTimeMetrics(data.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    window.metricsWs = ws;
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--green-500)] mx-auto mb-4"></div>
          <p className="text-[16px] text-[var(--black-300)]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview?.last24h;
  const { topPaths, errorsByStatus, geoDistribution } = dashboardData || {};

  return (
    <div className="min-h-screen page-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[28px] font-bold text-[var(--black-500)]">Analytics Dashboard</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-[var(--black-50)] rounded-lg bg-white text-[var(--black-500)]"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Activity}
            title="Total Requests"
            value={overview?.count || 0}
            change="+12.5%"
            color="#00C471"
          />
          <MetricCard
            icon={Clock}
            title="Avg Response Time"
            value={`${overview?.avgDuration?.toFixed(0) || 0}ms`}
            change="-5.2%"
            color="#45B7D1"
          />
          <MetricCard
            icon={AlertCircle}
            title="Error Rate"
            value={`${((overview?.errorRate || 0) * 100).toFixed(1)}%`}
            change="+0.3%"
            color="#FF6B6B"
          />
          <MetricCard
            icon={Zap}
            title="P95 Response Time"
            value={`${overview?.p95Duration?.toFixed(0) || 0}ms`}
            change="-2.1%"
            color="#FFA07A"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Time Chart */}
          <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
            <h3 className="text-[18px] font-bold text-[var(--black-500)] mb-4">Response Time Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateTimeSeriesData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
                <XAxis dataKey="time" stroke="var(--black-300)" />
                <YAxis stroke="var(--black-300)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="var(--green-500)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  stroke="var(--red-400)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Endpoints Chart */}
          <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
            <h3 className="text-[18px] font-bold text-[var(--black-500)] mb-4">Top Endpoints</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatTopPaths(topPaths)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
                <XAxis type="number" stroke="var(--black-300)" />
                <YAxis dataKey="path" type="category" stroke="var(--black-300)" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--green-500)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Error Distribution */}
          <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
            <h3 className="text-[18px] font-bold text-[var(--black-500)] mb-4">Error Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={formatErrorDistribution(errorsByStatus)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {formatErrorDistribution(errorsByStatus)?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
            <h3 className="text-[18px] font-bold text-[var(--black-500)] mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Geographic Distribution
            </h3>
            <div className="space-y-3">
              {formatGeoDistribution(geoDistribution)?.slice(0, 5).map((country, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-[14px] text-[var(--black-300)]">{country.country}</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-[var(--black-50)] rounded-full mr-2">
                      <div
                        className="h-full bg-[var(--green-500)] rounded-full"
                        style={{ width: `${(country.percentage)}%` }}
                      />
                    </div>
                    <span className="text-[14px] font-semibold text-[var(--black-500)] w-12 text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
            <h3 className="text-[18px] font-bold text-[var(--black-500)] mb-4 flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Real-time Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[var(--black-300)]">Active Connections</span>
                <span className="text-[16px] font-semibold text-[var(--black-500)]">
                  {realTimeMetrics?.activeConnections || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[var(--black-300)]">Req/sec</span>
                <span className="text-[16px] font-semibold text-[var(--black-500)]">
                  {realTimeMetrics?.requestsPerSecond || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[var(--black-300)]">CPU Usage</span>
                <span className="text-[16px] font-semibold text-[var(--black-500)]">
                  {realTimeMetrics?.cpuUsage || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[var(--black-300)]">Memory Usage</span>
                <span className="text-[16px] font-semibold text-[var(--black-500)]">
                  {realTimeMetrics?.memoryUsage || 0}MB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon: Icon, title, value, change, color }) {
  const isPositive = change.startsWith('+');
  const isGoodChange = (title.includes('Error') || title.includes('Response')) ? !isPositive : isPositive;

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color === '#00C471' ? 'metric-pill-success' : color === '#45B7D1' ? 'metric-pill-info' : color === '#FF6B6B' ? 'metric-pill-danger' : 'metric-pill-warning'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-[14px] font-semibold ${isGoodChange ? 'text-[var(--green-500)]' : 'text-[var(--red-400)]'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-[14px] text-[var(--black-300)] mb-1">{title}</h3>
      <p className="text-[24px] font-bold text-[var(--black-500)]">{value}</p>
    </div>
  );
}

// Helper functions
function generateTimeSeriesData() {
  const hours = 24;
  const data = [];
  const now = new Date();

  for (let i = hours - 1; i >= 0; i--) {
    const time = new Date(now - i * 60 * 60 * 1000);
    data.push({
      time: `${time.getHours()}:00`,
      avg: Math.floor(Math.random() * 50) + 100,
      p95: Math.floor(Math.random() * 100) + 150,
    });
  }

  return data;
}

function formatTopPaths(data) {
  if (!data) return [];
  return Object.entries(data)
    .map(([path, stats]) => ({
      path: path.length > 20 ? path.substring(0, 20) + '...' : path,
      count: stats.count || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function formatErrorDistribution(data) {
  if (!data) return [];
  return Object.entries(data)
    .filter(([status]) => parseInt(status) >= 400)
    .map(([status, stats]) => ({
      name: `${status}`,
      value: stats.count || 0
    }));
}

function formatGeoDistribution(data) {
  if (!data) return [];
  const total = Object.values(data).reduce((sum, stats) => sum + (stats.count || 0), 0);
  return Object.entries(data)
    .map(([country, stats]) => ({
      country: country || 'Unknown',
      count: stats.count || 0,
      percentage: Math.round(((stats.count || 0) / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}