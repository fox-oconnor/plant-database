import csv
from flask import Flask, request

app = Flask(__name__)

def load_plants():
	with open('plants.csv', newline='', encoding='utf-8') as f:
		plants = list(csv.DictReader(f))
	for i, plant in enumerate(plants, start=1):
		plant.setdefault('id', i)
	return plants  

PLANTS = load_plants()

@app.route('/plants')
def plants():
	page = int(request.args.get('page', 1))
	per_page = int(request.args.get('per_page', 10))
	start = (page - 1) * per_page
	end = start + per_page
	return {
		'plants': PLANTS[start:end],
		'page': page,
		'per_page': per_page,
		'total': len(PLANTS)
		}

@app.route('/plants/search')
def search_plants():
	q = request.args.get('q', '').lower()
	matches = [p for p in PLANTS 
				if q in str(p.get('commonName', '')).lower()
			    or q in str(p.get('scientificName', '')).lower()]
	return {'plants' : matches}

@app.route('/plants/<int:plant_id>')
def one_plant(plant_id):
	for plant in PLANTS:
		if plant['id'] == plant_id:
			return plant
	return {'error': 'Plant not found'}, 404



app.run(debug=True, port=5001)