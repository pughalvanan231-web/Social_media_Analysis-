import io
from datetime import datetime
from fpdf import FPDF
from sqlalchemy.orm import Session
from app.models.social import EmergingIssue, IssueEvidence, SocialPost, IntelligenceSignal, Alert, AnalystNote
from sqlalchemy import desc

class PDFReport(FPDF):
    def __init__(self, issue_id, generated_time):
        super().__init__()
        self.issue_id = issue_id
        self.generated_time = generated_time
        
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'GOSSIP PROTOCOL - INTELLIGENCE REPORT', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.cell(0, 10, f'Issue ID: {self.issue_id} | Generated: {self.generated_time.strftime("%Y-%m-%d %H:%M:%S UTC")}', 0, 1, 'C')
        self.line(10, 30, 200, 30)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
        
    def add_section_title(self, title):
        self.ln(3)
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', fill=True)
        self.ln(2)
        
    def add_key_value(self, key, value):
        self.set_font('Arial', 'B', 10)
        self.cell(45, 6, key, 0, 0)
        self.set_font('Arial', '', 10)
        self.multi_cell(145, 6, str(value))
        
    def add_disclaimer(self, text, is_system=True):
        self.set_font('Arial', 'I', 8)
        self.set_text_color(100, 100, 100)
        prefix = "SYSTEM-GENERATED ANALYSIS:" if is_system else "OBSERVED DATA:"
        self.multi_cell(0, 5, f"{prefix} {text}")
        self.set_text_color(0, 0, 0)
        self.ln(2)

def generate_issue_report(issue_id: int, db: Session) -> bytes:
    issue = db.query(EmergingIssue).filter(EmergingIssue.id == issue_id).first()
    if not issue:
        return None
        
    generated_time = datetime.utcnow()
    pdf = PDFReport(issue.id, generated_time)
    pdf.add_page()
    
    # 1. Issue Overview
    pdf.add_section_title('1. Issue Overview')
    pdf.add_disclaimer("The following title and description are synthesized based on correlated data streams.", True)
    pdf.add_key_value('Title:', issue.title or "Unknown Emerging Issue")
    pdf.add_key_value('Description:', issue.description or "No description available.")
    pdf.ln(2)
    
    # 2. Detection Time
    pdf.add_section_title('2. Detection Time')
    pdf.add_disclaimer("Timestamps represent the exact UTC moment the pipeline flagged this cluster.", False)
    pdf.add_key_value('First Detected:', issue.first_detected_at.strftime("%Y-%m-%d %H:%M:%S UTC") if issue.first_detected_at else 'Unknown')
    pdf.add_key_value('Last Updated:', issue.last_updated_at.strftime("%Y-%m-%d %H:%M:%S UTC") if issue.last_updated_at else 'Unknown')
    pdf.ln(2)
    
    # 3. Current Signal Level
    pdf.add_section_title('3. Current Signal Level')
    pdf.add_disclaimer("Confidence and signal levels are calculated via anomaly thresholds. Not a guarantee of real-world impact.", True)
    pdf.add_key_value('Signal Status:', issue.status)
    pdf.add_key_value('Confidence:', f'{(issue.confidence or 0.0):.1f}/100')
    pdf.add_key_value('Anomaly Score:', f'{(issue.anomaly_score or 0.0):.1f}σ')
    pdf.ln(2)
    
    # Fetch alert for executive summary
    alert = db.query(Alert).filter(Alert.issue_id == issue.id).first()
    
    # 4. Executive Summary
    pdf.add_section_title('4. Executive Summary')
    pdf.add_disclaimer("Automated narrative explanation based on triggering metrics.", True)
    if alert and alert.explanation:
        clean_exp = alert.explanation.encode('latin-1', 'replace').decode('latin-1')
        pdf.set_font('Arial', '', 10)
        pdf.multi_cell(0, 6, clean_exp)
    else:
        pdf.set_font('Arial', 'I', 10)
        pdf.cell(0, 6, "No automated alert explanation available for this issue.", 0, 1)
        
    # 5. Key Indicators
    pdf.add_section_title('5. Key Indicators')
    pdf.add_disclaimer("Individual analytical triggers contributing to the overall detection.", True)
    signals = db.query(IntelligenceSignal).filter(IntelligenceSignal.issue_id == issue.id).all()
    if signals:
        for s in signals:
            pdf.set_font('Arial', 'B', 9)
            pdf.cell(5, 6, "-", 0, 0)
            pdf.set_font('Arial', '', 9)
            pdf.multi_cell(0, 6, f"{s.signal_type.replace('_', ' ').title()}: {s.explanation}")
    else:
        pdf.set_font('Arial', 'I', 10)
        pdf.cell(0, 6, "No specific signals recorded.", 0, 1)
        
    # 6. Trend Analysis
    pdf.add_section_title('6. Trend Analysis')
    pdf.add_disclaimer("Calculated from historical baseline comparisons.", True)
    pdf.add_key_value('Activity Change:', f"+{(issue.activity_change_percent or 0.0):.1f}%")
    
    # 7. Cross-Platform Analysis
    pdf.add_section_title('7. Cross-Platform Analysis')
    pdf.add_disclaimer("Platforms with confirmed correlated activity.", False)
    # Deduce platforms from evidence
    evidence = db.query(IssueEvidence).filter(IssueEvidence.issue_id == issue.id).all()
    platforms = list(set([e.post.platform.title() for e in evidence if e.post]))
    pdf.add_key_value('Platforms Detected:', ", ".join(platforms) if platforms else "Unknown")
    
    # 8. Sentiment Analysis
    pdf.add_section_title('8. Sentiment Analysis')
    pdf.add_disclaimer("NLP sentiment mapping of the correlated cluster.", True)
    pdf.add_key_value('Net Sentiment Score:', f"{(issue.sentiment_score or 0.0):.2f}")
    
    # 9. Emerging Topics
    pdf.add_section_title('9. Emerging Topics')
    pdf.add_disclaimer("Primary keywords driving the cluster.", True)
    # Best effort: get topics from alert metrics or evidence
    keywords = []
    if alert and alert.supporting_metrics and "related_keywords" in alert.supporting_metrics:
        keywords = alert.supporting_metrics["related_keywords"]
    pdf.add_key_value('Keywords:', ", ".join(keywords) if keywords else "Data unavailable")
    
    # 10. Geographic Signals
    pdf.add_section_title('10. Geographic Signals')
    pdf.add_disclaimer("Approximate / Inferred Locations based on available metadata.", True)
    pdf.add_key_value('Affected Area:', issue.affected_area or "Location data unavailable")
    
    # 11. Supporting Evidence
    pdf.add_section_title('11. Supporting Evidence (Raw Posts)')
    pdf.add_disclaimer("Unaltered public posts collected from specified platforms.", False)
    if evidence:
        for i, ev in enumerate(evidence[:10], 1):
            if ev.post:
                pdf.set_font('Arial', 'B', 9)
                ts = ev.post.created_at.strftime("%Y-%m-%d %H:%M") if ev.post.created_at else "Unknown"
                pdf.cell(0, 6, f'Evidence #{i} [{ev.post.platform.upper()}] - {ts}', 0, 1)
                
                pdf.set_font('Arial', 'I', 8)
                pdf.cell(0, 4, f"Flagged reason: {ev.reason}", 0, 1)
                
                pdf.set_font('Arial', '', 9)
                clean_text = ev.post.text.encode('latin-1', 'replace').decode('latin-1')
                pdf.multi_cell(0, 5, clean_text)
                pdf.ln(3)
    else:
        pdf.set_font('Arial', 'I', 10)
        pdf.cell(0, 6, 'No direct post evidence available.', 0, 1)
        
    # 12. Analyst Notes
    pdf.add_section_title('12. Analyst Notes')
    pdf.add_disclaimer("Manual notes appended by human analysts.", False)
    notes = db.query(AnalystNote).filter(AnalystNote.issue_id == issue.id).order_by(desc(AnalystNote.created_at)).all()
    if notes:
        for note in notes:
            pdf.set_font('Arial', 'B', 9)
            ts = note.created_at.strftime("%Y-%m-%d %H:%M") if note.created_at else "Unknown"
            pdf.cell(0, 6, f'[{ts}] {note.analyst_id}:', 0, 1)
            pdf.set_font('Arial', '', 9)
            clean_text = note.note_text.encode('latin-1', 'replace').decode('latin-1')
            pdf.multi_cell(0, 5, clean_text)
            pdf.ln(3)
    else:
        pdf.set_font('Arial', 'I', 10)
        pdf.cell(0, 6, 'No manual analyst notes recorded.', 0, 1)
    
    # Output to bytes
    pdf_output = pdf.output(dest='S')
    return pdf_output
