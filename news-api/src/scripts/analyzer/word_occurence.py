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
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "[",
    "\\",
    "]",
    "^",
    "_",
    "`",
    "{",
    "|",
    "}",
    "~",
    "”",
    "“",
    "’",
    "‘",
    "…",
    "–",
    "—",
    "•",
    "·",
    "»",
    "«",
    "©",
    "®",
    "™",
    "§",
    "¶",
    "•",
    "‹",
    "›",
]


def get_all_words(colName="TN", filter=[], limitArticles=-1):
    pipeline = [
        # sort by isodate, descending
        {
            "$sort": {
                "metadata.pubdate.isodate": -1
            }
        },
        # filter articles
        {
            "$match": {
                "$and": filter,
            }
        }
    ]

    pipeline.append(
        # limit the number of documents
        {"$limit": limitArticles}) if (limitArticles > 0) else None

    pipeline.extend([
        # split each content subdocument into a document
        {
            "$unwind": "$content"
        },
        # take only text content
        {
            "$match": {
                "$and": [{
                    "content.type": "text"
                }, {
                    "content.content": {
                        "$exists": True
                    }
                }],
            }
        },
        # project only the text field
        {
            "$project": {
                "content.content": 1
            }
        }
        # text_content_filter
    ])

    if (colName == "TN"):
        col = TN
    elif (colName == "TT"):
        col = TT
    elif (colName == "VNX"):
        col = VNX

    all_words = []
    for doc in tqdm(col.aggregate(pipeline)):
        words = doc["content"]["content"].lower().split(" ")

        # remove punctuation
        words = [
            w.translate(str.maketrans("", "", "".join(PUNCTUATION))).strip()
            for w in words
        ]

        og_len = len(words)
        cur_len = og_len

        for i in range(og_len):
            # if blank or numeric, remove
            if ((words[i] == "") or (words[i].isdigit())):
                words.remove(words[i])
                cur_len -= 1

            if (cur_len <= og_len):
                break

        if (len(words) > 0):
            all_words.extend(words)

    return all_words


def get_word_single_occ(array, mode="default", limit=-1):
    """Count the number of occurences of single words"""
    result = pd.Series(array).value_counts(
        normalize=True) if (limit <= 0) else pd.Series(array).value_counts(
            normalize=True)[:limit]

    if (mode == "default"):
        return result
    elif (mode == "json"):
        return result.to_json(orient="index", force_ascii=False)
    elif (mode == "csv"):
        return result.to_csv(sep=",",
                             encoding="utf-8",
                             index=True,
                             header=False)


def get_word_pair_occ(array, mode="default", limit=-1):
    """Count the number of occurences of word pairs

    Reference: https://stackoverflow.com/a/54309692
    """
    a, b = itertools.tee(array)
    next(b, None)

    result = pd.Series(zip(a, b)).value_counts(
        normalize=True) if (limit <= 0) else pd.Series(zip(a, b)).value_counts(
            normalize=True)[:limit]

    if (mode == "default"):
        return result.sort_values(ascending=False)
    elif (mode == "json"):
        return result.to_json(orient="index", force_ascii=False)
    elif (mode == "csv"):
        return result.to_csv(sep=",",
                             encoding="utf-8",
                             index=True,
                             header=False)


def write_to_file(file_dir, content, format="csv"):
    """Write the analytics to a file, including the content and its number of occurences"""
    if (format == "csv"):
        content.to_csv(file_dir,
                       sep=",",
                       encoding="utf-8",
                       index=True,
                       header=False)
    elif (format == "json"):
        content.to_json(file_dir, orient="index", force_ascii=False)
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
        {
            "metadata.pubdate.day": day
        },
        {
            "metadata.pubdate.month": month
        },
        {
            "metadata.pubdate.year": year
        },
    ]

    # get all words from articles published today
    limit = 50
    words = get_all_words("TT", filter, limit)
    words.extend(get_all_words("TN", filter, limit))
    words.extend(get_all_words("VNX", filter, limit))

    # top 50 words - csv
    ws_occ = get_word_single_occ(words)
    ws_file_dir = os.path.join(
        os.path.dirname(__file__), "./data/word_single_occ_top_" + str(limit) +
        "_" + year + "-" + month + "-" + day + ".csv")
    write_to_file(ws_file_dir, ws_occ, "csv")

    # top 50 words - json
    ws_file_dir = os.path.join(
        os.path.dirname(__file__), "./data/word_single_occ_top_" + str(limit) +
        "_" + year + "-" + month + "-" + day + ".json")
    write_to_file(ws_file_dir, ws_occ, "json")

    # top 50 word pairs - csv
    wp_occ = get_word_pair_occ(words)
    wp_file_dir = os.path.join(
        os.path.dirname(__file__), "./data/word_pair_occ_top_" + str(limit) +
        "_" + year + "-" + month + "-" + day + ".csv")
    write_to_file(wp_file_dir, wp_occ, "csv")

    # top 50 word pairs - json
    wp_file_dir = os.path.join(
        os.path.dirname(__file__), "./data/word_pair_occ_top_" + str(limit) +
        "_" + year + "-" + month + "-" + day + ".json")
    write_to_file(wp_file_dir, wp_occ, "json")


if __name__ == "__main__":
    main()
