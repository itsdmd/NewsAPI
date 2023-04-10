import os
import io
import pymongo
import requests

from dotenv import load_dotenv
from tqdm import tqdm  # progress bar
from PIL import Image

dotenv_path = os.path.join(os.path.dirname(__file__), '../../.env')
load_dotenv(dotenv_path)

DATABASE_URL = os.environ.get('DATABASE_URL')
COLLECTION_NAME = DATABASE_URL.split('/')[-1].split('?')[0]

CLIENT = pymongo.MongoClient(DATABASE_URL)
DB = CLIENT[COLLECTION_NAME]
TT = DB["tt_vn_articles"]
TN = DB["tn_vn_articles"]
VNX = DB["vnx_vn_articles"]
DI = DB["downloaded_images"]
# print(TT.count_documents({}))

DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), '../img/')


def url_downloaded(url):
    return DI.find_one({"url": url})


def get_img_urls(col, offset=0, limit=0):
    # pipeline is recommended since aggregate() doesn't accept empty objects
    pipeline = [
        # split each content subdocument into a document
        {"$unwind": "$content"},
        # filter out content subdocuments that are not images
        {
            "$match": {
                "$and": [
                    {"content.type": "image"},
                    {"content.attributes.src": {"$exists": True}},
                ]
            }
        },
        # project only the image's url field
        {
            "$project": {
                "metadata.url": 1,
                "content.attributes.src": 1
            }
        }
    ]

    if offset:
        pipeline.append({"$skip": offset})

    if limit:
        pipeline.append({"$limit": limit})

    img_urls = []

    for subdoc in tqdm(col.aggregate(pipeline), unit=" url", desc="Download images"):
        parent_url = subdoc["metadata"]["url"]
        url = subdoc["content"]["attributes"][0]["src"]

        if not url_downloaded(url):
            img_urls.append({
                "parent_url": parent_url,
                "url": url
            })

    return img_urls


def download_img(urls):
    if len(urls) == 0:
        return

    for entry in tqdm(urls, unit=" url", desc="Download images"):
        # print("Downloading " + url.split('/')[-1])

        if url_downloaded(entry["url"]):
            # print("Image already downloaded.")
            continue

        filename = entry["url"].split('/')[-1]
        if os.path.exists(DOWNLOAD_DIR + filename):
            # print("File already exists.")
            continue

        response = requests.get(entry["url"]).content
        with open(DOWNLOAD_DIR + filename, 'wb') as f:
            f.write(response)

        f.close()

        DI.insert_one(entry)


def normalize_img():
    for filename in tqdm(os.listdir(DOWNLOAD_DIR), unit=" img", desc="Normalize images"):
        try:
            img = Image.open(DOWNLOAD_DIR + filename)
            img.thumbnail((640, 480))
            img.save(DOWNLOAD_DIR + "normalized/" +
                     filename, optimize=True, quality=30)
        except:
            print("Error processing " + filename)
            continue


download_img(get_img_urls(TN, limit=100))
normalize_img()
