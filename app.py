import streamlit as st
from crew_module import run_crew

st.set_page_config(page_title="Equipment Recommender Agent 🌾", layout="centered")
st.title("🌿 Smart Equipment Recommender (Multi-Agent AI)")

with st.form("input_form"):
    crop = st.selectbox("Select Crop", ["Wheat", "Rice", "Sugarcane", "Maize", "Cotton", "Millet", "Pulses"])
    soil = st.selectbox("Select Soil Type", ["Loamy", "Clayey", "Sandy", "Alluvial", "Black"])
    season = st.selectbox("Select Season", ["Rabi", "Kharif"])
    region = st.selectbox("Select Region", ["Punjab", "Tamil Nadu", "Maharashtra", "Uttar Pradesh", "Gujarat", "Rajasthan", "Andhra Pradesh", "Madhya Pradesh", "Karnataka"])

    submitted = st.form_submit_button("Recommend Equipment")

if submitted:
    with st.spinner("🤖 Agents analyzing and collaborating..."):
        result = run_crew(crop, soil, season, region)
    st.success("✅ Recommendation Ready!")
    st.markdown("### 📋 Recommended Equipment:")
    st.markdown(result)
