from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from flask_cors import CORS

# Load the model
model = joblib.load(r'C:\Users\Calisnao\Desktop\IHD\backend\models\V2EMo2.joblib')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/predict', methods=['POST'])
def predict_heart_disease():
    data = request.get_json()

    # Ensure all necessary keys are present in the input data
    expected_keys = ['HighBP', 'HighChol', 'Smoker', 'Stroke', 'Diabetes', 'Sex']
    if not all(key in data for key in expected_keys):
        return jsonify({'error': 'Missing data'}), 400

    # Create a DataFrame from the input data
    data_input = {key: [data[key]] for key in expected_keys}
    input_df = pd.DataFrame(data_input)

    # Ensure correct data types
    input_df = input_df.astype(dtype={'HighBP': int, 'HighChol': int, 'Smoker': int, 'Stroke': int, 'Diabetes': int, 'Sex': int})

    # Make predictions using the loaded model
    prediction = model.predict(input_df)

    # Prepare the response
    if prediction[0] == 1:
        prediction_text = "Based on the provided information, the model predicts that there is a chance of Ischemic Heart Disease."
    else:
        prediction_text = "Based on the provided information, the model predicts that there is no chance of Ischemic Heart Disease."

    return jsonify({'prediction': prediction_text})

if __name__ == '__main__':
    app.run(debug=True)
