import random
from sqlalchemy.orm import Session
from app.models.social import SocialPost, Topic
import json

try:
    from bertopic import BERTopic
    BERTOPIC_AVAILABLE = True
except ImportError:
    BERTOPIC_AVAILABLE = False
    
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans

def discover_topics(db: Session, sample_size: int = 1000):
    """
    Runs topic modeling on recent un-clustered posts, or re-clusters everything.
    For this MVP, we will cluster recent posts and assign them to Topics in the DB.
    """
    print("Fetching posts for topic discovery...")
    posts = db.query(SocialPost).filter(SocialPost.text != None).limit(sample_size).all()
    
    if len(posts) < 10:
        print("Not enough posts for meaningful topic discovery.")
        return

    texts = [p.text for p in posts]
    
    if BERTOPIC_AVAILABLE:
        print("Running BERTopic...")
        try:
            topic_model = BERTopic(language="english", calculate_probabilities=False)
            topics, _ = topic_model.fit_transform(texts)
            
            # Map BERTopic outputs
            topic_info = topic_model.get_topic_info()
            for idx, row in topic_info.iterrows():
                topic_id = row['Topic']
                if topic_id == -1: # Outliers
                    continue
                    
                keywords_with_scores = topic_model.get_topic(topic_id)
                keywords = [kw[0] for kw in keywords_with_scores[:5]]
                name = keywords[0].upper() if keywords else f"TOPIC_{topic_id}"
                
                # Assign to DB
                _save_topic(db, name, keywords, topic_id, topics, posts)
                
            return
        except Exception as e:
            print(f"BERTopic failed: {e}. Falling back to scikit-learn.")
    
    # Fallback to Scikit-Learn
    print("Running scikit-learn TF-IDF KMeans...")
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    X = vectorizer.fit_transform(texts)
    
    n_clusters = min(10, len(texts) // 10)
    if n_clusters < 2: n_clusters = 2
    
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(X)
    
    order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
    terms = vectorizer.get_feature_names_out()
    
    for i in range(n_clusters):
        top_indices = order_centroids[i, :5]
        keywords = [terms[ind] for ind in top_indices]
        if not keywords:
            continue
            
        name = keywords[0].upper()
        _save_topic(db, name, keywords, i, labels, posts)

def _save_topic(db, name, keywords, cluster_id, labels, posts):
    # Find existing topic or create new
    # For simplicity, we just create or overwrite
    topic = db.query(Topic).filter(Topic.name == name).first()
    if not topic:
        topic = Topic(name=name, keywords=keywords, volume=0)
        db.add(topic)
        db.flush()
        
    topic.keywords = keywords
    
    # Map posts
    post_count = 0
    for i, label in enumerate(labels):
        if label == cluster_id:
            post = posts[i]
            if topic not in post.topics:
                post.topics.append(topic)
            post_count += 1
            
    topic.volume = len(topic.posts)
    db.commit()
