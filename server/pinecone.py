from .config import PINECONE_API_KEY, PINECONE_INDEX_NAME
from pinecone import Pinecone, ServerlessSpec


def prepare_index():
    pc = Pinecone(api_key=PINECONE_API_KEY)
    if PINECONE_INDEX_NAME in pc.list_indexes().names():
        pc.delete_index(PINECONE_INDEX_NAME)
    pc.create_index(name=PINECONE_INDEX_NAME, metric="cosine", dimension=1024, spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    ))


def add_to_index(id, text):
    pc = Pinecone(api_key=PINECONE_API_KEY)
    pinecone_index = pc.Index(name=PINECONE_INDEX_NAME)
    embedding = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=[text],
        parameters={
            "input_type": "passage"
        }
    )
    pinecone_index.upsert(vectors=[(str(id), embedding[0].values)])


def query_index(text):
    pc = Pinecone(api_key=PINECONE_API_KEY)
    pinecone_index = pc.Index(name=PINECONE_INDEX_NAME)
    embedding = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=[text],
        parameters={
            "input_type": "passage"
        }
    )

    query_results = pinecone_index.query(
        vector=embedding[0].values,
        top_k=10,
        include_values=False,
        include_metadata=False
    )

    res = query_results.matches

    results_list = []
    for i in res:
        results_list.append({
            "id": i['id'],
            "score": i['score']
        })

    return results_list
