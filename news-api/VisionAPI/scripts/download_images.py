import os
import io
import pymongo
import requests
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '../../.env')
load_dotenv(dotenv_path)

DATABASE_URL = os.environ.get('DATABASE_URL')
COLLECTION_NAME = DATABASE_URL.split('/')[-1].split('?')[0]

CLIENT = pymongo.MongoClient(DATABASE_URL)
DB = CLIENT[COLLECTION_NAME]
TT = DB["tt_vn_articles"]
TN = DB["tn_vn_articles"]
VNX = DB["vnx_vn_articles"]
# print(TT.count_documents({}))

DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), '../img/')


def get_img_urls(col, limit=0):
    # Get image urls from a collection.

    pipeline = [
        # Split each content block into a document
        {"$unwind": "$content"},
        # Filter out content blocks that are not images
        {"$match":  {"content.attributes.src": {"$exists": True}}},
        # Project only the image's url
        {"$project": {"content.attributes.src": 1}}
    ]

    if limit:
        pipeline.append({"$limit": limit})

    img_urls = []

    imageContentBlocks = col.aggregate(pipeline)

    for block in imageContentBlocks:
        img_urls.append((block["content"]["attributes"][0]["src"]))

    return img_urls


def download_img(url):
    # Download an image from a url and save it to a file.

    filename = url.split('/')[-1]

    response = requests.get(url).content
    with open(DOWNLOAD_DIR + filename, 'wb') as f:
        f.write(response)


# download_img(get_img_urls(TT, 5)[0])
