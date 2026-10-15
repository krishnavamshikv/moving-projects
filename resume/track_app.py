import json
import os
import random
import string
from datetime import datetime

hex_code = ''.join(random.choices(string.hexdigits.lower(), k=6))
pdf_name = f"krishnavamshi_DevOps_resume_{hex_code}.pdf"
pdf_path = os.path.join("applied", pdf_name)

os.makedirs("applied", exist_ok=True)
os.rename("Krishna_Vamshi_DevOps_resume_Generated.pdf", pdf_path)

job_link = "https://www.linkedin.com/jobs/view/4456881436/"
timestamp = datetime.now().isoformat()

app_data = {
    "status": "applied",
    "pdf_location": pdf_path,
    "job_link": job_link,
    "timestamp": timestamp
}

applied_file = "applied.json"
if os.path.exists(applied_file):
    try:
        with open(applied_file, "r") as f:
            data = json.load(f)
    except Exception:
        data = []
else:
    data = []

data.append(app_data)

with open(applied_file, "w") as f:
    json.dump(data, f, indent=2)

print(f"Tracking completed. File saved at {pdf_path}")
