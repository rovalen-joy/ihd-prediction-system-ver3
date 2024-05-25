import joblib

# Loading the trained model
model = joblib.load('V2EMo2.joblib')

#Checking the feature names 
if hasattr(model, 'feature_names_in_'):
    feature_names = model.feature_names_in_
    print("Feature names in the model:", feature_names)
else:
    print("Could not retrieve feature names directly from the model.")
