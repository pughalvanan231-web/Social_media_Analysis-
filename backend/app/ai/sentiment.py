import torch
from transformers import pipeline
from sqlalchemy.orm import Session
from app.models.social import SocialPost, PostAnalysis

print("Loading local Hugging Face sentiment model...")
# We use a robust model optimized for social media text that supports POS/NEU/NEG
sentiment_pipeline = pipeline(
    "sentiment-analysis", 
    model="cardiffnlp/twitter-roberta-base-sentiment-latest", 
    device=0 if torch.cuda.is_available() else -1
)
print("Model loaded successfully.")

def normalize_label(label: str) -> str:
    """Normalize the raw model output into standard positive/neutral/negative."""
    label = label.lower()
    if "positive" in label or label == "label_2":
        return "positive"
    elif "neutral" in label or label == "label_1":
        return "neutral"
    elif "negative" in label or label == "label_0":
        return "negative"
    return "neutral"

def analyze_posts_batch(db: Session, batch_size: int = 50):
    """
    Analyzes a batch of posts that haven't been analyzed yet.
    Intended to run as a background task.
    """
    try:
        # Find posts that do not have an analysis record
        posts_to_analyze = db.query(SocialPost).outerjoin(PostAnalysis).filter(PostAnalysis.id == None).limit(batch_size).all()
        
        if not posts_to_analyze:
            print("No new posts to analyze.")
            return

        print(f"Starting sentiment analysis on {len(posts_to_analyze)} posts...")
        
        for post in posts_to_analyze:
            if not post.text:
                continue
                
            # Truncate text to avoid model length errors (e.g. max 512 tokens)
            text_to_analyze = post.text[:1500] 
            
            try:
                result = sentiment_pipeline(text_to_analyze)[0]
                raw_label = result['label']
                confidence = result['score']
                
                sentiment = normalize_label(raw_label)
                
                # Convert confidence to a "score" where positive = high, negative = low
                # e.g., if negative and confidence 0.9, score is 0.1
                # if positive and confidence 0.9, score is 0.9
                # if neutral, score is around 0.5
                if sentiment == "positive":
                    score = 0.5 + (confidence / 2)
                elif sentiment == "negative":
                    score = 0.5 - (confidence / 2)
                else:
                    score = 0.5

                analysis = PostAnalysis(
                    post_id=post.id,
                    sentiment=sentiment,
                    sentiment_score=round(score, 2),
                    confidence=round(confidence, 2)
                )
                
                db.add(analysis)
            except Exception as item_e:
                print(f"Failed to analyze post {post.id}: {item_e}")

        db.commit()
        print("Batch sentiment analysis complete.")
    except Exception as e:
        print(f"Error in batch sentiment analysis: {e}")
        db.rollback()
    finally:
        db.close()
