async function buscar_alimento(imagen) {
    let content = await enfocar_barras(imagen);
    if (content === 0) {
      return [0, "Error en enfocar_barras"];
    }
  
    if (content.length === 0) {
      return [0, "No se ha detectado código de barras en la imagen"];
    }
  
    let x = imagen.height;
    let y = imagen.width;
    let x_fact1 = content[0]['bounding_box']['normalized_vertices'][0]['y'];
    let x_fact2 = content[0]['bounding_box']['normalized_vertices'][2]['y'];
    let y_fact1 = content[0]['bounding_box']['normalized_vertices'][0]['x'];
    let y_fact2 = content[0]['bounding_box']['normalized_vertices'][1]['x'];

    let canvas = document.createElement('canvas');
    canvas.width = y * (y_fact2 - y_fact1);
    canvas.height = x * (x_fact2 - x_fact1);
    let context = canvas.getContext('2d');

    context.drawImage(
      imagen,
      y * y_fact1, // sourceX
      x * x_fact1, // sourceY
      y * (y_fact2 - y_fact1), // sourceWidth
      x * (x_fact2 - x_fact1), // sourceHeight
      0, // destinationX
      0, // destinationY
      y * (y_fact2 - y_fact1), // destinationWidth
      x * (x_fact2 - x_fact1) // destinationHeight
    );

    let im_barras = canvas.toDataURL('image/jpeg');
  
    let barcode = await detector_barras(im_barras);
    if (barcode === 0) {
      return [0, "Error en detector_barras"];
    }
  
    let product_data = await open_food_search(barcode);
    if (product_data === 0) {
      return [0, "Error en informacion-alimento"];
    }
    if (product_data['status_verbose'] !== 'product not found') {
      return [1, product_data];
    }
  
    let mov_esquerra = y * (y_fact2 - y_fact1) * 0.15;
    im_barras = imagen.subarray(
      x * x_fact1,
      x * x_fact2,
      y * y_fact1 - mov_esquerra,
      y * y_fact2,
      0,
      imagen.shape[2]
    );
  
    barcode = await detector_barras(im_barras);
    if (barcode === 0) {
      return [0, "Error en detector_barras"];
    }
  
    product_data = await open_food_search(barcode);
    if (product_data === 0) {
      return [0, "Error en informacion-alimento"];
    }
    if (product_data['status_verbose'] !== 'product not found') {
      return [1, product_data];
    }
  
    let mov_baix = x * (x_fact2 - x_fact1) * 0.1;
    im_barras = imagen.subarray(
      x * x_fact1,
      x * x_fact2 + mov_baix,
      y * y_fact1 - mov_esquerra,
      y * y_fact2,
      0,
      imagen.shape[2]
    );
  
    barcode = await detector_barras(im_barras);
    if (barcode === 0) {
      return [0, "Error en detector_barras"];
    }
  
    product_data = await open_food_search(barcode);
    if (product_data === 0) {
      return [0, "Error en informacion-alimento"];
    }
    if (product_data['status_verbose'] !== 'product not found') {
      return [1, product_data];
    }
  
    return [0, "Alimento no encontrado"];
  }
  

  async function enfocar_barras(imagen) {
    const url = 'https://us-central1-true-node-383615.cloudfunctions.net/enfocar_barras';
  
    const canvas = document.createElement('canvas');
    canvas.width = imagen.width;
    canvas.height = imagen.height;
    const context = canvas.getContext('2d');
    context.drawImage(imagen, 0, 0);
  
    const base64Image = canvas.toDataURL('image/jpeg');
  
    const data = { imagen: base64Image };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      return 0;
    }
  }
  
  
  async function detector_barras(imagen) {
    const url = 'https://us-central1-true-node-383615.cloudfunctions.net/detector_barras';
  
    const canvas = document.createElement('canvas');
    canvas.width = imagen.width;
    canvas.height = imagen.height;
    const context = canvas.getContext('2d');
    context.drawImage(imagen, 0, 0);
  
    const base64Image = canvas.toDataURL('image/jpeg');
  
    const data = { imagen: base64Image };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  
    if (response.ok) {
      const result = await response.text();
      return result;
    } else {
      return 0;
    }
  }
  
  
  async function open_food_search(barcode) {
    const url = 'https://us-central1-true-node-383615.cloudfunctions.net/informacion-alimento';
  
    const data = { codibarres: barcode };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      return 0;
    }
  }
  
  