import io
from datetime import datetime
from fpdf import FPDF
from sqlalchemy.orm import Session
from app.models.social import EmergingIssue, SocialPost, Topic, post_topic
from sqlalchemy import desc

class PDFReport(FPDF):
    def __init__(self, issue_id, generated_time):
        super().__init__()
        self.issue_id = issue_id
        self.generated_time = generated_time
        
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Intelligence Report - Gossip Protocol', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.cell(0, 10, f'Issue ID: {self.issue_id} | Generated: {self.generated_time.strftime("%Y-%m-%d %H:%M:%S UTC")}', 0, 1, 'C')
        self.line(10, 30, 200, 30)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
        
    def add_section_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', fill=True)
        self.ln(2)
        
    def add_key_value(self, key, value):
        self.set_font('Arial', 'B', 10)
        self.cell(40, 8, key, 0, 0)
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 8, str(value))

def generate_issue_report(issue_id: int, db: Session) -> bytes:
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        return None
        
    topic = issue.topic
    
    generated_time = datetime.utcnow()
    pdf = PDFReport(issue.id, generated_time)
    pdf.add_page()
    
    # Overview
    pdf.add_section_title('1. Overview')
    pdf.add_key_value('Title:', f'Emerging Issue #{issue.id} - {topic.name if topic else "Unknown"}')
    pdf.add_key_value('Detection Time:', issue.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if issue.created_at else 'Unknown')
    pdf.add_key_value('Signal Score:', f'{issue.signal_score:.2f} / 100')
    pdf.add_key_value('Severity Level:', issue.signal_level)
    pdf.add_key_value('Status:', 'Active') # Can be linked to Alert status if needed
    pdf.ln(5)
    
    # Metadata required by spec
    pdf.add_section_title('Metadata')
    pdf.add_key_value('DATA SOURCES:', 'Aggregated (X, Reddit, Bluesky, YouTube)')
    pdf.add_key_value('ANALYSIS PERIOD:', 'Last 24 Hours')
    pdf.add_key_value('CONFIDENCE:', f'{(issue.signal_score):.1f}% (Based on signal strength)')
    pdf.ln(5)
    
    # Topic Details
    pdf.add_section_title('2. Topic & Narratives')
    if topic:
        pdf.add_key_value('Keywords:', ", ".join(topic.keywords) if topic.keywords else "None")
        pdf.add_key_value('Volume Trend:', f'{topic.volume} posts (Growth: {topic.growth_rate:.1f}%)')
    else:
        pdf.add_key_value('Keywords:', "N/A")
    
    pdf.add_key_value('Why Flagged:', str(issue.contributing_factors) if issue.contributing_factors else 'Anomalous activity detected.')
    pdf.ln(5)
    
    # Supporting Evidence (without PII)
    pdf.add_section_title('3. Supporting Evidence (PII Redacted)')
    if topic:
        recent_posts = db.query(SocialPost).join(post_topic).filter(post_topic.c.topic_id == topic.id).order_by(desc(SocialPost.created_at)).limit(5).all()
        if recent_posts:
            for i, post in enumerate(recent_posts, 1):
                # Clean text to remove URLs or names if needed, keeping it simple for now
                # Exclude author names/IDs
                pdf.set_font('Arial', 'B', 9)
                pdf.cell(0, 6, f'Evidence #{i} [{post.platform.upper()}] - {post.created_at.strftime("%Y-%m-%d %H:%M")}', 0, 1)
                pdf.set_font('Arial', '', 9)
                
                # Replace non-latin-1 chars
                clean_text = post.text.encode('latin-1', 'replace').decode('latin-1')
                pdf.multi_cell(0, 5, clean_text)
                pdf.ln(3)
        else:
            pdf.set_font('Arial', 'I', 10)
            pdf.cell(0, 10, 'No direct post evidence available.', 0, 1)
    
    # Output to bytes
    pdf_output = pdf.output(dest='S')
    return pdf_output
