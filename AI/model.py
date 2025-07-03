import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

df = pd.read_csv("data1.csv", parse_dates=["date"])

df.dropna(subset=["price", "floor", "rooms", "area", "usd_rub", "brent"], inplace=True)

df["year"] = df["date"].dt.year


df = df.sort_values("date")
df["prev_price"] = df.groupby(["floor", "rooms", "area"])["price"].shift(1)


df = df.dropna(subset=["prev_price"])


df_train = df[df["year"] < 2024]


features = ["prev_price", "floor", "rooms", "area", "usd_rub", "brent", "year"]
target = "price"

X = df_train[features]
y = df_train[target]



scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)


X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)


model = Sequential([
    Dense(16, activation="relu", input_shape=(X_train.shape[1],)),
    Dense(32, activation="relu"),
    Dense(1)
])
model.compile(optimizer="adam", loss="mean_squared_error")


model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.1, verbose=1)



y_pred = model.predict(X_test).flatten()


mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"MAE (средняя абсолютная ошибка): {mae:.2f} руб")
print(f"R² (коэффициент детерминации): {r2:.4f}")

model.save("real_estate_predictor.h5")

joblib.dump(scaler, "scaler.pkl")

print("Модель и scaler сохранены.")

