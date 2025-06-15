import numpy as np
from sklearn.linear_model import LinearRegression

def estimateExpenses(MonthSpent):
    # X to kolejne miesiące: 1, 2, ..., n
    X = np.arange(1, len(MonthSpent) + 1).reshape(-1, 1)
    y = np.array(MonthSpent)

    # Regresja liniowa
    model = LinearRegression()
    model.fit(X, y)

    # Przewidywanie dla następnego miesiąca
    next_month = np.array([[len(MonthSpent) + 1]])
    prediction = model.predict(next_month)[0].astype(int)

    return int(prediction)  # zaokrąglona do liczby całkowitej
