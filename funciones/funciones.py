import cv2
import requests
import base64
import json


def buscar_alimento(imagen):
    content = enfocar_barras(imagen)
    if (content == 0):
        return 0, "Error en enfocar_barras"

    if (len(content) == 0):
        return 0, "No se ha detectado código de barras en la imagen"
    
    x = imagen.shape[0]
    y = imagen.shape[1]
    x_fact1 = content[0]['bounding_box']['normalized_vertices'][0]['y']
    x_fact2 = content[0]['bounding_box']['normalized_vertices'][2]['y']
    y_fact1 = content[0]['bounding_box']['normalized_vertices'][0]['x']
    y_fact2 = content[0]['bounding_box']['normalized_vertices'][1]['x']
    im_barras = imagen[int(x * x_fact1):int(x * x_fact2), int(y * y_fact1):int(y * y_fact2), :]    

    barcode = detector_barras(im_barras)
    if (barcode == 0):
        return 0, "Error en detector_barras"
    
    product_data = open_food_search(barcode)
    if (product_data == 0):
        return 0, "Error en informacion-alimento"
    if (product_data['status_verbose'] != 'product not found'):
        return 1, product_data
    

    mov_esquerra = y*(y_fact2 - y_fact1)*0.15
    im_barras = imagen[int(x * x_fact1):int(x * x_fact2), int((y * y_fact1) - mov_esquerra):int(y * y_fact2), :]

    barcode = detector_barras(im_barras)
    if (barcode == 0):
        return 0, "Error en detector_barras"
    
    product_data = open_food_search(barcode)
    if (product_data == 0):
        return 0, "Error en informacion-alimento"
    if (product_data['status_verbose'] != 'product not found'):
        return 1, product_data
    

    mov_baix = x * (x_fact2 - x_fact1) * 0.1
    im_barras = imagen[int(x * x_fact1):int((x * x_fact2) + mov_baix), int((y * y_fact1) - mov_esquerra):int(y * y_fact2), :]

    barcode = detector_barras(im_barras)
    if (barcode == 0):
        return 0, "Error en detector_barras"
    
    product_data = open_food_search(barcode)
    if (product_data == 0):
        return 0, "Error en informacion-alimento"
    if (product_data['status_verbose'] != 'product not found'):
        return 1, product_data
    
    return 0, "Producto no encontrado"


def enfocar_barras(imagen):
    url='https://us-central1-true-node-383615.cloudfunctions.net/enfocar_barras'

    success, im_buf_arr = cv2.imencode(".jpg", imagen)
    im_bytes = im_buf_arr.tobytes()
    b64_string = base64.b64encode(im_bytes).decode('utf-8')

    data = {'imagen': b64_string}

    response = requests.post(url, json=data)

    if response.status_code == 200:
        return json.loads(response.content)
    else:
        return 0


def detector_barras(imagen):
    url='https://us-central1-true-node-383615.cloudfunctions.net/detector_barras'

    success, im_buf_arr = cv2.imencode(".jpg", imagen)
    im_bytes = im_buf_arr.tobytes()
    b64_string = base64.b64encode(im_bytes).decode('utf-8')

    data = {'imagen': b64_string}

    response = requests.post(url, json=data)

    if response.status_code == 200:
        return response.text
    else:
        return 0


def open_food_search(barcode):
    url = 'https://us-central1-true-node-383615.cloudfunctions.net/informacion-alimento'

    data = {'codibarres': barcode}

    response = requests.post(url, json=data)

    if response.status_code == 200:
        return json.loads(response.content)
    else:
        return 0



def filtrar_datos(datos):
    datos_filtrados = {}

    datos_filtrados['image_url'] = datos['product']['image_url']
    datos_filtrados['product_name'] = datos['product']['product_name']

    datos_filtrados['allergens_hierarchy'] = []
    for alergeno in datos['product']['allergens_hierarchy']:
        datos_filtrados['allergens_hierarchy'].append(alergeno.split(":")[1])
    datos_filtrados['traces'] = []
    for alergeno in datos['product']['traces_hierarchy']:
        datos_filtrados['traces'].append(alergeno.split(":")[1])
    datos_filtrados['nutriscore_grade'] = datos['product']['nutriscore_grade'].upper()

    if 'en:vegetarian' in datos['product']['labels_tags']:
        datos_filtrados['vegetarian'] = "Sí"
    else:
        datos_filtrados['vegetarian'] = "No"

    if 'en:vegan' in datos['product']['labels_tags']:
        datos_filtrados['vegan'] = "Sí"
    else:
        datos_filtrados['vegan'] = "No"

    if 'en:no-gluten' in datos['product']['labels_tags']:
        datos_filtrados['gluten'] = "No"
    else:
        datos_filtrados['gluten'] = "Sí"

    return datos_filtrados

