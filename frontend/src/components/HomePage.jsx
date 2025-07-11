import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import ShoppingLists from "./ShopingListsFunctions/ShopingListsFun";
import { AuthContext } from "../protection/AuthProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HomePage() {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useContext(AuthContext);

    const [chartData, setChartData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [prediction, setPrediction] = useState({
        spent_so_far_this_month: 0,
        predicted_total_this_month: 0,
        predicted_total_next_month: 0,
    });
    const householdId = null;
    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                const response = await fetch("http://127.0.0.1:5000/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ household_id: householdId || null }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                const historyArr = Object.entries(data.history).map(
                    ([month, spent]) => ({
                        month,
                        spent,
                    })
                );

                setHistoryData(historyArr);
                setPrediction({
                    spent_so_far_this_month: data.spent_so_far_this_month,
                    predicted_total_this_month: data.predicted_total_this_month,
                    predicted_total_next_month: data.predicted_total_next_month,
                });
            } catch (err) {
                toast.error("Prediction fetch error:" + err.message);
            }
        }
        fetchPrediction();
    }, [householdId]);

    useEffect(() => {
        async function fetchMonthlySummary() {
            try {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();

                const response = await fetch(
                    "http://127.0.0.1:5000/summary/monthly",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            month,
                            year,
                            household_id: householdId || null,
                        }),
                    }
                );
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                const pieData = data.map((cat) => ({
                    name: cat.category,
                    value: cat.total,
                }));

                setChartData(pieData);
            } catch (err) {
                toast.error("Monthly summary fetch error:" + err.message);
            }
        }
        fetchMonthlySummary();
    }, [householdId]);

    const handleLogout = () => {
        setIsAuthenticated(false);
        navigate("/");
    };

    return (
        <div style={styles.container}>
            <ToastContainer position="top-center" autoClose={3000} />
            <header
                style={{
                    ...styles.topBar,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1 style={styles.logo}>Scanalyze</h1>
                <div style={styles.navbar}>
                    <div
                        style={{ cursor: "pointer", width: 32, height: 32 }}
                        onClick={() => navigate("/purchaseEvent")}
                        title="Purchase events"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="32"
                            height="32"
                        >
                            <path d="M21 2H7a2 2 0 0 0-2 2v18l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V4a2 2 0 0 0-2-2z" />
                            <line x1="10" y1="7" x2="17" y2="7" />
                            <line x1="10" y1="11" x2="17" y2="11" />
                            <line x1="10" y1="15" x2="14" y2="15" />
                        </svg>
                    </div>

                    <div
                        style={{ cursor: "pointer", width: 32, height: 32 }}
                        onClick={() => navigate("/household")}
                        title="Household"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="32"
                            height="32"
                        >
                            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
                        </svg>
                    </div>

                    <div
                        style={{ cursor: "pointer", width: 32, height: 32 }}
                        onClick={() => navigate("/profile")}
                        title="Profil"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="32"
                            height="32"
                        >
                            <circle cx="12" cy="7" r="4" />
                            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                        </svg>
                    </div>

                    <div
                        style={{ cursor: "pointer", width: 32, height: 32 }}
                        onClick={handleLogout}
                        title="Log out"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="32"
                            height="32"
                        >
                            <path d="M16 17l5-5-5-5" />
                            <path d="M21 12H9" />
                            <path d="M9 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
                        </svg>
                    </div>
                </div>
            </header>

            <div style={styles.main}>
                <nav style={styles.sidebar}>
                    <ShoppingLists />
                </nav>

                <div style={styles.contentGrid}>
                    <div style={styles.leftColumn}>
                        <div style={styles.chartCard}>
                            <h2 style={{ marginBottom: 20, color: "black" }}>
                                Expenses This Month – {total.toFixed(2)} PLN
                            </h2>
                            <PieChart width={400} height={300}>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={() => null}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <div style={styles.legendContainer}>
                                {chartData.map((entry, index) => (
                                    <div key={index} style={styles.legendItem}>
                                        <div
                                            style={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor:
                                                    COLORS[
                                                        index % COLORS.length
                                                    ],
                                                marginRight: 8,
                                                borderRadius: 3,
                                            }}
                                        />
                                        <span>
                                            {entry.name} –{" "}
                                            {(
                                                (entry.value / total) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={styles.rightColumn}>
                        <div style={styles.chartCard}>
                            <h2 style={{ marginBottom: 20, color: "black" }}>
                                Spending History
                            </h2>
                            <div style={{ width: "100%", height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={historyData}
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            bottom: 5,
                                            left: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            stroke="#ccc"
                                            strokeDasharray="5 5"
                                        />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="spent"
                                            stroke="#8884d8"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div style={styles.predictionRow}>
                            <PredictionTile
                                title="📅 Predicted (this month)"
                                value={`$${prediction.predicted_total_this_month}`}
                            />
                            <PredictionTile
                                title="🔮 Predicted (next month)"
                                value={`$${prediction.predicted_total_next_month}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PredictionTile({ title, value }) {
    return (
        <div style={styles.predictionCard}>
            <h3 style={{ color: "black" }}>{title}</h3>
            <p style={styles.predictionValue}>{value}</p>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f0f2f5",
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
    },
    topBar: {
        backgroundColor: "#0077cc",
        color: "#fff",
        padding: "1rem 2rem",
    },
    logo: {
        margin: 0,
    },
    main: {
        display: "flex",
        backgroundColor: "#c8dcfa",
        flex: 1,
    },
    sidebar: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        padding: "1rem",
        minWidth: "200px",
        maxWidth: "200px",
        gap: "1rem",
        color: "black",
    },
    contentGrid: {
        display: "flex",
        gap: "20px",
        padding: "20px",
        width: "100%",
        boxSizing: "border-box",
    },
    leftColumn: {
        flexBasis: "40%",
        display: "flex",
        flexDirection: "column",
    },
    rightColumn: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
    },
    chartCard: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        marginBottom: "20px",
    },
    legendContainer: {
        display: "flex",
        flexDirection: "column",
        marginTop: 16,
        alignItems: "flex-start",
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        marginBottom: 6,
        color: "black",
    },
    predictionRow: {
        display: "flex",
        gap: "20px",
    },
    predictionCard: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "16px",
        flex: 1,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    },
    predictionValue: {
        fontSize: "1.6rem",
        fontWeight: "bold",
        color: "black",
        marginTop: "1rem",
    },
    navbar: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
};
