import { Link } from "react-router-dom";

export default function StartPage() {
    return (
        <div style={styles.wrapper}>
            <h1 style={styles.title}>Witaj w aplikacji finansowej!</h1>
            <p style={styles.subtitle}>
                Zarządzaj swoimi wydatkami z łatwością i przejrzystością.
            </p>

            <div style={styles.featuresContainer}>
                <FeatureBox
                    title="📋 Lista zakupów"
                    desc="Twórz, edytuj i zarządzaj listami zakupów."
                />
                <FeatureBox
                    title="🧾 Wczytywanie paragonów"
                    desc="Skanuj paragony i śledź wydatki automatycznie."
                />
                <FeatureBox
                    title="📈 Predykcja wydatków"
                    desc="Zobacz przewidywane koszty na podstawie historii."
                />
                <FeatureBox
                    title="📊 Analiza wydatków"
                    desc="Oglądaj wykresy i dowiedz się, na co wydajesz najwięcej."
                />
            </div>

            <p style={styles.loginPrompt}>
                <Link to="/login_register" style={styles.loginLink}>
                    Zaloguj się
                </Link>
                , aby zacząć korzystać!
            </p>
        </div>
    );
}

function FeatureBox({ title, desc }) {
    return (
        <div style={styles.featureBox}>
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    );
}

const styles = {
    wrapper: {
        width: "100vw",
        height: "100vh",
        padding: "2rem",
        background: "linear-gradient(to bottom, #ffffff, #e0f2ff)",
        color: "#003366",
        fontFamily: "Segoe UI, sans-serif",
        textAlign: "center",
        boxSizing: "border-box",
    },
    title: {
        fontSize: "2.5rem",
        marginBottom: "1rem",
        color: "#005fa3",
    },
    subtitle: {
        fontSize: "1.25rem",
        marginBottom: "2rem",
    },
    featuresContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
    },
    featureBox: {
        backgroundColor: "#ffffff",
        border: "2px solid #0077cc",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 0 10px rgba(0, 119, 204, 0.2)",
    },
    loginPrompt: {
        fontSize: "1.1rem",
        color: "#0077cc",
    },
    loginLink: {
        textDecoration: "none",
        color: "#005fa3",
        fontWeight: "bold",
    },
    loginLinkHover: {
        textDecoration: "underline",
    },
};
