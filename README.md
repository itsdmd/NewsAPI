# Vietnamese News API

**Crawl, scrape, store and serve news articles from 3 of the most popular Vietnamese news websites: _[VnExpress](https://vnexpress.net/)_, _[Tuoi Tre](https://tuoitre.vn/)_ and _[Thanh Nien](https://thanhnien.vn/)_.**

> _**Disclaimer:**_ The main purpose of this project is to help me learn more about web scraping, data engineering and REST API. According to the Terms of Service of most news websites, redistributing articles' content is NOT allowed. I am not responsible and do not endorse any misuse of the tool or data retrieved using it. The RapidAPI endpoint only serves the metadata of the articles, not their content.

## Table of Contents

- [API Documentation](#api-documentation)
- [Run locally](#run-locally)
    - [Set up](#set-up)
    - [Usage](#usage)
        - [Run the API server](#run-the-api-server)
        - [Crawl and scrape articles](#crawl-and-scrape-articles)


## API Documentation

Visit [RapidAPI Hub Listing](https://rapidapi.com/itsdmd/api/vietnamese-news) of this API for usage and demo of the endpoint.

The API provide the following metadata:

- URL
- Title
- Description
- Category
- Topic tags\*
    - Title
    - URL
- Authors’ detail
    - Name
    - Profile URL\*
- Publish date
    - Day, month, year, hour, minute as padded string (“01”, “10”, etc.)
    - ISO Date (yyyy-mm-ddThh:mm:00Z)

> \*: Can be empty due to website's structure.

The news served by the API are mostly related to politic, business and civic events. Database will be updated hourly.

## Run locally

### Set up

1. This project use [MongoDB](https://www.mongodb.com/) as the database engine. You can either install it [locally](https://www.mongodb.com/docs/manual/installation/) or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Log in and create a new database.

2. **Node.js v18.7.0** & **npm v9.6.2** or higher must be installed on your machine.
    - [Windows](https://nodejs.org/en/download/package-manager#windows-1)
    - [macOS](https://nodejs.org/en/download/package-manager#macos)
    - [Other](https://nodejs.org/en/download/package-manager)

3. Clone this repository and install the dependencies

    ```bash
    git clone https://github.com/itsdmd/VietnameseNewsAPI.git
    cd ./VietnameseNewsAPI/news-api
    npm install
    ```

4. Create `.env` file inside `news-api` directory and add the following environment variables

    ```bash
    # ./news-api/.env

    # MongoDB connection string
    DATABASE_URL="mongodb://<username>:<password>@<host>/<databaseName>?authSource=admin"

    # Default port for the API server
    PORT=3000
    ```

### Usage

#### Run the API server

```bash
npm start
```

#### Crawl and scrape articles

1. Open [refetch.js](./news-api/src/scripts/refetch.js).
2. Scroll to the bottom of the file.
3. Change the value of the last argument of the functions.
    - The value is the number of pages to crawl to get the articles' URL. Each page contains 15-20 URLs.
    - In the example below, the script will crawl first 7 pages of the latest articles from [tuoitre.vn](https://tuoitre.vn/) (which is around 140 articles) and save them to the database.

    ```javascript
    // ./news-api/src/scripts/refetch.js
    
    await scrape("tt-vn", "https://tuoitre.vn/timeline/3/", "https://tuoitre.vn/timeline/3/trang-1.htm", 7);
    ```

    > :warning: **Warning:** Please do not use a large number. It can cause the website to block your IP address for suspicious activity. You can alter the third argument of the function to start from a specific page.

4. Run the script

    ```bash
    npm run refetch
    ```
