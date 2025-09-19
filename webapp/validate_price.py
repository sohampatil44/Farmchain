import sys
import json
import joblib
import os

# -------------------------------
# Include the PriceValidator class
# -------------------------------
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
import numpy as np
import pandas as pd

class PriceValidator:
    def __init__(self):
        self.encoder = None
        self.scaler = None
        self.model = None
        self.valid_ranges = None
        self.equipment_col = None

    def fit(self, df, equipment_col="equipment_name", price_col="rental_price_per_day"):
        self.equipment_col = equipment_col

        # Encode equipment
        self.encoder = LabelEncoder()
        df["equipment_encoded"] = self.encoder.fit_transform(df[equipment_col])

        # Compute valid ranges
        self.valid_ranges = df.groupby(equipment_col)[price_col].agg(["min", "max"]).to_dict("index")

        # Train Isolation Forest
        X = df[["equipment_encoded", price_col]].values
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.model.fit(X_scaled)

    def validate(self, equipment_name, price):
        # Check equipment exists
        if equipment_name not in self.encoder.classes_:
            return False, f"❌ Unknown equipment: {equipment_name}"

        equipment_encoded = self.encoder.transform([equipment_name])[0]

        # Range check
        min_price = self.valid_ranges[equipment_name]["min"]
        max_price = self.valid_ranges[equipment_name]["max"]
        if price < min_price or price > max_price:
            return False, f"⚠️ Price {price} out of valid range [{min_price}, {max_price}]"

        # ML anomaly check
        X_new = np.array([[equipment_encoded, price]])
        X_new_scaled = self.scaler.transform(X_new)
        pred = self.model.predict(X_new_scaled)

        if pred[0] == -1:
            return False, "⚠️ Price looks ANOMALOUS (possible fraud / extreme outlier)"

        return True, "✅ Price is valid"

# -------------------------------
# Main script for Node.js
# -------------------------------
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, "price_validator.pkl")

    # Load the hybrid price validator
    validator = joblib.load(MODEL_PATH)

    # Read arguments from Node.js
    equipment = sys.argv[1]
    price = float(sys.argv[2])

    # Validate price
    valid, message = validator.validate(equipment, price)

    # Always print valid JSON
    print(json.dumps({"valid": valid, "message": message}))

except Exception as e:
    # Return valid JSON with error message
    print(json.dumps({"valid": False, "message": f"Error: {str(e)}"}))
