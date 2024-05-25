import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('V2EMo2.joblib')

# Define the expected feature order
feature_order = ['HighBP', 'HighChol', 'Smoker', 'Stroke', 'Diabetes', 'Sex']

# Define a mapping for encoding categorical values to numerical values
encoding = {
    'Sex': {'Male': 1, 'Female': 0},
    'HighBP': {'High': 1, 'Low': 0},
    'HighChol': {'High': 1, 'Low': 0},
    'Stroke': {'Yes': 1, 'No': 0},
    'Diabetes': {'Yes': 1, 'No': 0},
    'Smoker': {'Yes': 1, 'No': 0}
}

# Define a mapping for the prediction result
prediction_mapping = {1: "susceptible", 0: "not susceptible"}

@app.route('/')
def home():
    return "Welcome to the IHD Prediction API"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)  # Log the received data
        
        # Ensure the features are in the correct order
        df = pd.DataFrame([data])
        print("DataFrame before reordering:\n", df)
        
        df = df[feature_order]
        print("DataFrame after reordering:\n", df)
        
        # Encode the categorical values
        for column in df.columns:
            if column in encoding:
                df[column] = df[column].map(encoding[column])
        
        print("DataFrame after encoding:\n", df)
        print("Data types of the DataFrame:\n", df.dtypes)
        
        # Make prediction
        prediction = model.predict(df)[0]
        print("Prediction result (numeric):", prediction)
        
        # Map the prediction result to the corresponding string value
        prediction_str = prediction_mapping[prediction]
        print("Prediction result (string):", prediction_str)
        
        return jsonify({'prediction': prediction_str})
    except Exception as e:
        print("Error:", str(e))  # Log the error
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
