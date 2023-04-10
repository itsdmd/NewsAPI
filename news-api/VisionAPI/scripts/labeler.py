import os
import io
from dotenv import load_dotenv
from google.cloud import vision

dotenv_path = os.path.join(os.path.dirname(__file__), '../../.env')
load_dotenv(dotenv_path)

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.environ.get(
    'VISION_API_PATH')

client = vision.ImageAnnotatorClient()
# print(client)

NORMED_DIR = os.path.join(os.path.dirname(__file__), '../img/test/')

# Number of lines equals to the current quota. Each time an image is labeled, a line is added to this file with a '.' character.
QUOTA = 900
QUOTA_FILE = os.path.join(os.path.dirname(__file__), '../.quota')


def detect_labels(path):
    # Detects labels in the file.

    # If quota is reached/exceeded, abort
    if len(open(QUOTA_FILE).readlines()) >= QUOTA:
        print('Quota reached. Aborting.')
        return

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.label_detection(image=image)
    labels = response.label_annotations

    with open(QUOTA_FILE, 'a') as f:
        f.writelines('.')
        f.close()

    print('Labels:')
    for label in labels:
        print(label.description)


def label_images():
    for img in os.listdir(NORMED_DIR):
        detect_labels(os.path.join(NORMED_DIR, img))


label_images()
