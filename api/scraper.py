import requests
from bs4 import BeautifulSoup
import csv, time 
    
HEADERS = {'User-Agent': 'Mozilla/5.0 (plant research project)'}
FIELD_MAP = {
	'USDA Plant Hardiness Zone' : 'hardiness',
	'Maintenance' : 'careLevel',
	'Recommended Propagation Strategy' : 'propagation'
}

def request(url):
    r = requests.get(url, headers=HEADERS)
    return r

def extract(page):
    soup = BeautifulSoup(page.content, 'html.parser')
    data = {}
    for dt in soup.find_all('dt'):
        label = dt.get_text(strip=True).rstrip(':')
        dd = dt.find_next_sibling('dd')
        if dd:
            data[label] = dd.get_text(strip=True)
    return data 
    		
def transform(raw):
	return {FIELD_MAP[k]: v for k, v in raw.items() if k in FIELD_MAP}

def slugify(name):
	return name.lower().replace(' ', '-')

with open('plants.csv', newline='', encoding='utf-8-sig') as f:
	plants = list(csv.DictReader(f))

for p in plants:
	slug = slugify(p['scientificName'])
	url = f'https://plants.ces.ncsu.edu/plants/{slug}/'
	try:
		page = request(url)
		if page.status_code == 404:
			print(f" x {p['scientificName']} (no page)")
			continue
		p.update(transform(extract(page)))
		print(f"  ✓ {p['scientificName']}")
	except Exception as e:
		print(f" x {p['scientificName']} ({e})")
	time.sleep(1.5)

fieldnames = list(plants[0].keys())
for p in plants:
	for k in p.keys():
		if k not in fieldnames:
			fieldnames.append(k)

with open('plants.csv', 'w', newline='', encoding='utf-8') as f:
	w = csv.DictWriter(f, fieldnames=fieldnames)
	w.writeheader()
	w.writerows(plants)



