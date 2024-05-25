import joblib

# Load the trained model
model = joblib.load('V2EMo2.joblib')

# Assuming the model is a pipeline, get the names of the features
# This is often the case when using a ColumnTransformer in a pipeline
if hasattr(model, 'feature_names_in_'):
    feature_names = model.feature_names_in_
    print("Feature names in the model:", feature_names)
else:
    print("Could not retrieve feature names directly from the model.")
