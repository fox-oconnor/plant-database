import csv
from flask import Flask, request
from flask_cors import CORS
import os
ADMIN_KEY = os.environ.get('PLANT_ADMIN_KEY', 'dev-only-key')

app = Flask(__name__)
CORS(app)

LIST_FIELDS = ['sunlight']

def load_plants(path='plants.csv'):
	with open(path, newline='', encoding='utf-8-sig') as f:
		plants = list(csv.DictReader(f))
	for i, plant in enumerate(plants, start=1):
		plant.setdefault('id', i)
		for field in LIST_FIELDS:
			val = plant.get(field, '')
			if isinstance(val, str):
				plant[field] = [s.strip() for s in val.split(',') if s.strip()]
	return plants

PLANTS = load_plants('plants.csv')

try:
	SUBMISSIONS = load_plants('user_plants.csv')
except FileNotFoundError:
	SUBMISSIONS = []

@app.route('/plants')
def plants():
	try:
		page = int(request.args.get('page', 1))
		per_page = int(request.args.get('per_page', 10))
	except ValueError:
		return{'error': 'page and per_page must be numbers'}, 400
	if page < 1 or per_page < 1:
		return{'error': 'page and per_page must be positive'}, 400
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
		if str(plant['id']) == str(plant_id):
			return plant
	return {'error': 'Plant not found'}, 404

def save_submissions():
	if not SUBMISSIONS:
		return
	with open('user_plants.csv', 'w', newline='', encoding='utf-8') as f:
		writer = csv.DictWriter(f, fieldnames=SUBMISSIONS[0].keys())
		writer.writeheader()
		for plant in SUBMISSIONS:
			row = {k: (', '.join(v) if isinstance(v, list) else v)
				for k, v in plant.items()}
			writer.writerow(row)

@app.route('/plants', methods=['POST'])
def add_plant():
	data = request.get_json()
	if not data or not data.get('commonName') or not data.get('scientificName'):
		return {'error': 'commonName and scientificName are required'}, 400
	new_plant = {
		'id': f"u{len(SUBMISSIONS) +1 }",
		'status': 'pending',
		**data
		}
	SUBMISSIONS.append(new_plant)
	save_submissions()
	return new_plant, 201

def save_plants():
    fields = list(PLANTS[0].keys())
    for extra in ('status', 'submittedBy'):
        if extra not in fields:
            fields.append(extra)
    with open('plants.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for plant in PLANTS:
            row = {k: (', '.join(v) if isinstance(v, list) else v)
                for k, v in plant.items()}
            writer.writerow(row)

@app.route('/plants/submissions')
def list_submissions():
    return {'submissions': SUBMISSIONS}

@app.route('/plants/submissions/<sub_id>/approve', methods=['POST'])
def approve_submission(sub_id):
    if request.headers.get('X-Admin-Key') != ADMIN_KEY:
        return {'error': 'Forbidden'}, 403
    sub = next(( s for s in SUBMISSIONS if s['id'] == sub_id), None)
    if not sub:
        return {'error': 'Submission not found'}, 404
    official = {**sub, 'id': str(max(int(p['id']) for p in PLANTS) + 1), 'status': 'approved'}

    PLANTS.append(official)
    SUBMISSIONS.remove(sub)
    save_plants()
    save_submissions()
    return official, 200



app.run(debug=True, port=5001)
