import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Set your Google API key securely
os.environ["GOOGLE_API_KEY"] = "AIzaSyDtrfi5aYctFGhrp_WlB1LggX_frbVjni0"

# Initialize the Gemini LLM from LangChain
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.2
)

# Prompt template simulating the 4 expert agents
prompt_template = ChatPromptTemplate.from_template("""
You are an agricultural assistant composed of the following experts:
1. Crop Expert: Analyzes best crops for soil, season, and region.
2. Soil Advisor: Validates soil compatibility with crops.
3. Regional Analyst: Assesses environmental suitability.
4. Equipment Recommender: Suggests farming equipment with reasoning.

Given the following context:
- Crop: {crop}
- Soil Type: {soil}
- Season: {season}
- Region: {region}

Provide a detailed response simulating a discussion between the experts,
and conclude with 2–3 recommended agricultural equipment and why they're suitable.
""")

# Combine prompt -> model -> output
chain = prompt_template | llm | StrOutputParser()

# Function to call from your frontend or app
def run_crew(crop, soil, season, region):
    return chain.invoke({
        "crop": crop,
        "soil": soil,
        "season": season,
        "region": region
    })
