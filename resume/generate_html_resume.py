import json
import sys

def generate_html(json_file, output_html):
    with open(json_file, 'r') as f:
        data = json.load(f)

    # Helper for project mapping
    projects = data.get('projects', [])
    project_html = ""
    for proj in projects:
        title = proj.get('title', '')
        bullets = proj.get('bullets', [])
        single_line_desc = " | ".join(bullets)
        
        project_html += f"""
        <div class="project-item">
            <div class="project-header">Project: {title}</div>
            <div class="project-desc"><strong>Key Achievement:</strong> {single_line_desc}</div>
        </div>
        """

    # Helper for experience
    experience = data.get('experience', [])
    exp_html = ""
    for exp in experience:
        title = exp.get('title', '')
        company = exp.get('company', '')
        date = exp.get('date', '')
        location = exp.get('location', 'Remote')
        formatted_date = date.replace("Present", '<span style="color: red;">Present</span>')
        
        exp_html += f"""
        <div class="exp-table">
            <div class="exp-row">
                <div class="exp-col-left"><strong>{title} | {company}</strong></div>
                <div class="exp-col-right">{location} | {formatted_date}</div>
            </div>
        </div>
        """
        
        groups = exp.get('groups', [])
        for group in groups:
            subheading = group.get('subheading', '')
            exp_html += f'<div class="exp-subheading">{subheading}:</div><ul>'
            for bullet in group.get('bullets', []):
                exp_html += f"<li>{bullet}</li>"
            exp_html += "</ul>"

    # Helper for education
    education = data.get('education', [])
    edu_html = ""
    for edu in education:
        edu_html += f"""
        <div class="edu-item">
            {edu.get('degree', '')} | {edu.get('institution', '')} | {edu.get('date', '')} |
        </div>
        """

    # Helper for tools
    tech_skills = data.get('technical_skills', {})
    tools_html = ""
    for category, skills in tech_skills.items():
        if category != 'ats_keywords':
            formatted_cat = category.replace('_', ' ').title()
            tools_html += f"<div><strong>{formatted_cat}:</strong> {', '.join(skills)}</div>"

    ats_keywords = ", ".join(data.get('key_skills', []))

    name = data.get('personal_info', {}).get('name', '')
    designation = "DevOps Engineer"
    if experience:
        designation = experience[0].get('title', 'DevOps Engineer')

    # Contact info
    phone = data['personal_info'].get('phone', '')
    email = data['personal_info'].get('email', '')
    location = data['personal_info'].get('location', '')
    
    links = data['personal_info'].get('links', {})
    
    linkedin_obj = links.get('Linkedin', {})
    linkedin_html = ""
    if isinstance(linkedin_obj, dict):
        linkedin_html = f"<a href='{linkedin_obj.get('link', '')}'>{linkedin_obj.get('name', 'Linkedin')}</a>"
    else:
        linkedin_html = f"<a href='{linkedin_obj}'>Linkedin</a>"

    github_obj = links.get('GitHub', {})
    github_html = ""
    if isinstance(github_obj, dict):
        github_html = f"<a href='{github_obj.get('link', '')}'>{github_obj.get('name', 'GitHub')}</a>"
    elif github_obj:
        github_html = f"<a href='{github_obj}'>GitHub</a>"
    
    if github_html:
        linkedin_html += f" | {github_html}"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{name} - Resume</title>
        <style>
            @page {{
                size: A4;
                margin: 0;
            }}
            * {{
                box-sizing: border-box;
            }}
            body {{
                font-family: 'Calibri', Arial, sans-serif;
                margin: 0;
                padding: 20px 30px;
                width: 100vw;
                height: 100vh;
                display: block;
                font-size: 11px;
                color: #000;
                line-height: 1.4;
            }}
            h1, h2, h3 {{
                margin: 0;
                padding: 0;
            }}
            a {{
                color: #0056b3;
                text-decoration: none;
            }}
            .header {{
                text-align: center;
                margin-bottom: 10px;
            }}
            .header h1 {{
                font-size: 19px;
                text-transform: uppercase;
                margin-bottom: 4px;
            }}
            .contact-info {{
                text-align: center;
                font-size: 10.5px;
                margin-bottom: 10px;
            }}
            .section {{
                margin-bottom: 8px;
            }}
            .section-title {{
                font-weight: bold;
                font-size: 13px;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                margin-bottom: 8px;
                padding-bottom: 3px;
                color: #0056b3; /* Match the blue header from screenshot */
            }}
            .outline-content {{
                text-align: justify;
                margin-bottom: 5px;
            }}
            .skills-content {{
                margin-bottom: 5px;
            }}
            .exp-table {{
                background-color: #e9eff5;
                padding: 5px 8px;
                margin-bottom: 4px;
            }}
            .exp-row {{
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
            }}
            .exp-col-left {{
                font-weight: normal;
            }}
            .exp-col-right {{
                text-align: right;
            }}
            .exp-subheading {{
                font-weight: bold;
                margin-top: 4px;
                margin-bottom: 2px;
            }}
            .section ul {{
                margin: 0 0 4px 0;
                padding-left: 22px;
            }}
            .section li {{
                margin-bottom: 2px;
            }}
            .project-header {{
                font-weight: bold;
                margin-top: 4px;
                margin-bottom: 2px;
            }}
            .single-line {{
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
            }}
            .project-item {{
                margin-bottom: 4px;
            }}
            .edu-item {{
                margin-top: 6px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{name} – {designation}</h1>
            <div class="contact-info">
                &#9742;: {phone} | &#128231;: {email} | {location} | {linkedin_html}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Outline</div>
            <div class="outline-content">{data.get('professional_summary', '')}</div>
        </div>

        <div class="section">
            <div class="section-title">KEY SKILLS</div>
            <div class="skills-content">{ats_keywords}</div>
        </div>

        <div class="section">
            <div class="section-title">TOOLS & TECHNOLOGIES</div>
            <div class="skills-content">
                {tools_html}
            </div>
        </div>

        <div class="section">
            <div class="section-title">PROFESSIONAL EXPERIENCE</div>
            {exp_html}
        </div>

        <div class="section">
            <div class="section-title">KEY PROJECTS EXECUTED</div>
            {project_html}
        </div>

        <div class="section">
            <div class="section-title">EDUCATION</div>
            {edu_html}
        </div>
    </body>
    </html>
    """

    with open(output_html, 'w') as f:
        f.write(html_content)
    print(f"Resume HTML generated at: {output_html}")

if __name__ == "__main__":
    import sys
    json_path = 'resume.json'
    if len(sys.argv) > 1:
        json_path = sys.argv[1]
    generate_html(json_path, 'resume_output.html')
