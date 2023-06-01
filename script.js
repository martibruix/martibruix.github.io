navigator.mediaDevices.getUserMedia({ video: true })
  .then(function (stream) {
    var video = document.getElementById('video');
    video.srcObject = stream;
    video.play();
  })
  .catch(function (error) {
    console.log('Error al acceder a la cámara: ' + error);
  });

function capture() {
  var video = document.getElementById('video');
  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  var image = new Image();  // Crea un nuevo objeto de imagen
  image.onload = function() {  // Espera a que la imagen se cargue
    buscar_alimento(image)
      .then(function(result) {
        if (result[0] === 1) {
          localStorage.setItem('productData', JSON.stringify(result[1]));
          redirectToResult();
        } else {
          console.log('Error en buscar_alimento: ' + result[1]);
        }
      })
      .catch(function(error) {
        console.log('Error en buscar_alimento: ' + error);
      });
  };
  image.src = canvas.toDataURL('image/png');  // Asigna la URL de datos como origen de la imagen
}

function redirectToResult() {
  window.location.href = 'result.html';
}