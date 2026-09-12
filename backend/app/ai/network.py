import networkx as nx
import community as community_louvain
import re
from sqlalchemy.orm import Session
from app.models.social import SocialPost, Topic, Author, post_topic
from sqlalchemy import text

def extract_mentions(text_content):
    """Extracts @mentions from text."""
    if not text_content:
        return []
    # Match standard @username format
    mentions = re.findall(r'@([a-zA-Z0-9_]+)', text_content)
    return [m.lower() for m in mentions]

def build_social_network(db: Session, topic_id: int = None, limit: int = 1000):
    """
    Builds a social network graph for a specific topic or globally.
    Extracts nodes (authors, mentioned users) and edges (mentions, shared topics).
    Returns a dictionary suitable for visualization (nodes, links) with computed metrics.
    """
    query = db.query(SocialPost).join(Author)
    
    if topic_id:
        query = query.join(post_topic).filter(post_topic.c.topic_id == topic_id)
        
    posts = query.limit(limit).all()
    
    G = nx.Graph()
    
    # Track usernames to standard case
    username_map = {}
    
    # 1. Build edges from Mentions
    for post in posts:
        author = post.author
        if not author or not author.username:
            continue
            
        author_username = author.username.lower()
        username_map[author_username] = author.username
        
        # Add author node
        if not G.has_node(author_username):
            G.add_node(author_username, label=author.username, type="author", weight=1)
        else:
            G.nodes[author_username]['weight'] += 1
            
        mentions = extract_mentions(post.text)
        for mention in mentions:
            if mention == author_username:
                continue
                
            username_map[mention] = mention # Best effort for casing
            
            if not G.has_node(mention):
                G.add_node(mention, label=mention, type="mentioned", weight=1)
            else:
                G.nodes[mention]['weight'] += 1
                
            # Add or update edge weight
            if G.has_edge(author_username, mention):
                G[author_username][mention]['weight'] += 1
            else:
                G.add_edge(author_username, mention, weight=1, type="mention")
                
    # If the graph is empty, return empty structure
    if len(G.nodes) == 0:
        return {"nodes": [], "links": []}

    # 2. Compute Network Metrics
    # Degree Centrality (normalized)
    centrality = nx.degree_centrality(G)
    
    # 3. Community Detection (Louvain)
    # python-louvain handles unconnected components fine
    partition = community_louvain.best_partition(G)
    
    # 4. Format output for visualization
    nodes = []
    links = []
    
    for node in G.nodes():
        node_data = G.nodes[node]
        c_score = centrality.get(node, 0)
        
        # Assign neutral labels based on centrality
        if c_score > 0.1:
            role = "high-connectivity account"
        elif c_score > 0.05:
            role = "community-central node"
        else:
            role = "standard node"
            
        nodes.append({
            "id": node,
            "label": node_data.get("label", node),
            "val": node_data.get("weight", 1) + (c_score * 100), # size based on weight and centrality
            "community": partition.get(node, 0),
            "centrality": c_score,
            "role": role
        })
        
    for source, target, data in G.edges(data=True):
        links.append({
            "source": source,
            "target": target,
            "weight": data.get("weight", 1),
            "type": data.get("type", "relation")
        })
        
    return {
        "nodes": nodes,
        "links": links
    }

def analyze_communities(db: Session):
    """
    Returns high-level stats about communities globally across recent data.
    """
    network = build_social_network(db, limit=2000)
    
    community_stats = {}
    for node in network["nodes"]:
        c_id = node["community"]
        if c_id not in community_stats:
            community_stats[c_id] = {
                "id": c_id,
                "member_count": 0,
                "key_nodes": [],
                "total_centrality": 0.0
            }
            
        community_stats[c_id]["member_count"] += 1
        community_stats[c_id]["total_centrality"] += node["centrality"]
        
        # Keep top 3 central nodes
        community_stats[c_id]["key_nodes"].append({
            "label": node["label"], 
            "centrality": node["centrality"]
        })
        
    # Sort and trim key nodes
    results = []
    for c_id, stats in community_stats.items():
        stats["key_nodes"] = sorted(stats["key_nodes"], key=lambda x: x["centrality"], reverse=True)[:5]
        # Format for output
        stats["key_nodes"] = [k["label"] for k in stats["key_nodes"]]
        results.append(stats)
        
    # Sort communities by member count
    results = sorted(results, key=lambda x: x["member_count"], reverse=True)
    return results
