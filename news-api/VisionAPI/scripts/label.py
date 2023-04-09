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
