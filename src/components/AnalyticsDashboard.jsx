import { useState, useEffect, useRef, useCallback } from 'react';
import {
    BarChart3, TrendingUp, Users, Globe, AlertCircle,
    Activity, Clock, Zap, Database, RefreshCw
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_WORKERS_API_URL ||
  'https://api.languagemate.kr';

export default function AnalyticsDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const wsRef = useRef(null);
    const refreshIntervalRef = useRef(null);

    // 대시보드 데이터 가져오기
    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/analytics/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            const data = await response.json();
            setDashboardData(data.data);
            setError(null);
        } catch (err) {
            console.error('Analytics error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 실시간 메트릭 업데이트
    const updateRealtimeMetrics = useCallback((metrics) => {
        setDashboardData(prev => ({
            ...prev,
            realtime: metrics
        }));
    }, []);

    // WebSocket 연결
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/api/v1/analytics/stream`);

        ws.onopen = () => {
            console.log('Analytics WebSocket connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'metrics_update') {
                    // 실시간 메트릭 업데이트
                    updateRealtimeMetrics(data.data);
                }
            } catch (err) {
                console.error('WebSocket message error:', err);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            // 5초 후 재연결
            if (autoRefresh) {
                setTimeout(() => connectWebSocket(), 5000);
            }
        };

        wsRef.current = ws;
    }, [autoRefresh, updateRealtimeMetrics]);

    // 초기 로드 및 자동 새로고침
    useEffect(() => {
        fetchDashboardData();

        if (autoRefresh) {
            refreshIntervalRef.current = setInterval(fetchDashboardData, 30000); // 30초마다
            connectWebSocket();
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [autoRefresh, connectWebSocket, fetchDashboardData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
            </div>
        );
    }

    const { overview, topPaths, geoDistribution, realtime } = dashboardData || {};

    // 차트 데이터 준비
    const requestTrendData = {
        labels: ['24h ago', '18h ago', '12h ago', '6h ago', 'Now'],
        datasets: [
            {
                label: 'Requests',
                data: [120, 145, 165, 180, 195],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const topPathsData = {
        labels: topPaths?.slice(0, 5).map(p => p.path) || [],
        datasets: [
            {
                label: 'Requests',
                data: topPaths?.slice(0, 5).map(p => p.count) || [],
                backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }
        ]
    };

    const errorDistribution = {
        labels: ['2xx', '3xx', '4xx', '5xx'],
        datasets: [
            {
                data: [75, 10, 12, 3],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ]
            }
        ]
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600">Monitor your API performance and usage</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="1h">Last hour</option>
                        <option value="24h">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                    </select>

                    {/* Auto Refresh Toggle */}
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${autoRefresh
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Auto' : 'Manual'}
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Requests"
                    value={overview?.last24h?.count || 0}
                    change="+12.5%"
                    icon={<BarChart3 className="w-5 h-5" />}
                    color="blue"
                />
                <MetricCard
                    title="Avg Response Time"
                    value={`${overview?.last24h?.avgDuration?.toFixed(0) || 0}ms`}
                    change="-8.3%"
                    icon={<Clock className="w-5 h-5" />}
                    color="green"
                />
                <MetricCard
                    title="Error Rate"
                    value={`${(overview?.last24h?.errorRate * 100)?.toFixed(1) || 0}%`}
                    change="+0.2%"
                    icon={<AlertCircle className="w-5 h-5" />}
                    color="red"
                />
                <MetricCard
                    title="Active Users"
                    value={realtime?.activeUsers || 0}
                    change="Live"
                    icon={<Users className="w-5 h-5" />}
                    color="purple"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Trend */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Request Trend</h3>
                    <Line data={requestTrendData} options={{
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }} />
                </div>

                {/* Top Paths */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Top Endpoints</h3>
                    <Bar data={topPathsData} options={{
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }} />
                </div>

                {/* Response Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Response Status</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={errorDistribution} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right'
                                }
                            }
                        }} />
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                        <PerformanceMetric
                            label="P50 Latency"
                            value={`${overview?.last24h?.p50Duration?.toFixed(0) || 0}ms`}
                            max={1000}
                        />
                        <PerformanceMetric
                            label="P95 Latency"
                            value={`${overview?.last24h?.p95Duration?.toFixed(0) || 0}ms`}
                            max={1000}
                        />
                        <PerformanceMetric
                            label="P99 Latency"
                            value={`${overview?.last24h?.p99Duration?.toFixed(0) || 0}ms`}
                            max={1000}
                        />
                        <PerformanceMetric
                            label="CPU Time"
                            value={`${overview?.last24h?.avgCpuTime?.toFixed(0) || 0}ms`}
                            max={500}
                        />
                    </div>
                </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Geographic Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {geoDistribution?.slice(0, 8).map((country, index) => (
                        <div key={index} className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {country.count}
                            </div>
                            <div className="text-sm text-gray-600">{country.country}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Real-time Activity */}
            {realtime && (
                <div className="bg-gray-900 text-white p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        Real-time Activity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="text-3xl font-bold text-green-400">
                                {realtime.requestsPerSecond || 0}
                            </div>
                            <div className="text-sm text-gray-400">Requests/sec</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-400">
                                {realtime.avgResponseTime || 0}ms
                            </div>
                            <div className="text-sm text-gray-400">Avg Response</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-400">
                                {realtime.activeConnections || 0}
                            </div>
                            <div className="text-sm text-gray-400">Active Connections</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 메트릭 카드 컴포넌트
function MetricCard({ title, value, change, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    const changeColor = change.startsWith('+') ? 'text-green-600' :
        change.startsWith('-') ? 'text-red-600' :
            'text-gray-600';

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className={`text-sm ${changeColor} mt-1`}>{change}</div>
        </div>
    );
}

// 성능 메트릭 컴포넌트
function PerformanceMetric({ label, value, max }) {
    const numValue = parseInt(value);
    const percentage = Math.min((numValue / max) * 100, 100);

    const color = percentage < 50 ? 'bg-green-500' :
        percentage < 80 ? 'bg-yellow-500' :
            'bg-red-500';

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
