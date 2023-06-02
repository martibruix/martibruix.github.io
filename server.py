from flask import Flask, render_template, request
from funciones import funciones
import cv2
import numpy as np

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/result', methods=['POST'])
def result():
  file = request.files['image']
  img = cv2.imdecode(np.fromstring(file.read(), np.uint8), cv2.IMREAD_UNCHANGED)
  error, product_data = funciones.buscar_alimento(img)
  if (error == 1):
    product_data = funciones.filtrar_datos(product_data)
  return render_template('result.html', error = error, product_data = product_data)

if __name__ == '__main__':
  app.run(debug=True)