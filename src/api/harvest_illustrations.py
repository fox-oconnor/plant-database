import requests
import time
import re
import csv

API = 'https://commons.wikimedia.org/w/api.php'
HEADERS = {'User-Agent': 'PlantDatabase/1.0 (student project)'}

def api_get(params, retries=4):
    for attempt in range(retries):
        r=requests.get(API, params=params, headers=HEADERS)
        if r.status_code == 429:
            wait = 10 * (attempt + 1)
            print(f" rate limited, waiting {wait}s...")
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r
    r.raise_for_status()


def search_illustrations(scientific_name, limit=5):
    params = {
        'action':'query',
        'format': 'json',
        'list':'search',
        'srsearch': f'"{scientific_name}" botanical illustration filetype:bitmap',
        'srnamespace': 6,
        'srlimit': limit,
    }
    r = api_get(params)
    return [item['title'] for item in r.json()['query']['search']]

def get_file_info(title):
    params = {
        'action': 'query',
        'format':'json',
        'titles': title,
        'prop': 'imageinfo',
        'iiprop': 'url|extmetadata',
        'iiurlwidth': 500,
    }
    r = api_get(params)
    pages = r.json()['query']['pages']
    return next(iter(pages.values()))['imageinfo'][0]

def clean_html(s):
    return re.sub(r'<[^>]+>', '', s or '').strip()

def pick_illustration(scientific_name):
    for title in search_illustrations(scientific_name):
        info = get_file_info(title)
        meta = info.get('extmetadata', {})
        license = clean_html(meta.get('LicenseShortName', {}).get('value', ''))
        credit = clean_html(meta.get('Artist', {}).get('value', ''))
        if not credit or 'unknown' in credit.lower():
            credit = 'Unknown'
        if 'public domain' not in license.lower():
            continue
        return{
            'illustrationImg' : info.get('thumburl') or info['url'],
            'illustrationCredit': credit,
            'illustrationLicense': license,
        }
    return None

def harvest():
    with open('plants.csv', newline='', encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f))
    fields = rows[0].keys()

    for row in rows:
        if row.get('illustrationImg'):
            continue
        name = (row.get('scientificName') or '').strip()
        if not name:
            print(f" skipping {row.get('commonName')}:no scientific name")
            continue
        try:
            result = pick_illustration(name)
        except Exception as e:
            print(f"{name}: error ({e}), skipping")
            continue
        if result:
            row.update(result)
            print(f"{name}: {result['illustrationCredit']}")
        else:
            print(f"{name}: no illustration found")

    with open('plants.csv', 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

if __name__ == '__main__':
    harvest()
