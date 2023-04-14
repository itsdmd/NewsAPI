import itertools
import os
import pymongo

# from collections import Counter
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from tqdm import tqdm  # progress bar

dotenv_path = os.path.join(os.path.dirname(__file__), "../../../.env")
load_dotenv(dotenv_path)

DATABASE_URL = os.environ.get("DATABASE_URL")
DATABASE_NAME = DATABASE_URL.split("/")[-1].split("?")[0]

CLIENT = pymongo.MongoClient(DATABASE_URL)
DB = CLIENT[DATABASE_NAME]
TT = DB["tt_vn_articles"]
TN = DB["tn_vn_articles"]
VNX = DB["vnx_vn_articles"]

PUNCTUATION = [
    "!", '"', "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
    ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|",
    "}", "~", "”", "“", "’", "‘", "…", "–", "—", "•", "·", "»", "«", "©", "®",
    "™", "§", "¶", "•", "‹", "›",
]


def get_all_words(col, filter=[], limit=-1):
    pipeline = [
        # sort by isodate, descending
        {"$sort": {"metadata.pubdate.isodate": -1}},
    ]
    
    pipeline.append(
        # limit the number of documents
        {"$limit": limit},
    ) if (limit > 0) else None
    
    filter.extend([
        {"content.type": "text"},
        {"content.content": {"$exists": True}}
    ])
    
    pipeline.extend([
        # split each content subdocument into a document
        {"$unwind": "$content"},
        # filter out content subdocuments that are not text
        {
            "$match": {
                "$and": filter,
            }
        },
        # project only the text field
        {
            "$project": {
                "content.content": 1
            }
        }
    ])

    all_words = []
    for doc in tqdm(col.aggregate(pipeline)):
        words = doc["content"]["content"].lower().split(" ")

        # remove punctuation
        words = [w.translate(str.maketrans(
            "", "", "".join(PUNCTUATION))).strip() for w in words]

        og_len = len(words)
        cur_len = og_len

        for i in range(og_len):
            if ((words[i] == "") or (words[i].isnumeric())):
                words.remove(words[i])
                cur_len -= 1

            if (cur_len <= og_len):
                break

        if (len(words) > 0):
            all_words.extend(words)

    return all_words


def get_word_single_freq(array):
    """Count the number of occurences of single words"""
    return pd.Series(array).value_counts()


def get_word_pair_freq(array):
    """Count the number of occurences of word pairs
    
    Reference: https://stackoverflow.com/a/54309692
    """
    a, b = itertools.tee(array)
    next(b, None)
    return pd.Series(zip(a, b)).value_counts()


def write_to_file(file_dir, content, format="csv", limit=-1):
    """Write the analytics to a file, including the content and its number of occurences"""
    if (limit > 0):
        content = content[:limit]

    if (format == "csv"):
        content.to_csv(file_dir,
                       sep=",",
                       encoding="utf-8",
                       index=True,
                       header=False)
    elif (format == "json"):
        content.to_json(file_dir,
                        orient="index",
                        force_ascii=False,
                        date_format="iso")
    elif (format == "txt"):
        with open(file_dir, "w") as f:
            for word, freq in content.items():
                f.write(f"{word},{freq}\n")
        f.close()


def main():
    # get local time
    now = datetime.now()
    day = now.strftime("%d")
    month = now.strftime("%m")
    year = now.strftime("%Y")
    
    # construct filter for articles published today
    filter = [
        {"metadata.pubdate.day": day},
        {"metadata.pubdate.month": month},
        {"metadata.pubdate.year": year},
    ]
    
    # get all words from articles published today
    words = get_all_words(TT, filter)
    words.extend(get_all_words(TN, filter))
    words.extend(get_all_words(VNX, filter))
    
    # top 50 words - csv
    ws_limit = 50
    ws_occ = get_word_single_freq(words)
    ws_file_dir = os.path.join(os.path.dirname(
        __file__), "./data/word_single_occ_top_" + str(ws_limit) + "_" + year + "-" + month + "-" + day + ".csv")
    write_to_file(ws_file_dir, ws_occ, "csv", ws_limit)
    
    # top 50 words - json
    ws_file_dir = os.path.join(os.path.dirname(
        __file__), "./data/word_single_occ_top_" + str(ws_limit) + "_" + year + "-" + month + "-" + day + ".json")
    write_to_file(ws_file_dir, ws_occ, "json", ws_limit)

    # top 50 word pairs - csv
    wp_limit = 50
    wp_occ = get_word_pair_freq(words)
    wp_file_dir = os.path.join(os.path.dirname(
        __file__), "./data/word_pair_occ_top_" + str(wp_limit) + "_" + year + "-" + month + "-" + day + ".csv")
    write_to_file(wp_file_dir, wp_occ, "csv", wp_limit)

    # top 50 word pairs - json
    wp_file_dir = os.path.join(os.path.dirname(
        __file__), "./data/word_pair_occ_top_" + str(wp_limit) + "_" + year + "-" + month + "-" + day + ".json")
    write_to_file(wp_file_dir, wp_occ, "json", wp_limit)


if __name__ == "__main__":
    main()
