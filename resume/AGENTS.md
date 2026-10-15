# Resume Generation Rules

These rules must be strictly followed whenever generating a new PDF resume:

1. **Never modify `resume.json`:** The `resume.json` file is the master copy and will only be updated by the user. Do not touch it. When tailoring a resume for a specific job description, always create a copy (e.g., `tailored_resume.json`) and make modifications to the copy.
2. **Strictly one page (Natural Fill):** The generated PDF must be exactly one page long. It must fill exactly 100% of the single page without huge gaps or spilling over to a second page. **Crucially, do not use artificial CSS spacing (like `justify-content: space-between`) to force this.** Instead, rewrite, expand, and tailor the actual text content in the JSON so that it naturally and robustly fills the page edge-to-edge. You must verify the page count and layout after the PDF is generated.
3. **Strict formatting:** The final output must strictly follow the provided structure, order, and styling of the `sample-resume-template-ats.docx` template every time.
4. **Project descriptions:** Project achievements can span 1 or 2 lines as needed. Never invent or add new projects; only use the exact projects that exist in the master `resume.json`.
5. **Distinct Skills and Tools:** The 'KEY SKILLS' section must contain conceptual competencies and skills (e.g., CI/CD, Infrastructure as Code, DevSecOps), rather than simply repeating the tools and technologies (which belong strictly in the 'TOOLS & TECHNOLOGIES' section).
