import json
import csv
import uuid
from datetime import datetime

# Input and output file paths
input_file = "companies.json"
output_file = "companies.csv"

# Load the JSON data
with open(input_file, "r") as f:
    companies = json.load(f)

# Open CSV file for writing
with open(output_file, "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["id", "name", "description", "industry", "website", "createdAt", "updatedAt"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    # Write header row
    writer.writeheader()
    
    # Current timestamp for createdAt column
    current_timestamp = datetime.now().isoformat()
    
    # Write each company as a row with specified modifications
    for name, details in companies.items():
        # If industry is null or empty, set to "UNKNOWN"
        industry = details.get("industry")
        if not industry:
            industry = "UNKNOWN"

        desc = details.get('description')
        if not desc:
            desc = "Learn more at " + website
            
        # If website is null or empty, set to company name + ".com"
        website = details.get("website")
        if not website:
            website = name.lower() + ".com"
        
        writer.writerow({
            "id": str(uuid.uuid4()),
            "name": name,
            "description": desc,
            "industry": industry,
            "website": website,
            "createdAt": current_timestamp,
            "updatedAt": current_timestamp
        })

print(f"CSV file created at: {output_file}")
