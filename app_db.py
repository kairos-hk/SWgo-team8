from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image
import requests
import io
import base64
import numpy as np
from keras.models import load_model
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

model = load_model("keras_Model.h5", compile=False)
class_names = open("labels.txt", "r").readlines()

endpoint = "https://naveropenapi.apigw.ntruss.com/map-static/v2/raster"
headers = {
    "X-NCP-APIGW-API-KEY-ID": 'j1qkg167rs',
    "X-NCP-APIGW-API-KEY": 'ikyZLyinbauI9Wa2iQdQn1vtHLy6zxhggFX3BVyq',
}

client = MongoClient('mongodb+srv://admin:1234@study0.iz43gga.mongodb.net/?retryWrites=true&w=majority')
db = client['forum']
collection = db['post']

@app.route('/map', methods=['POST'])
def get_map_image():
    try:
        data = request.get_json()
        lon, lat = str(data['longitude']), str(data['latitude'])

        _center = f"{lon},{lat}"
        _level = 18
        _w, _h = 640, 640
        _maptype = "satellite"
        _format = "png"
        _scale = 1
        _markers = f"type:d|size:mid|pos:1 1|color:red"
        _lang = "ko"
        _public_transit = False
        _dataversion = ""

        url = f"{endpoint}?center={_center}&level={_level}&w={_w}&h={_h}&maptype={_maptype}&format={_format}&scale={_scale}&markers={_markers}&lang={_lang}&public_transit={_public_transit}&dataversion={_dataversion}"

        res = requests.get(url, headers=headers)
        image_data = io.BytesIO(res.content)

        img = Image.open(image_data)
        img = img.resize((224, 224))
        img_array = np.array(img)
        img_array = img_array.reshape((1, 224, 224, 3))
        normalized_img_array = (img_array.astype(np.float32) / 127.5) - 1

        predictions = model.predict(normalized_img_array)
        class_index = np.argmax(predictions)
        confidence_score = float(predictions[0, class_index])
        class_name = class_names[class_index].strip()
        
        
        if confidence_score >= 0.8:
            condition_type = 'eme'
        else:
            condition_type = 'nor'
        
        condition_score = confidence_score*100
        
        if class_name == '1 1':
            db_data = {
                'longitude': lon,
                'latitude': lat,
                'confidence_score': confidence_score,
                'condition_type': condition_type,
                'condition_score' : condition_score
            }
            collection.insert_one(db_data)
        
        if class_name == '1 1':
            class_name1 = 1
        
        if class_name == '0 0':
            class_name1 = 0

        return jsonify({"class_name": class_name1, "longitude": lon, "latitude": lat,"confidence_score": confidence_score, "condition_type": condition_type, "condition_score" : condition_score})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/list')
def get_image_list():
    data = list(collection.find({}, {'_id': 0}))
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
