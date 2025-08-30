from langchain_community.chat_models import ChatOllama
import json
from datetime import date

# This function is a simplified placeholder for a real z-score calculation.
def calculate_simple_zscore(value, median):
    if median == 0: return 0
    return (value - median) / (median * 0.15) # Simplified standard deviation

# The function now accepts the infant's date of birth
def get_ai_analysis(record_data: dict, infant_dob: date):
    try:
        # --- 1. Calculate Infant's Age in Months ---
        today = date.today()
        age_in_months = (today.year - infant_dob.year) * 12 + (today.month - infant_dob.month)
        # Ensure age is at least 0 for our formula
        age_in_months = max(0, age_in_months)

        # --- 2. DYNAMIC Median Calculation (Simplified Growth Model) ---
        # This is a simple linear model for demonstration. A real app would use WHO data tables.
        # Assumes a starting weight of 3.5kg and height of 50cm, with average monthly growth.
        weight_median = 3.5 + (age_in_months * 0.7) 
        height_median = 50.0 + (age_in_months * 2.0)
        
        weight_zscore = calculate_simple_zscore(record_data['weight_kg'], weight_median)
        height_zscore = calculate_simple_zscore(record_data['height_cm'], height_median)

        # --- 3. Create a Detailed Prompt for the LLM ---
        prompt = f"""
        Analyze the following infant health data based on the provided WHO standards.

        Infant Data:
        - Age: {age_in_months} months
        - Weight: {record_data['weight_kg']} kg (z-score vs. typical for age: {weight_zscore:.2f})
        - Height: {record_data['height_cm']} cm (z-score vs. typical for age: {height_zscore:.2f})

        WHO Standards:
        - Underweight: weight-for-age z-score below -2. Severe if below -3.
        - Stunting: height-for-age z-score below -2. Severe if below -3.
        - Normal Growth: z-scores between -2 and +2.

        Task:
        1. Determine the primary risk factor (e.g., Underweight, Stunting, Normal Growth).
        2. Determine the severity (e.g., Normal, Moderate, Severe).
        3. Provide a clear, actionable suggestion for an ASHA worker.
        
        Respond ONLY with a valid JSON object containing two keys: "risk_level" and "suggestion".
        Example: {{"risk_level": "High", "suggestion": "Infant shows signs of severe underweight. Immediate referral to a primary health center is critical."}}
        """
        
        # --- 4. Call the Local Ollama Model ---
        llm = ChatOllama(model="phi3", format="json")
        response = llm.invoke(prompt)
        return json.loads(response.content)

    except Exception as e:
        return {"risk_level": "Error", "suggestion": f"An error occurred with the local AI model: {str(e)}"}