import React, { useState } from "react";
import {PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, } from "recharts";
import Sidebar from "./HomePageFunctions/ShopingListsFun";
import ShoppingLists from "./HomePageFunctions/ShopingListsFun";

export default function HomePage() {
    const chartData = [
        { name: "Food", value: 300 },
        { name: "Transport", value: 150 },
        { name: "Entertainment", value: 100 },
        { name: "Bills", value: 200 },
    ];

    const historyData = [
        { month: "Jan", spent: 200 },
        { month: "Feb", spent: 180 },
        { month: "Mar", spent: 240 },
        { month: "Apr", spent: 220 },
        { month: "May", spent: 300 },
        { month: "Jun", spent: 280 },
    ];

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

    const prediction = {
        spent_so_far_this_month: 220.0,
        predicted_total_this_month: 420.5,
        predicted_total_next_month: 460.8,
    };

    return (
        <div style={styles.container}>
            <header style={styles.topBar}>
                <h1 style={styles.logo}>Scanalyze</h1>
            </header>

            <div style={styles.main}>
                <nav style={styles.sidebar}>
                    <ShoppingLists/>
                </nav>

                <div style={styles.contentGrid}>
                    <div style={styles.leftColumn}>
                        <div style={styles.chartCard}>
                            <h2 style={{ marginBottom: 20, color: "black" }}>
                                Expenses This Month
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
                                    label
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
                                        <span>{entry.name}</span>
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
            <p
                style={{
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    color: "black",
                    marginTop: "1rem",
                }}
            >
                {value}
            </p>
        </div>
    );
}

function Dropdown({ title, items }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (item) => {
        setSelected(item);
        setIsOpen(false);
    };

    return (
        <div style={styles.spinnerContainer}>
            <div
                style={{
                    ...styles.spinner,
                    borderBottomLeftRadius: isOpen ? 0 : "8px",
                    borderBottomRightRadius: isOpen ? 0 : "8px",
                }}
                onClick={toggleDropdown}
            >
                <span>{selected || title}</span>
                <span style={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {isOpen && (
                <div style={styles.spinnerDropdown}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            style={styles.spinnerItem}
                            onClick={() => handleSelect(item)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )}
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
};
